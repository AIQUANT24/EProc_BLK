import { Model, DataTypes, Sequelize } from "sequelize";

export default class ComplianceRecordModelClass extends Model {
  static associate(models: any) {
    ComplianceRecordModelClass.belongsTo(models.Product, {
      foreignKey: "product_id",
    });
    ComplianceRecordModelClass.belongsTo(models.DvaResult, {
      foreignKey: "dva_result_id",
    });
  }
}

export function initComplianceRecordModel(sequelize: Sequelize) {
  ComplianceRecordModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID, allowNull: false },
      dva_result_id: { type: DataTypes.UUID },
      status: { type: DataTypes.STRING, allowNull: false },
      verified_by: { type: DataTypes.UUID },
      verification_notes: { type: DataTypes.TEXT },
      blockchain_tx_hash: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "ComplianceRecord",
      tableName: "compliance_records",
      underscored: true,
      createdAt: true,
      updatedAt: false,
    },
  );

  return ComplianceRecordModelClass;
}
