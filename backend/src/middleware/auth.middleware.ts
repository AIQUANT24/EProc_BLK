import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/environment.js";
import UserModel from "../models/user.model.js";

export interface JwtPayload {
  id: string;
  role: string;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    // Check for token in multiple places (priority order)
    // 1. Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Query parameter (for URLs like /form/1?token=xxx)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    // 3. Cookie
    const cookieName = config.COOKIE_NAME || "token";
    if (!token && req.cookies?.[cookieName]) {
      token = req.cookies[cookieName];
    }

    // 4. Request body (less common but useful for POST requests)
    if (!token && req.body?.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Access token is required. Please provide a valid token.",
      });
    }

    // Verify token
    const jwtSecret = config.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user info to request object
    req.user = decoded;

    // All checks passed, proceed to next middleware/route handler
    next();
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please request a new token.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please provide a valid token.",
      });
    }

    // Generic error
    console.error("Token authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
