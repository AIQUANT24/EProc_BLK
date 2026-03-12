import express, { Request, Response } from "express";
import config from "./config/environment.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize, initSequelize } from "./config/db.js";
import { initModels } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import productsRoutes from "./routes/products.routes.js";
import componentRoutes from "./routes/component.routes.js";
import "./enrollAdmin.js"; // Ensure admin is enrolled at server startup
import complianceRoutes from "./routes/compliance.routes.js";

export async function bootstrap(): Promise<void> {
  try {
    // 1. Initialize Sequelize
    initSequelize();

    // 2. Authenticate DB
    await sequelize.authenticate();
    console.log("Database connection OK");

    // 3. Initialize models AFTER sequelize
    initModels();

    // 4. Sync models
    await sequelize.sync();
    console.log("Models synced with database");
  } catch (err) {
    console.error("Database init failed:", err);
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  // backend/src/app.ts
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true, // MUST be true for the browser to accept the cookie
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(cookieParser());

  app.get("/", (_req: Request, res: Response) =>
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
    }),
  );
  app.get("/api", (_req: Request, res: Response) =>
    res.json({
      message: "Backend API",
      environment: config.NODE_ENV,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    }),
  );

  // other routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/components", componentRoutes);
  app.use("/api/compliance", complianceRoutes);

  app.listen(config.PORT, () =>
    console.log(
      `Backend Server running on port ${config.PORT} [${config.NODE_ENV}]`,
    ),
  );
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
