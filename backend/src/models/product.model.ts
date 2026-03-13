import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// Enhanced based on FRD Audit Trail requirements
export interface VerificationLog {
  message: string;
  status: "verified" | "failed" | "pending";
  reviewedBy?: string; // ID of the Admin/Procurement official who verified it
  timestamp?: string; // When it was reviewed
}

// 1. All attributes matching your exact JSON structure
interface ProductAttributes {
  id: string; // "PRD-001"
  supplierId: string; // FK to Supplier
  name: string;
  category: string | null;
  estimatedCost: number | null;
  dvaScore: number | null;
  classification: string | null; // "Class I", "Class II", etc.
  status:
    | "draft"
    | "active"
    | "archived"
    | "under_review"
    | "verified"
    | "compliant"
    | "non-compliant"
    | "under-review";
  confidence: number | null;
  risk: number | null;
  verificationLog: VerificationLog | null; // <-- Standardized name
}

// 2. Optional attributes during .create()
interface ProductCreationAttributes extends Optional<
  ProductAttributes,
  | "id"
  | "category"
  | "estimatedCost"
  | "dvaScore"
  | "classification"
  | "status"
  | "confidence"
  | "risk"
  | "verificationLog"
> {}

export default class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: string;
  public supplierId!: string;
  public name!: string;
  public category!: string | null;
  public estimatedCost!: number | null;
  public dvaScore!: number | null;
  public classification!: string | null;
  public status!: "draft" | "active" | "archived" | "under_review" | "verified";
  public confidence!: number | null;
  public risk!: number | null;
  public verificationLog!: VerificationLog | null; // <-- Standardized name

  // Associations
  static associate(models: any) {
    Product.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplier",
    });

    Product.hasMany(models.Component, {
      foreignKey: "productId",
      as: "components",
    });

    Product.hasMany(models.ComplianceRecord, {
      foreignKey: "productId",
      as: "complianceRecords",
    });
  }
}

export function initProductModel(sequelize: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      supplierId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "supplier_id",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimatedCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: "estimated_cost",
        get() {
          const value = this.getDataValue("estimatedCost");
          return value ? parseFloat(value.toString()) : null;
        },
      },
      dvaScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: "dva_score",
        get() {
          const value = this.getDataValue("dvaScore");
          return value ? parseFloat(value.toString()) : null;
        },
      },
      classification: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "active",
          "archived",
          "under_review",
          "verified",
          "compliant",
          "non-compliant",
          "under-review",
        ),
        defaultValue: "draft",
        allowNull: false,
      },
      confidence: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        get() {
          const value = this.getDataValue("confidence");
          return value ? parseFloat(value.toString()) : null;
        },
      },
      risk: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        get() {
          const value = this.getDataValue("risk");
          return value ? parseFloat(value.toString()) : null;
        },
      },
      // ADDED THIS BLOCK TO STORE THE LOG IN MYSQL AS JSON
      verificationLog: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "verification_log",
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["supplier_id"] }, { fields: ["status"] }],
    },
  );

  return Product;
}
