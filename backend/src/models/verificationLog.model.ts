import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Full attributes interface
interface VerificationLogAttributes {
  id: string;
  product_id: string | null;
  requested_by: string; // User ID or Name who triggered the action
  dva_score: number | string | null;
  classification: string | null;
  confidence_score: number | string | null;
  risk_score: number | string | null;
  compliance_status: "pending" | "verified" | "flagged" | "rejected" | null;
  blockchain_tx_hash: string | null;
  response_payload: Record<string, any> | null;
  created_at?: Date;
}

// 2. Attributes optional during .create()
interface VerificationLogCreationAttributes extends Optional<
  VerificationLogAttributes,
  | "id"
  | "product_id"
  | "dva_score"
  | "classification"
  | "confidence_score"
  | "risk_score"
  | "compliance_status"
  | "blockchain_tx_hash"
  | "response_payload"
  | "created_at"
> {}

export default class VerificationLog
  extends Model<VerificationLogAttributes, VerificationLogCreationAttributes>
  implements VerificationLogAttributes
{
  public id!: string;
  public product_id!: string | null;
  public requested_by!: string;
  public dva_score!: number | string | null;
  public classification!: string | null;
  public confidence_score!: number | string | null;
  public risk_score!: number | string | null;
  public compliance_status!:
    | "pending"
    | "verified"
    | "flagged"
    | "rejected"
    | null;
  public blockchain_tx_hash!: string | null;
  public response_payload!: Record<string, any> | null;

  public readonly created_at!: Date;

  static associate(models: any) {
    // Optional link for performance, though audit logs often stand alone
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
      compliance_status: {
        type: DataTypes.ENUM("pending", "verified", "flagged", "rejected"),
        allowNull: true,
      },
      blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      response_payload: {
        type: DataTypes.JSON, // Optimized for Postgres querying
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VerificationLog",
      tableName: "verification_logs",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // Audit logs should be immutable
      indexes: [
        { fields: ["product_id"] },
        { fields: ["requested_by"] },
        { fields: ["created_at"] },
      ],
    },
  );

  return VerificationLog;
}
