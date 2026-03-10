import { Router } from "express";
import {
  authenticateAdmin,
  authenticateToken,
} from "../middleware/auth.middleware";
import { UserController } from "../controller/user.controller";

const router = Router();
// Public Routes
router.get("/", UserController.findAll);
router.get("/:id", UserController.findOne);

// Public Routes
router.post(
  "/create",
  authenticateToken,
  authenticateAdmin,
  UserController.create,
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateAdmin,
  UserController.delete,
);

router.put("/:id", authenticateToken, UserController.update);

export default router;
