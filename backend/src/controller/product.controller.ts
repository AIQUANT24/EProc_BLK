import { Request, Response } from "express";
import { sequelize } from "../config/db.js";
import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import Component from "../models/component.model.js";
import { User, AuditLog } from "../models/index.js";

// Helper functions to clean strings into strict numbers
const parseCurrency = (val: string | number) => {
  if (typeof val === "number") return val;
  return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
};

const parsePercentage = (val: string | number) => {
  if (typeof val === "number") return val;
  return parseFloat(val.replace("%", "")) || 0;
};

export const productController = {
  // --- CREATE PRODUCT & BULK INSERT COMPONENTS ---
  createProductWithBOM: async (req: Request, res: Response) => {
    const t = await sequelize.transaction();

    try {
      const supplier = await Supplier.findOne({
        where: { user_id: req.user?.id },
      });

      if (!supplier) {
        return res
          .status(403)
          .json({ success: false, message: "Supplier profile incomplete." });
      }

      const { name, category, ocrData } = req.body;

      // 1. Extract Metadata and Calculate Scores
      const metadata = ocrData.metadata;
      const totalCost = parseCurrency(metadata.total_cost);
      const dvaScore = parsePercentage(metadata.dva_score);

      const confidence = metadata.confidence_score
        ? parsePercentage(metadata.confidence_score)
        : null;
      const risk = metadata.risk_score
        ? parsePercentage(metadata.risk_score)
        : null;

      let classification = "Non-Local";
      if (dvaScore >= 50) classification = "Class I";
      else if (dvaScore >= 20) classification = "Class II";

      // 2. Create the Product
      const newProduct = await Product.create(
        {
          supplierId: supplier.id,
          name,
          category,
          estimatedCost: totalCost,
          dvaScore: dvaScore,
          classification,
          status: "under_review",
          confidence,
          risk,
        },
        { transaction: t },
      );

      // 3. Format Components from OCR Data
      const componentsToInsert = ocrData.data.map((item: any) => {
        const componentName = Object.keys(item.component)[0];
        const componentCost = parseCurrency(item.component[componentName]);
        const parsedPercentage = item.percent_of_total
          ? parsePercentage(item.percent_of_total)
          : 0;

        return {
          productId: newProduct.id,
          supplierId: supplier.id,
          name: item.supplier
            ? `${componentName} (Mfr: ${item.supplier})`
            : componentName,
          origin: item.origin,
          cost: componentCost,
          percentage: parsedPercentage,
        };
      });

      // 4. Bulk Insert Components
      await Component.bulkCreate(componentsToInsert, { transaction: t });

      // 5. Update Supplier Product Count
      await supplier.increment("products_count", { by: 1, transaction: t });

      // ✅ 6. CREATE AUDIT LOG (Inside the transaction to ensure strict compliance)
      if (req.user?.id) {
        await AuditLog.create(
          {
            event: "PRODUCT_CREATED",
            entity: "Product",
            entityId: newProduct.id,
            userId: req.user.id,
            details: {
              action: "Product and BOM registered via AI Extraction",
              dvaScore,
              classification,
            },
          },
          { transaction: t },
        );
      }

      // Commit the transaction
      await t.commit();

      return res.status(201).json({
        success: true,
        message: "Product and BOM processed successfully",
        product: newProduct,
      });
    } catch (error: any) {
      await t.rollback();
      console.error("BOM Processing Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to process BOM data" });
    }
  },

  // --- FETCH ALL PRODUCTS ---
  getProducts: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      let products = [];

      if (userRole === "supplier") {
        const supplier = await Supplier.findOne({
          where: { user_id: userId },
        });

        if (!supplier) {
          return res.status(200).json({
            success: true,
            products: [],
            message:
              "No supplier profile found, returning empty products list.",
          });
        }

        products = await Product.findAll({
          where: { supplierId: supplier.id },
          order: [["createdAt", "DESC"]],
        });
      } else {
        products = await Product.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Supplier,
              as: "supplier",
              attributes: ["id", "gst", "sector"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["fullName"],
                },
              ],
            },
          ],
        });
      }

      return res.status(200).json({
        success: true,
        products,
        message: "Products fetched successfully",
      });
    } catch (error: any) {
      console.error("Fetch Products Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  },

  // --- LOCK A PRODUCT FOR REVIEW ---
  submitBOM: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findOne({
        where: { user_id: req.user?.id },
      });
      if (!supplier)
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });

      const product = await Product.findOne({
        where: { id, supplierId: supplier.id },
      });
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      if (product.status !== "draft") {
        return res.status(400).json({
          success: false,
          message: "Product is already submitted or verified.",
        });
      }

      product.status = "under_review";
      await product.save();

      // ✅ CREATE AUDIT LOG
      if (req.user?.id) {
        await AuditLog.create({
          event: "PRODUCT_SUBMITTED",
          entity: "Product",
          entityId: product.id,
          userId: req.user.id,
          details: {
            action: "Supplier manually locked BOM for review.",
            previousStatus: "draft",
            newStatus: "under_review",
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "BOM submitted successfully",
        product,
      });
    } catch (error: any) {
      console.error("Submit BOM Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit BOM" });
    }
  },

  // --- VERIFY PRODUCT (PROCUREMENT ADMIN) ---
  verifyProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      if (req.user?.role === "supplier") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized. Only admins can verify products.",
        });
      }

      if (!status || !message) {
        return res.status(400).json({
          success: false,
          message: "Status and verification message are required.",
        });
      }

      const product = await Product.findByPk(id.toString());
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const previousStatus = product.status;

      // Update product status
      product.status = status; // "verified" or "non-compliant"

      // Save the JSON log into MySQL
      product.verificationLog = {
        message,
        status,
        timestamp: new Date().toISOString(),
        reviewedBy: req.user?.id,
      };

      await product.save();

      // ✅ CREATE AUDIT LOG
      if (req.user?.id) {
        await AuditLog.create({
          event:
            status === "verified" ? "PRODUCT_APPROVED" : "PRODUCT_REJECTED",
          entity: "Product",
          entityId: product.id,
          userId: req.user.id,
          details: {
            action: `Procurement admin marked product as ${status}`,
            previousStatus,
            newStatus: status,
            adminNotes: message,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product verification log saved successfully",
        product,
      });
    } catch (error: any) {
      console.error("Verify Product Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save verification log" });
    }
  },
};
