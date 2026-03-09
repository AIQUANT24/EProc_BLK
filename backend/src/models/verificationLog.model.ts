import { Model, DataTypes, Sequelize } from "sequelize";

export default class VerificationLogModelClass extends Model {
  static associate(models: any) {
    // Can optionally link to Product, but often kept loose for audit purposes
  }
}

export function initVerificationLogModel(sequelize: Sequelize) {
  VerificationLogModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID },
      requested_by: { type: DataTypes.STRING, allowNull: false },
      dva_score: { type: DataTypes.DECIMAL },
      classification: { type: DataTypes.STRING },
      confidence_score: { type: DataTypes.DECIMAL },
      risk_score: { type: DataTypes.DECIMAL },
      compliance_status: { type: DataTypes.STRING },
      blockchain_tx_hash: { type: DataTypes.STRING },
      response_payload: { type: DataTypes.JSON },
    },
    {
      sequelize,
      modelName: "VerificationLog",
      tableName: "verification_logs",
      underscored: true,
      createdAt: true,
      updatedAt: false,
    },
  );

  return VerificationLogModelClass;
}
