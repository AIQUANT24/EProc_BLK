import { Wallets } from "fabric-network";
import fs from "fs";
import path from "path";
 
async function main() {
  try {
    // 1. Wallet Path
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
 
    // 2. Credential Path
    // navigating from 'backend' -> 'digital-cert-system' -> 'fabric-samples'
  const credPath = path.resolve(
  __dirname,
  "..",     // src -> backend
  "..",     // backend -> project root
  "hyperledger",
  "network",
  "organizations",
  "peerOrganizations",
  "org1.example.com",
  "users",
  "Admin@org1.example.com",
  "msp"
);

console.log(`Credential path: ${credPath}`);
 
    // 3. Read Certificate
    // FIX: The file in your tree is named 'cert.pem', NOT 'Admin@org1...pem'
    const certPath = path.join(
      credPath,
      "signcerts",
      "Admin@org1.example.com-cert.pem",
    );
 
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificate file not found at: ${certPath}`);
    }
    const certificate = fs.readFileSync(certPath).toString();
 
    // 4. Read Private Key
    const keyDir = path.join(credPath, "keystore");
    const keyFiles = fs.readdirSync(keyDir);
    const keyPath = path.join(keyDir, keyFiles[0]);
    const privateKey = fs.readFileSync(keyPath).toString();
 
    // 5. Create Identity
    const identity = {
      credentials: {
        certificate: certificate,
        privateKey: privateKey,
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
 
    await wallet.put("appUser", identity);
    console.log(
      'Successfully imported Admin credentials into wallet as "appUser"',
    );
  } catch (error) {
    console.error(`Error adding to wallet: ${error}`);
  }
}
 
main();