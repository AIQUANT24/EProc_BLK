import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. All attributes in the model
interface DvaResultAttributes {
  id: string;
  product_id: string;
  dva_score: number | string;
  classification: string;
  confidence_score: number | string | null;
  risk_score: number | string | null;
  calculation_details: Record<string, any> | null;
  blockchain_tx_hash: string | null;
  calculated_at: Date;
}

// 2. Optional attributes during .create()
interface DvaResultCreationAttributes extends Optional<
  DvaResultAttributes,
  | "id"
  | "confidence_score"
  | "risk_score"
  | "calculation_details"
  | "blockchain_tx_hash"
  | "calculated_at"
> {}

export default class DvaResult
  extends Model<DvaResultAttributes, DvaResultCreationAttributes>
  implements DvaResultAttributes
{
  public id!: string;
  public product_id!: string;
  public dva_score!: number | string;
  public classification!: string;
  public confidence_score!: number | string | null;
  public risk_score!: number | string | null;
  public calculation_details!: Record<string, any> | null;
  public blockchain_tx_hash!: string | null;
  public readonly calculated_at!: Date;

  // Association Helper
  static associate(models: any) {
    DvaResult.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
    DvaResult.hasOne(models.ComplianceRecord, {
      foreignKey: "dva_result_id",
      as: "complianceRecord",
    });
  }
}

export function initDvaResultModel(sequelize: Sequelize) {
  DvaResult.init(
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
      dva_score: {
        type: DataTypes.DECIMAL(5, 2), // Example: 99.99
        allowNull: false,
      },
      classification: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      confidence_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      risk_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      calculation_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      calculated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "DvaResult",
      tableName: "dva_results",
      underscored: true,
      timestamps: false, // Using manual 'calculated_at' instead of 'createdAt'
      indexes: [
        { fields: ["product_id"] },
        { fields: ["classification"] },
        { fields: ["blockchain_tx_hash"] },
      ],
    },
  );

  return DvaResult;
}
