import { Gateway, Wallets, Wallet, GatewayOptions, Contract } from "fabric-network";
import { getCCP, ConnectionProfile } from "../config/connection.js";
import { CHANNEL_NAME, CHAINCODE_NAME, WALLET_PATH } from "../config/constant.js";
import path from "path";
import { fileURLToPath } from "url";


export class FabricService {
  private wallet: Wallet | null = null;
  private ccp: ConnectionProfile | null = null;

  constructor() {}

  async getWallet(): Promise<Wallet> {
    if (!this.wallet) {
      const walletPath = path.join(process.cwd(), "wallet");
      console.log(`💰 Wallet path: ${walletPath}`);
      this.wallet = await Wallets.newFileSystemWallet(walletPath);
      
      // Debug: List all identities in wallet
      const identities = await this.wallet.list();
      console.log(`📋 Available identities in wallet: ${identities.join(', ') || 'None'}`);
    }
    return this.wallet;
  }

  getCCP(): ConnectionProfile {
    if (!this.ccp) {
      this.ccp = getCCP();
    }
    return this.ccp;
  }

  async getContract(userId: string): Promise<Contract> {
    // Remove default value - require userId to be passed
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required. Please provide a valid user ID.");
    }

    console.log(`🔍 Getting contract for user: ${userId}`);
    
    const wallet = await this.getWallet();
    const identity = await wallet.get(userId);

    if (!identity) {
      const availableIdentities = await wallet.list();
      console.log(`❌ User ${userId} not found in wallet.`);
      console.log(`✅ Available users: ${availableIdentities.join(', ') || 'None'}`);
      throw new Error(`User ${userId} not found in wallet. Available users: ${availableIdentities.join(', ') || 'None'}`);
    }

    console.log(`✅ Identity found for user: ${userId}`);

    const gateway = new Gateway();
    try {
      const gatewayOptions: GatewayOptions = {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
      };
      
      await gateway.connect(this.getCCP(), gatewayOptions);

      const network = await gateway.getNetwork(CHANNEL_NAME);
      const contract = network.getContract(CHAINCODE_NAME);
      
      console.log(`✅ Contract obtained successfully for user: ${userId}`);
      
      // Store gateway to disconnect later? You might want to add a method for that
      // For now, we'll return the contract and handle gateway in the calling code
      (contract as any).gateway = gateway; // Optional: attach gateway to contract for later disconnection
      
      return contract;
      
    } catch (error) {
      console.error(`❌ Failed to get contract for user ${userId}:`, error);
      throw new Error(`Failed to connect to Fabric network: ${(error as Error).message}`);
    }
  }

  // Helper method to check if user exists
  async userExists(userId: string): Promise<boolean> {
    const wallet = await this.getWallet();
    const identity = await wallet.get(userId);
    return identity !== undefined;
  }

  // Optional: Helper method to disconnect gateway
  async disconnectContract(contract: Contract): Promise<void> {
    const gateway = (contract as any).gateway as Gateway;
    if (gateway) {
      await gateway.disconnect();
    }
  }
}