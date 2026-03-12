import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models";
import config from "../config/environment";
import crypto from "crypto";
import { Op } from "sequelize";

export const authController = {
  // --- SIGN UP ---
  signup: async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, role, organization, department } =
        req.body;

      if (!fullName || !email || !password || !role)
        return res.status(400).json({ message: "Missing required fields" });

      // Check if user exists
      const existingUser = await UserModel.findOne({ where: { email } });
      console.log("Working upto here");
      if (existingUser)
        return res.status(400).json({ message: "Email already in use" });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newUser = await UserModel.create({
        fullName,
        email,
        password: hashedPassword,
        role,
        organization,
        department,
        status: "inactive",
      });

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        config.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      // Send via HTTP-only cookie
      res.cookie(config.COOKIE_NAME, token, {
        httpOnly: true, // Prevents XSS
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
    } catch (error: any) {
      res
        .status(500)
        .json({
          error: error,
          message: "Failed to register user",
          success: false,
        });
    }
  },

  // --- SIGN IN ---
  signin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });
      // make user active
      user.status = "active";
      await user.save();
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        config.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      // Send via HTTP-only cookie
      res.cookie(config.COOKIE_NAME, token, {
        httpOnly: true, // Prevents XSS
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(200).json({
        message: "Login successful",
        user: { id: user.id, fullName: user.fullName, role: user.role },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- LOGOUT ---
  logout: (req: Request, res: Response) => {
    // Clear cookie
    res.clearCookie(config.COOKIE_NAME);
    res.status(200).json({ message: "Logged out successfully" });
    // make user inactive
    UserModel.update({ status: "inactive" }, { where: { id: req.user?.id } });
  },

  profile: async (req: Request, res: Response) => {
    try {
      // Additional verification: check if user still exists in database
      const user = await UserModel.findByPk(req.user?.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found in the system",
        });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          organization: user.organization,
          department: user.department,
          status: user.status,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch user profile" });
    }
  },

  // --- FORGOT PASSWORD ---
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ where: { email } });

      if (!user) {
        // Security best practice: Don't reveal if user exists
        return res.status(200).json({
          message:
            "If an account exists with that email, a reset link has been sent.",
        });
      }

      // 1. Generate a random reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // 2. Hash it to store in DB (prevents theft if DB is leaked)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // 3. Set expiration (e.g., 1 hour from now)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();

      // 4. Send email (Placeholder)
      const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
      // await sendEmail({ to: user.email, subject: "Password Reset", text: `Link: ${resetUrl}` });

      res
        .status(200)
        .json({ message: "Reset link sent to email", resetUrl, resetToken });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error, message: "Failed to send reset link" });
    }
  },

  // --- RESET PASSWORD ---
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Hash the incoming token to compare with the one in DB
      const hashedToken = crypto
        .createHash("sha256")
        .update(Array.isArray(token) ? token[0] : token)
        .digest("hex");

      const user = await UserModel.findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [Op.gt]: new Date() }, // Check if not expired
        },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password and clear reset fields
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res
        .status(200)
        .json({ message: "Password reset successful. You can now log in." });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error, message: "Failed to reset password" });
    }
  },
};
