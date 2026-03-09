// src/config/environment-refi.ts
import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`🌍 Loading Refi environment: ${NODE_ENV}`);

dotenv.config({ path: `.env.${NODE_ENV}` });
dotenv.config({ path: ".env" });

export const config = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 8080,

  DATABASE: {
    NAME: process.env.DATABASE_NAME || "nicov",
    USER: process.env.DATABASE_USER || "root",
    PASSWORD: process.env.DATABASE_PASSWORD || "root",
    HOST: process.env.DATABASE_HOST || "localhost",
    PORT: process.env.DATABASE_PORT || 3306,
  },
} as const;

export default config;
