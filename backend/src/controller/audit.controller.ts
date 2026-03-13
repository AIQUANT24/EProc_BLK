import { Request, Response } from "express";
import { AuditLog, User } from "../models/index.js";

export const auditController = {
  getLogs: async (req: Request, res: Response) => {
    try {
      // Security: Only allow admins or auditors to view the global audit log
      if (
        req.user?.role !== "admin" &&
        req.user?.role !== "superadmin" &&
        req.user?.role !== "auditor"
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view audit logs.",
        });
      }

      const logs = await AuditLog.findAll({
        order: [["createdAt", "DESC"]], // Newest logs first
        include: [
          {
            model: User,
            as: "user",
            attributes: ["fullName", "email", "role"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        logs,
      });
    } catch (error: any) {
      console.error("Fetch Audit Logs Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch audit logs." });
    }
  },
};
