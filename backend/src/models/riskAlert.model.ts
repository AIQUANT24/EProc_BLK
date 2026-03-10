import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Define all attributes
interface RiskAlertAttributes {
  id: string;
  product_id: string;
  rule_id: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string | null;
  status: "active" | "investigating" | "resolved" | "dismissed";
  resolved_by: string | null;
  resolved_at: Date | null;
  blockchain_tx_hash: string | null;
  created_at?: Date;
}

// 2. Define optional attributes for creation
interface RiskAlertCreationAttributes extends Optional<
  RiskAlertAttributes,
  | "id"
  | "details"
  | "status"
  | "resolved_by"
  | "resolved_at"
  | "blockchain_tx_hash"
  | "created_at"
> {}

export default class RiskAlert
  extends Model<RiskAlertAttributes, RiskAlertCreationAttributes>
  implements RiskAlertAttributes
{
  public id!: string;
  public product_id!: string;
  public rule_id!: string;
  public severity!: "low" | "medium" | "high" | "critical";
  public details!: string | null;
  public status!: "active" | "investigating" | "resolved" | "dismissed";
  public resolved_by!: string | null;
  public resolved_at!: Date | null;
  public blockchain_tx_hash!: string | null;
  public readonly created_at!: Date;

  // Association Helper
  static associate(models: any) {
    RiskAlert.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

export function initRiskAlertModel(sequelize: Sequelize) {
  RiskAlert.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rule_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      severity: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "active",
          "investigating",
          "resolved",
          "dismissed",
        ),
        defaultValue: "active",
        allowNull: false,
      },
      resolved_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "RiskAlert",
      tableName: "risk_alerts",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["product_id"] },
        { fields: ["severity"] },
        { fields: ["status"] },
      ],
    },
  );

  return RiskAlert;
}
