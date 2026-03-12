import { Request, Response } from "express";
import Component from "../models/component.model.js";
import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import UserModel from "../models/user.model.js"; // IMPORT THIS

export const componentController = {
  // --- FETCH COMPONENTS FOR A SPECIFIC PRODUCT ---
  getComponents: async (req: Request, res: Response) => {
    try {
      const { productId } = req.query;
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required" });
      }

      // 1. Fetch components and automatically JOIN the Supplier and User tables
      const componentsData = await Component.findAll({
        where: { productId: productId as string },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Supplier,
            as: "componentSupplier", // MUST match the alias in Component.associate
            attributes: ["id"], // We only need the ID from the supplier table
            include: [
              {
                model: UserModel,
                as: "user", // MUST match the alias in Supplier.associate
                attributes: ["fullName"], // Grab the actual name
              },
            ],
          },
        ],
      });

      // 2. Format the data to match what the React Frontend expects
      const formattedComponents = componentsData.map((c: any) => {
        // We appended the original manufacturer name to the component name string earlier
        // e.g., "Copper Coil (Mfr: Hindalco)"
        return {
          id: c.id,
          name: c.name,
          origin: c.origin,
          cost: c.cost,
          // If you want the logged-in supplier's name attached to it:
          supplierName: c.componentSupplier?.user?.fullName || "Unknown",
        };
      });

      return res
        .status(200)
        .json({ success: true, components: formattedComponents });
    } catch (error: any) {
      console.error("Fetch Components Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch components" });
    }
  },

  // --- BULK INSERT FROM CSV ---
  addBulkComponents: async (req: Request, res: Response) => {
    try {
      const { productId, components } = req.body;

      const supplier = await Supplier.findOne({
        where: { user_id: req.user?.id },
      });
      if (!supplier)
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });

      const product = await Product.findOne({
        where: { id: productId, supplierId: supplier.id },
      });
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      if (["verified", "under_review"].includes(product.status)) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot modify a locked BOM" });
      }

      // Map the incoming CSV rows to your DB model format
      const componentsToInsert = components.map((c: any) => ({
        productId,
        supplierId: supplier.id,
        // Appending the specific component manufacturer to the name string
        name: c.supplierName ? `${c.name} (Mfr: ${c.supplierName})` : c.name,
        origin: c.origin.toLowerCase() === "imported" ? "imported" : "domestic",
        cost: c.cost,
      }));

      await Component.bulkCreate(componentsToInsert);

      return res.status(201).json({
        success: true,
        message: `${components.length} components inserted`,
      });
    } catch (error: any) {
      console.error("Bulk Component Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to import components" });
    }
  },
};
