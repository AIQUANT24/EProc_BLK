import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { productController } from "../controller/product.controller.js";

const router = Router();

// GET /api/products -> Fetches products based on user role
router.get("/", authenticateToken, productController.getProducts);

// POST /api/products -> Creates a new product with OCR BOM processing
router.post("/", authenticateToken, productController.createProductWithBOM);

export default router;
