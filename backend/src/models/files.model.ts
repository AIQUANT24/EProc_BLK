// models/file.model.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface FileAttributes {
  id: string;
  productId: string;
  filename: string;
  mimetype: string;
  data: Buffer;
}

interface FileCreationAttributes extends Optional<FileAttributes, "id"> {}

export default class FileModel
  extends Model<FileAttributes, FileCreationAttributes>
  implements FileAttributes
{
  public id!: string;
  public productId!: string;
  public filename!: string;
  public mimetype!: string;
  public data!: Buffer;

  // Added Association block to link it perfectly with Product
  static associate(models: any) {
    FileModel.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}

export function initFileModel(sequelize: Sequelize) {
  FileModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "product_id", // Explicitly mapping for underscored: true
        references: {
          model: "products",
          key: "id",
        },
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.BLOB("long"), // Perfect for files
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "File",
      tableName: "files",
      underscored: true,
      timestamps: true,
    },
  );

  return FileModel;
}
