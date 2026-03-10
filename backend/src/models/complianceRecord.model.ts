import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Define the full set of attributes
interface ComplianceRecordAttributes {
  id: string;
  product_id: string;
  dva_result_id: string | null;
  status: "pending" | "verified" | "flagged" | "rejected"; // Better than a raw string
  verified_by: string | null;
  verification_notes: string | null;
  blockchain_tx_hash: string | null;
  created_at?: Date;
}

// 2. Define optional attributes for the .create() method
interface ComplianceRecordCreationAttributes extends Optional<
  ComplianceRecordAttributes,
  | "id"
  | "dva_result_id"
  | "verified_by"
  | "verification_notes"
  | "blockchain_tx_hash"
  | "created_at"
> {}

export default class ComplianceRecord
  extends Model<ComplianceRecordAttributes, ComplianceRecordCreationAttributes>
  implements ComplianceRecordAttributes
{
  public id!: string;
  public product_id!: string;
  public dva_result_id!: string | null;
  public status!: "pending" | "verified" | "flagged" | "rejected";
  public verified_by!: string | null;
  public verification_notes!: string | null;
  public blockchain_tx_hash!: string | null;
  public readonly created_at!: Date;

  // Association Helper
  static associate(models: any) {
    ComplianceRecord.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
    ComplianceRecord.belongsTo(models.DvaResult, {
      foreignKey: "dva_result_id",
      as: "dvaResult",
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
      dva_result_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "verified", "flagged", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      verification_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
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
