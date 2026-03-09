import { Model, DataTypes, Sequelize } from "sequelize";

export default class DvaResultModelClass extends Model {
  static associate(models: any) {
    DvaResultModelClass.belongsTo(models.Product, { foreignKey: "product_id" });
    DvaResultModelClass.hasOne(models.ComplianceRecord, {
      foreignKey: "dva_result_id",
    });
  }
}

export function initDvaResultModel(sequelize: Sequelize) {
  DvaResultModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID, allowNull: false },
      dva_score: { type: DataTypes.DECIMAL, allowNull: false },
      classification: { type: DataTypes.STRING, allowNull: false },
      confidence_score: { type: DataTypes.DECIMAL },
      risk_score: { type: DataTypes.DECIMAL },
      calculation_details: { type: DataTypes.JSON },
      blockchain_tx_hash: { type: DataTypes.STRING },
      calculated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "DvaResult",
      tableName: "dva_results",
      underscored: true,
      timestamps: false,
    },
  );

  return DvaResultModelClass;
}
