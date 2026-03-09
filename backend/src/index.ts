import express, { Request, Response } from "express";
import config from "./config/environment.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize, initSequelize } from "./config/db.js";
import { initModels } from "./models/index.js";

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

  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.get("/api", (_req: Request, res: Response) =>
    res.json({
      message: "Backend API",
      environment: config.NODE_ENV,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/api/health", (_req: Request, res: Response) =>
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
    }),
  );

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
