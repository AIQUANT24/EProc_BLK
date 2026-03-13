import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface AuditAttributes {
  id: string;
  event: string; // e.g., "PRODUCT_CREATED", "BOM_VERIFIED", "LOGIN"
  entity: string; // e.g., "Product", "Supplier", "Auth"
  entityId?: string; // Optional: The specific ID of the entity modified
  userId: string; // The ID of the user who performed the action
  details?: any; // Optional: JSON payload with extra context (e.g., { previousStatus: "draft", newStatus: "under_review" })
  createdAt?: Date;
}

interface AuditCreationAttributes extends Optional<
  AuditAttributes,
  "id" | "createdAt"
> {}

export default class AuditLog
  extends Model<AuditAttributes, AuditCreationAttributes>
  implements AuditAttributes
{
  public id!: string;
  public event!: string;
  public entity!: string;
  public entityId!: string | undefined;
  public userId!: string;
  public details!: any;
  public readonly createdAt!: Date;

  // Associations
  static associate(models: any) {
    // Links the audit log back to the exact User who performed the action
    AuditLog.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

export function initAuditModel(sequelize: Sequelize) {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      event: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "entity_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AuditLog",
      tableName: "audit_logs",
      underscored: true,
      // Audit logs are append-only. We only care about when they were created, so we can disable updatedAt.
      timestamps: true,
      updatedAt: false,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["entity", "entity_id"] },
        { fields: ["event"] },
      ],
    },
  );

  return AuditLog;
}
