import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import upload from "../middleware/file.middleware";
import { fileController } from "../controller/file.controller";

const router = Router();

// POST /api/files/upload -> Uploads the BOM file. Uses multer 'upload.single("file")'
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"), // "file" is the form-data key the frontend will use
  fileController.uploadBOM,
);

// GET /api/files/product/:productId -> Downloads/Views the BOM file
router.get(
  "/product/:productId",
  authenticateToken,
  fileController.downloadBOM,
);

export default router;
