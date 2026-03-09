import { Model, DataTypes, Sequelize } from "sequelize";

export default class ProductModelClass extends Model {
  static associate(models: any) {
    ProductModelClass.belongsTo(models.Supplier, { foreignKey: "supplier_id" });
    ProductModelClass.hasMany(models.Component, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
    ProductModelClass.hasMany(models.DvaResult, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
    ProductModelClass.hasMany(models.ComplianceRecord, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
    ProductModelClass.hasMany(models.RiskAlert, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
  }
}

export function initProductModel(sequelize: Sequelize) {
  ProductModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      supplier_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      hsn_code: { type: DataTypes.STRING },
      category: { type: DataTypes.STRING },
      estimated_cost: { type: DataTypes.DECIMAL },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
    },
  );

  return ProductModelClass;
}
