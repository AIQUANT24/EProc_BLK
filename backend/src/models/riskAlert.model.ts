import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Updated Type to include "critical"
type SeverityLevel = "low" | "medium" | "high" | "critical";

interface RiskAlertAttributes {
  id: string;
  product_id: string;
  supplier_id: string;
  alert_type: string;
  severity: SeverityLevel;
  description: string;
  details?: string;
  ruleId?: string;
  resolved: boolean;
}

// 2. Added "resolved" to Optional for easier creation
interface RiskAlertCreationAttributes extends Optional<
  RiskAlertAttributes,
  "id" | "details" | "ruleId" | "resolved"
> {}

export default class RiskAlert
  extends Model<RiskAlertAttributes, RiskAlertCreationAttributes>
  implements RiskAlertAttributes
{
  public id!: string;
  public product_id!: string;
  public supplier_id!: string;
  public alert_type!: string;
  public severity!: SeverityLevel;
  public description!: string;
  public details?: string;
  public ruleId?: string;
  public resolved!: boolean;

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
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      alert_type: {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ruleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        { fields: ["resolved"] }, // Fixed: Changed 'status' to 'resolved'
      ],
    },
  );

  return RiskAlert;
}
