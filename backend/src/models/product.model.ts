import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. All attributes in the model
interface ProductAttributes {
  id: string;
  supplier_id: string;
  name: string;
  hsn_code: string | null;
  category: string | null;
  estimated_cost: number | string | null;
  status: "draft" | "active" | "archived" | "under_review"; // Defined statuses
  created_at?: Date;
  updated_at?: Date;
}

// 2. Optional attributes during .create()
interface ProductCreationAttributes extends Optional<
  ProductAttributes,
  | "id"
  | "hsn_code"
  | "category"
  | "estimated_cost"
  | "status"
  | "created_at"
  | "updated_at"
> {}

export default class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: string;
  public supplier_id!: string;
  public name!: string;
  public hsn_code!: string | null;
  public category!: string | null;
  public estimated_cost!: number | string | null;
  public status!: "draft" | "active" | "archived" | "under_review";

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association Helper
  static associate(models: any) {
    Product.belongsTo(models.Supplier, {
      foreignKey: "supplier_id",
      as: "supplier",
    });

    Product.hasMany(models.Component, {
      foreignKey: "product_id",
      as: "components",
      onDelete: "CASCADE",
    });

    Product.hasMany(models.DvaResult, {
      foreignKey: "product_id",
      as: "dvaResults",
      onDelete: "CASCADE",
    });

    Product.hasMany(models.ComplianceRecord, {
      foreignKey: "product_id",
      as: "complianceRecords",
      onDelete: "CASCADE",
    });

    Product.hasMany(models.RiskAlert, {
      foreignKey: "product_id",
      as: "riskAlerts",
      onDelete: "CASCADE",
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
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hsn_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimated_cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "active", "archived", "under_review"),
        defaultValue: "draft",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["supplier_id"] },
        { fields: ["status"] },
        { fields: ["category"] },
      ],
    },
  );

  return Product;
}
