import { Model, DataTypes, Sequelize } from "sequelize";

export default class UserRoleModelClass extends Model {
  static associate(models: any) {
    // Links to external auth.users table, so no strict Sequelize relations here unless you mock users
  }
}

export function initUserRoleModel(sequelize: Sequelize) {
  UserRoleModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "procurement", "supplier"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserRole",
      tableName: "user_roles",
      underscored: true,
      timestamps: false,
      indexes: [{ unique: true, fields: ["user_id", "role"] }],
    },
  );

  return UserRoleModelClass;
}
