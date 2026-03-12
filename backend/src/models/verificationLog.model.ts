import { Model, DataTypes, Sequelize, Optional } from "sequelize";

type VerificationStatus = "pending" | "verified" | "failed" | "rejected";

interface VerificationLogAttributes {
  id: string;
  product_id?: string; // Optional because allowNull: true
  supplier_id?: string;
  requested_by: string;
  status: VerificationStatus;
  dva_score?: string; // Decimal returns as string
  classification?: string;
  confidence_score?: string;
  risk_score?: string;
  blockchain_tx_hash?: string;
}

// Add all fields with default values or allowNull: true here
interface VerificationLogCreationAttributes extends Optional<
  VerificationLogAttributes,
  | "id"
  | "status"
  | "product_id"
  | "supplier_id"
  | "blockchain_tx_hash"
  | "dva_score"
  | "confidence_score"
  | "risk_score"
  | "classification"
> {}

export default class VerificationLog
  extends Model<VerificationLogAttributes, VerificationLogCreationAttributes>
  implements VerificationLogAttributes
{
  public id!: string;
  public product_id?: string;
  public supplier_id?: string;
  public requested_by!: string;
  public status!: VerificationStatus;
  public dva_score?: string;
  public classification?: string;
  public confidence_score?: string;
  public risk_score?: string;
  public blockchain_tx_hash?: string;

  static associate(models: any) {
    VerificationLog.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

export function initVerificationLogModel(sequelize: Sequelize) {
  VerificationLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      requested_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dva_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      classification: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      confidence_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      risk_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "verified", "failed", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "VerificationLog",
      tableName: "verification_logs",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // Solid choice for an audit log
      indexes: [
        { fields: ["product_id"] },
        { fields: ["requested_by"] },
        { fields: ["created_at"] },
      ],
    },
  );

  return VerificationLog;
}
