import { Model, DataTypes, Sequelize } from "sequelize";

export default class RiskAlertModelClass extends Model {
  static associate(models: any) {
    RiskAlertModelClass.belongsTo(models.Product, { foreignKey: "product_id" });
  }
}

export function initRiskAlertModel(sequelize: Sequelize) {
  RiskAlertModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID, allowNull: false },
      rule_id: { type: DataTypes.STRING, allowNull: false },
      severity: { type: DataTypes.STRING, allowNull: false },
      details: { type: DataTypes.TEXT },
      status: { type: DataTypes.STRING, defaultValue: "active" },
      resolved_by: { type: DataTypes.UUID },
      resolved_at: { type: DataTypes.DATE },
      blockchain_tx_hash: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "RiskAlert",
      tableName: "risk_alerts",
      underscored: true,
      createdAt: true,
      updatedAt: false,
    },
  );

  return RiskAlertModelClass;
}
