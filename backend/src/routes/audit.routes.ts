import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { auditController } from "../controller/audit.controller.js";

const router = Router();

// GET /api/audit
router.get("/", authenticateToken, auditController.getLogs);

export default router;
