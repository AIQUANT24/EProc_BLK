import { Sequelize } from "sequelize";
import config from "../config/environment.js";

export let sequelize: Sequelize;

export function initSequelize() {
  sequelize = new Sequelize(
    config.DATABASE.NAME!,
    config.DATABASE.USER!,
    config.DATABASE.PASSWORD!,
    {
      host: config.DATABASE.HOST,
      port: Number(config.DATABASE.PORT),
      dialect: "mysql",
      logging: false,

      pool: {
        max: config.NODE_ENV === "production" ? 20 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  );

  return sequelize;
}
