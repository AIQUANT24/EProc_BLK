import { Request, Response } from "express";
import { sequelize } from "../config/db.js";
import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import Component from "../models/component.model.js";

// Helper functions to clean OCR strings
const parseCurrency = (val: string) =>
  parseFloat(val.replace(/[^0-9.-]+/g, ""));
const parsePercentage = (val: string) => parseFloat(val.replace("%", ""));

export const productController = {
  createProductWithBOM: async (req: Request, res: Response) => {
    // We use a transaction so if a component fails to save, the product isn't created empty
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

      // 1. Extract Metadata and Calculate Classification
      const metadata = ocrData.metadata;
      const totalCost = parseCurrency(metadata.total_cost);
      const dvaScore = parsePercentage(metadata.dva_score);

      // Make in India Classification Logic
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
          status: "under_review", // It has a BOM now, so it goes to review!
        },
        { transaction: t },
      );

      // 3. Format Components from OCR Data
      const componentsToInsert = ocrData.data.map((item: any) => {
        // The component name is the key (e.g., "watch", "cycle")
        const componentName = Object.keys(item.component)[0];
        const componentCost = parseCurrency(item.component[componentName]);

        return {
          productId: newProduct.id,
          supplierId: supplier.id, // Linking to the main supplier who uploaded it
          name: `${componentName} (Mfr: ${item.supplier})`, // Storing the OCR supplier name here temporarily
          origin: item.origin,
          cost: componentCost,
          percentage: parsePercentage(item.percent_of_total),
        };
      });

      // 4. Bulk Insert Components
      await Component.bulkCreate(componentsToInsert, { transaction: t });

      // 5. Update Supplier Product Count
      await supplier.increment("products_count", { by: 1, transaction: t });

      // Commit the transaction
      await t.commit();

      return res.status(201).json({
        success: true,
        message: "Product and BOM processed successfully",
        product: newProduct,
      });
    } catch (error: any) {
      // If anything fails, rollback the database
      await t.rollback();
      console.error("BOM Processing Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to process BOM data" });
    }
  },

  getProducts: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      let products = [];

      if (userRole === "supplier") {
        // 1. Find the specific supplier profile for this logged-in user
        const supplier = await Supplier.findOne({
          where: { user_id: userId },
        });

        // If they haven't set up a profile yet, they inherently have 0 products
        if (!supplier) {
          return res.status(200).json({
            success: true,
            products: [],
            message:
              "No supplier profile found, returning empty products list.",
          });
        }

        // 2. Fetch only the products belonging to this specific supplier
        products = await Product.findAll({
          where: { supplierId: supplier.id }, // Uses the model's property name
          order: [["createdAt", "DESC"]], // Newest products first
        });
      } else {
        // 3. For Admins, Procurement, and Auditors: Fetch ALL products
        products = await Product.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Supplier,
              as: "supplier",
              attributes: ["id", "gst", "sector"], // Fetch limited supplier details for the admin view
            },
          ],
        });
      }

      // 4. Send the formatted response back to the React UI
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
};
