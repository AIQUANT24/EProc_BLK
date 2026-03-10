import { Request, Response } from "express";
import { UserModel } from "../models";
import config from "../config/environment";

export const UserController = {
  // CREATE
  create: async (req: Request, res: Response) => {
    try {
      const { fullName, email, role, organization, department } = req.body;

      if (!fullName || !email || !role)
        return res.status(400).json({ message: "Missing required fields" });

      // Check if user exists
      const existingUser = await UserModel.findOne({ where: { email } });
      if (existingUser)
        return res.status(400).json({ message: "Email already in use" });

      // Create user
      const newUser = await UserModel.create({
        fullName,
        email,
        role,
        organization,
        department,
        password: config.DEFAULT_PASSWORD,
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          fullName,
          email,
          role,
          organization,
          department,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // READ ALL
  findAll: async (_req: Request, res: Response) => {
    try {
      const users = await UserModel.findAll();
      res.status(200).json({
        message: "Users found successfully",
        users,
      });
    } catch (error: any) {
      res.status(500).json({ error: error, message: "Failed to fetch users" });
    }
  },

  // READ ONE
  findOne: async (req: Request, res: Response) => {
    try {
      if (typeof req.params.id !== "string" && !Array.isArray(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const id = req.params.id as string;
      const user = await UserModel.findByPk(id);
      res.status(200).json({
        message: "User found successfully",
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error, message: "Failed to fetch user" });
    }
  },

  // UPDATE
  update: async (req: Request, res: Response) => {
    try {
      if (typeof req.params.id !== "string" && !Array.isArray(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const id = req.params.id as string;
      const { fullName, email, role, organization, department } = req.body;
      const updatedUser = await UserModel.update(
        { fullName, email, role, organization, department },
        { where: { id } },
      );
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error, message: "Failed to update user" });
    }
  },

  // DELETE
  delete: async (req: Request, res: Response) => {
    try {
      if (typeof req.params.id !== "string" && !Array.isArray(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const id = req.params.id as string;
      const deletedUser = await UserModel.destroy({ where: { id } });
      res.status(200).json({
        message: "User deleted successfully",
        user: deletedUser,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
