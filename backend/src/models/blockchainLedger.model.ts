import { Model, DataTypes, Sequelize, Optional } from "sequelize";

interface BlockchainLedgerAttributes {
  id: string;
  block_number: number | string; // Handled as string by DB for precision
  event: string;
  entity: string;
  tx_hash: string;
  data_hash: string;
  previous_hash: string | null;
  payload: Record<string, any>; // More flexible than 'object'
  created_at?: Date;
}

// Omit 'id' and 'created_at' as they are auto-generated
interface BlockchainLedgerCreationAttributes extends Optional<
  BlockchainLedgerAttributes,
  "id" | "created_at"
> {}

class BlockchainLedger
  extends Model<BlockchainLedgerAttributes, BlockchainLedgerCreationAttributes>
  implements BlockchainLedgerAttributes
{
  public id!: string;
  public block_number!: number | string;
  public event!: string;
  public entity!: string;
  public tx_hash!: string;
  public data_hash!: string;
  public previous_hash!: string | null;
  public payload!: Record<string, any>;
  public readonly created_at!: Date;
}

export function initBlockchainLedgerModel(sequelize: Sequelize) {
  BlockchainLedger.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      block_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      event: { type: DataTypes.STRING, allowNull: false },
      entity: { type: DataTypes.STRING, allowNull: false },
      tx_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      data_hash: { type: DataTypes.STRING, allowNull: false },
      previous_hash: {
        type: DataTypes.STRING,
        allowNull: true, // First block might not have a previous hash
      },
      payload: {
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "BlockchainLedger",
      tableName: "blockchain_ledger",
      underscored: true,
      timestamps: true,
      createdAt: "created_at", // Explicitly map to underscored name
      updatedAt: false,
      indexes: [{ fields: ["block_number"] }, { fields: ["entity"] }],
    },
  );

  return BlockchainLedger;
}

export default BlockchainLedger;
