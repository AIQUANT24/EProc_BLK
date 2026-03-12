import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// 1. Define all attributes in the model
interface UserAttributes {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "procurement" | "supplier" | "auditor" | "superadmin";
  organization?: string;
  department?: string;
  // Add to UserAttributes interface
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  status: "active" | "inactive" | "suspended";
}

// 2. Define which attributes are optional during 'User.create()'
// We omit 'id' because it has a defaultValue (UUIDV4)
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "procurement" | "supplier" | "auditor" | "superadmin";
  public organization?: string;
  public department?: string;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public status!: "active" | "inactive" | "suspended";
}

export function initUserModel(sequelize: Sequelize) {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Crucial for Sign-in logic
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "procurement",
          "supplier",
          "auditor",
          "superadmin",
        ),
        allowNull: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "User", // Changed from UserRole
      tableName: "users", // Changed from user_roles
      underscored: true,
      timestamps: true, // Usually better to keep track of when users joined
    },
  );

  return UserModel;
}

export default UserModel;
