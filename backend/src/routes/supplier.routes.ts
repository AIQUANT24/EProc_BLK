import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { supplierController } from "../controller/supplier.controller";

const router = Router();
// Public Routes
router.get("/", authenticateToken, supplierController.findAll);

// Protect these routes so only logged-in users can access/edit their profile
router.get(
  "/profile",
  authenticateToken,
  supplierController.getSupplierProfile,
);

router.post(
  "/profile",
  authenticateToken,
  supplierController.createOrUpdateSupplier,
);

export default router;
