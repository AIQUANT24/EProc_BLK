import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { componentController } from "../controller/component.controller.js";

const router = Router();

// GET /api/components?productId=XYZ
router.get("/", authenticateToken, componentController.getComponents);

// POST /api/components/bulk
router.post("/bulk", authenticateToken, componentController.addBulkComponents);

export default router;
