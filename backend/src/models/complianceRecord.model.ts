import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// Define shared types to ensure Sync
type ComplianceStatus = "pending" | "verified" | "flagged" | "rejected";
type ClassificationType = "Class I" | "Class II" | "Non-Local";

interface ComplianceRecordAttributes {
  id: string;
  product_id: string;
  supplier_id: string;
  category: string;
  dva_score: string;
  classification: ClassificationType;
  confidenceScore: number;
  riskScore: number;
  status: ComplianceStatus; // Synced with DB
  blockchainTxHash?: string;
}

interface ComplianceRecordCreationAttributes extends Optional<
  ComplianceRecordAttributes,
  "id" | "status" | "blockchainTxHash" // Added status and txHash as optional
> {}

export default class ComplianceRecord
  extends Model<ComplianceRecordAttributes, ComplianceRecordCreationAttributes>
  implements ComplianceRecordAttributes
{
  public id!: string;
  public product_id!: string;
  public supplier_id!: string;
  public category!: string;
  public dva_score!: string;
  public classification!: ClassificationType;
  public confidenceScore!: number;
  public riskScore!: number;
  public status!: ComplianceStatus;
  public blockchainTxHash?: string;

  static associate(models: any) {
    ComplianceRecord.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

export function initComplianceRecordModel(sequelize: Sequelize) {
  ComplianceRecord.init(
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
      status: {
        // MUST match the TypeScript type ComplianceStatus
        type: DataTypes.ENUM("pending", "verified", "flagged", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      blockchainTxHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dva_score: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      classification: {
        type: DataTypes.ENUM("Class I", "Class II", "Non-Local"),
        allowNull: false,
      },
      confidenceScore: {
        // Changed to FLOAT so Sequelize returns a number instead of a string
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      riskScore: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ComplianceRecord",
      tableName: "compliance_records",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["product_id"] },
        { fields: ["status"] },
        { fields: ["blockchain_tx_hash"] },
      ],
    },
  );

  return ComplianceRecord;
}
