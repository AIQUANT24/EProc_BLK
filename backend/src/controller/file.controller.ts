import { Request, Response } from "express";
import { FileModel, Product, Supplier } from "../models"; // Import from your index.ts to ensure associations are loaded

export const fileController = {
  // --- UPLOAD BOM FILE ---
  uploadBOM: async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded." });
      }
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required." });
      }

      // Security Check: Ensure the logged-in supplier actually owns this product
      const supplier = await Supplier.findOne({
        where: { user_id: req.user?.id },
      });
      if (!supplier) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized supplier." });
      }

      const product = await Product.findOne({
        where: { id: productId, supplierId: supplier.id },
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found or access denied.",
        });
      }

      // Check if a file already exists for this product and overwrite it (optional, but good for MVP)
      const existingFile = await FileModel.findOne({ where: { productId } });
      if (existingFile) {
        await existingFile.destroy(); // Delete old file before saving new one
      }

      // Save new file to database
      const newFile = await FileModel.create({
        productId,
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer, // This is the actual binary file data from multer
      });

      return res.status(201).json({
        success: true,
        message: "BOM file saved successfully",
        fileId: newFile.id,
      });
    } catch (error: any) {
      console.error("File Upload Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload file." });
    }
  },

  // --- DOWNLOAD/VIEW BOM FILE ---
  downloadBOM: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const fileRecord = await FileModel.findOne({ where: { productId } });

      if (!fileRecord) {
        return res.status(404).json({
          success: false,
          message: "BOM file not found for this product.",
        });
      }

      // Set headers so the browser knows it's receiving a file, not JSON
      res.setHeader("Content-Type", fileRecord.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileRecord.filename}"`,
      );

      // Send the binary buffer
      return res.send(fileRecord.data);
    } catch (error: any) {
      console.error("File Download Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to download file." });
    }
  },
};
