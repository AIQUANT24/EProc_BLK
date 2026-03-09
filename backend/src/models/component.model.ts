import { Model, DataTypes, Sequelize } from "sequelize";

export default class ComponentModelClass extends Model {
  static associate(models: any) {
    ComponentModelClass.belongsTo(models.Product, { foreignKey: "product_id" });
    ComponentModelClass.hasMany(models.Component, {
      as: "SubComponents",
      foreignKey: "parent_component_id",
    });
    ComponentModelClass.belongsTo(models.Component, {
      as: "ParentComponent",
      foreignKey: "parent_component_id",
    });
  }
}

export function initComponentModel(sequelize: Sequelize) {
  ComponentModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      origin: {
        type: DataTypes.ENUM("domestic", "imported"),
        allowNull: false,
      },
      cost: { type: DataTypes.DECIMAL, allowNull: false },
      supplier_name: { type: DataTypes.STRING },
      parent_component_id: { type: DataTypes.UUID },
    },
    {
      sequelize,
      modelName: "Component",
      tableName: "components",
      underscored: true,
    },
  );

  return ComponentModelClass;
}
