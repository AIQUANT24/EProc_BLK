import { Model, DataTypes, Sequelize, Optional } from "sequelize";

interface ComponentAttributes {
  id: string;
  name: string;
  origin: "domestic" | "imported";
  cost: number; // Strictly number for calculations
  productId: string;
  supplierId: string;
  percentage: number;
}

// FIX: Added "percentage" to Optional so TS doesn't yell if it's missing during creation
interface ComponentCreationAttributes extends Optional<
  ComponentAttributes,
  "id" | "percentage"
> {}

export default class Component
  extends Model<ComponentAttributes, ComponentCreationAttributes>
  implements ComponentAttributes
{
  public id!: string;
  public name!: string;
  public origin!: "domestic" | "imported";
  public cost!: number;
  public productId!: string;
  public supplierId!: string;
  public percentage!: number;

  // Association Helper
  static associate(models: any) {
    Component.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });

    Component.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "componentSupplier",
    });
  }
}

export function initComponentModel(sequelize: Sequelize) {
  Component.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      origin: {
        type: DataTypes.ENUM("domestic", "imported"),
        allowNull: false,
      },
      cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue("cost");
          return value ? parseFloat(value.toString()) : 0;
        },
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "product_id",
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "supplier_id",
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0, // FIX: Added default value for MySQL
        get() {
          const value = this.getDataValue("percentage");
          return value ? parseFloat(value.toString()) : 0;
        },
      },
    },
    {
      sequelize,
      modelName: "Component",
      tableName: "components",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["product_id"] }, { fields: ["supplier_id"] }],
    },
  );

  return Component;
}
