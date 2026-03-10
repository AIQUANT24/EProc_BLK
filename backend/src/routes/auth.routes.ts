import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
// Public Routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/logout", authController.logout);

// reset password
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected Route
router.get("/profile", authenticateToken, authController.profile);

export default router;
