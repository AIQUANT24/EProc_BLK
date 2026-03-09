import { Model, DataTypes, Sequelize } from "sequelize";

export default class SupplierModelClass extends Model {
  static associate(models: any) {
    SupplierModelClass.hasMany(models.Product, {
      foreignKey: "supplier_id",
      onDelete: "CASCADE",
    });
  }
}

export function initSupplierModel(sequelize: Sequelize) {
  SupplierModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false }, // Maps to auth.users
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      gst_number: { type: DataTypes.STRING },
      pan_number: { type: DataTypes.STRING },
      udyam_number: { type: DataTypes.STRING },
      organization_type: { type: DataTypes.STRING },
      manufacturing_location: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "suppliers",
      underscored: true,
    },
  );

  return SupplierModelClass;
}
