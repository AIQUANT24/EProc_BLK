// controllers/supplier.controller.ts
import { Request, Response } from "express";
import Supplier from "../models/supplier.model.js";
import UserModel from "../models/user.model.js";

export const supplierController = {
  getSupplierProfile: async (req: Request, res: Response) => {
    try {
      const supplier = await Supplier.findOne({
        where: { user_id: req.user?.id },
        include: [
          {
            model: UserModel,
            as: "user", // Matches Model.associate
            attributes: ["fullName", "email", "status"],
          },
        ],
      });

      if (!supplier) {
        return res
          .status(404)
          .json({ message: "Supplier profile not found", success: false });
      }

      return res.status(200).json({ supplier, success: true });
    } catch (error: any) {
      console.error("Profile Fetch Error:", error.name, error.message);
      res.status(500).json({
        error: error.name,
        message: "Internal server error",
        success: false,
      });
    }
  },

  createOrUpdateSupplier: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { gst, pan, udyam, location, state, msme_status, sector } =
        req.body;

      const [supplier, created] = await Supplier.upsert({
        user_id: userId as string,
        gst,
        pan,
        udyam,
        location,
        state,
        msme_status,
        sector,
      });

      res.status(created ? 201 : 200).json({
        supplier,
        message: created ? "Profile created" : "Profile updated",
        success: true,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message, success: false });
    }
  },

  findAll: async (_req: Request, res: Response) => {
    try {
      const suppliers = await Supplier.findAll({
        include: [
          { model: UserModel, as: "user", attributes: ["fullName", "email"] },
        ],
      });
      res.status(200).json({ suppliers, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message, success: false });
    }
  },
};
