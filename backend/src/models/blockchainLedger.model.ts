import { Model, DataTypes, Sequelize } from "sequelize";

export default class BlockchainLedgerModelClass extends Model {
  static associate(models: any) {
    // Isolated log, usually no direct foreign keys to maintain immutability
  }
}

export function initBlockchainLedgerModel(sequelize: Sequelize) {
  BlockchainLedgerModelClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      block_number: { type: DataTypes.BIGINT, allowNull: false },
      event: { type: DataTypes.STRING, allowNull: false },
      entity: { type: DataTypes.STRING, allowNull: false },
      tx_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      data_hash: { type: DataTypes.STRING, allowNull: false },
      previous_hash: { type: DataTypes.STRING },
      payload: { type: DataTypes.JSON },
    },
    {
      sequelize,
      modelName: "BlockchainLedger",
      tableName: "blockchain_ledger",
      underscored: true,
      createdAt: true,
      updatedAt: false,
    },
  );

  return BlockchainLedgerModelClass;
}
