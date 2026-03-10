import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Full attributes interface
interface SupplierAttributes {
  id: string;
  user_id: string;
  name: string;
  email: string;
  gst_number: string | null;
  pan_number: string | null;
  udyam_number: string | null;
  organization_type:
    | "proprietorship"
    | "partnership"
    | "pvt_ltd"
    | "public_ltd"
    | "llp"
    | null;
  manufacturing_location: string | null;
  status: "pending" | "verified" | "rejected" | "suspended";
  created_at?: Date;
  updated_at?: Date;
}

// 2. Attributes optional during .create()
interface SupplierCreationAttributes extends Optional<
  SupplierAttributes,
  | "id"
  | "gst_number"
  | "pan_number"
  | "udyam_number"
  | "organization_type"
  | "manufacturing_location"
  | "status"
  | "created_at"
  | "updated_at"
> {}

export default class Supplier
  extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes
{
  public id!: string;
  public user_id!: string;
  public name!: string;
  public email!: string;
  public gst_number!: string | null;
  public pan_number!: string | null;
  public udyam_number!: string | null;
  public organization_type!:
    | "proprietorship"
    | "partnership"
    | "pvt_ltd"
    | "public_ltd"
    | "llp"
    | null;
  public manufacturing_location!: string | null;
  public status!: "pending" | "verified" | "rejected" | "suspended";

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association Helper
  static associate(models: any) {
    Supplier.hasMany(models.Product, {
      foreignKey: "supplier_id",
      as: "products",
      onDelete: "CASCADE",
    });
    // If you have a User model, you'd associate user_id here
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      gst_number: {
        type: DataTypes.STRING,
        unique: true, // Prevents duplicate registrations
        allowNull: true,
      },
      pan_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      udyam_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization_type: {
        type: DataTypes.ENUM(
          "proprietorship",
          "partnership",
          "pvt_ltd",
          "public_ltd",
          "llp",
        ),
        allowNull: true,
      },
      manufacturing_location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "verified", "rejected", "suspended"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "suppliers",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["status"] },
        { fields: ["email"] },
      ],
    },
  );

  return Supplier;
}
