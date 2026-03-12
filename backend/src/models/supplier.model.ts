// models/supplier.model.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";

interface SupplierAttributes {
  id: string;
  user_id: string;
  gst: string;
  pan: string;
  udyam: string;
  location: string;
  state: string;
  msme_status: string;
  sector: string;
  products_count: number;
}

interface SupplierCreationAttributes extends Optional<
  SupplierAttributes,
  "id" | "products_count"
> {}

export default class Supplier
  extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes
{
  public id!: string;
  public user_id!: string;
  public gst!: string;
  public pan!: string;
  public udyam!: string;
  public location!: string;
  public state!: string;
  public msme_status!: string;
  public sector!: string;
  public products_count!: number;

  static associate(models: any) {
    // CRITICAL: Alias is set to "user"
    Supplier.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Supplier.hasMany(models.Product, {
      foreignKey: "supplier_id",
      as: "products",
    });
  }
}

export function initSupplierModel(sequelize: Sequelize) {
  Supplier.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
      gst: { type: DataTypes.STRING(20), unique: true },
      pan: { type: DataTypes.STRING(10), unique: true },
      udyam: { type: DataTypes.STRING, unique: true },
      location: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      msme_status: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      products_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "suppliers",
      underscored: true,
      timestamps: true,
    },
  );
  return Supplier;
}
