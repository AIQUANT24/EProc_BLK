import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Define the full set of attributes
interface ComponentAttributes {
  id: string;
  product_id: string;
  name: string;
  origin: "domestic" | "imported";
  cost: number | string; // Handled as string in DB for precision
  supplier_name: string | null;
  parent_component_id: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// 2. Define optional attributes for creation
interface ComponentCreationAttributes extends Optional<
  ComponentAttributes,
  "id" | "supplier_name" | "parent_component_id" | "created_at" | "updated_at"
> {}

export default class Component
  extends Model<ComponentAttributes, ComponentCreationAttributes>
  implements ComponentAttributes
{
  public id!: string;
  public product_id!: string;
  public name!: string;
  public origin!: "domestic" | "imported";
  public cost!: number | string;
  public supplier_name!: string | null;
  public parent_component_id!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association Helper
  static associate(models: any) {
    // Relationship to Product
    Component.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });

    // Self-referencing: A component can have many sub-components
    Component.hasMany(models.Component, {
      as: "subComponents",
      foreignKey: "parent_component_id",
    });

    // Self-referencing: A component belongs to one parent component
    Component.belongsTo(models.Component, {
      as: "parentComponent",
      foreignKey: "parent_component_id",
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
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
        type: DataTypes.DECIMAL(10, 2), // Added precision/scale for financial data
        allowNull: false,
      },
      supplier_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parent_component_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Component",
      tableName: "components",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["product_id"] },
        { fields: ["parent_component_id"] },
      ],
    },
  );

  return Component;
}
