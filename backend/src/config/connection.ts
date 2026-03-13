import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define these once at the top
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export interface CertificateAuthority {
  url: string;
  caName: string;
}

export interface ConnectionProfile {
  certificateAuthorities: {
    [key: string]: {
      url: string;
      caName?: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

export const getCCP = (): ConnectionProfile => {
  const ccpPath = path.resolve(
    "/home/rayan-ahmad/Desktop/nicov/hyperledger/network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  );

  try {
    const ccpContent = fs.readFileSync(ccpPath, "utf8");
    return JSON.parse(ccpContent);
  } catch (error) {
    console.error("Failed to read connection profile:", error);
    throw new Error(`Could not load connection profile from ${ccpPath}`);
  }
};

export const getCaInfo = (ccp: ConnectionProfile): CertificateAuthority => {
  const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];

  if (!caInfo) {
    throw new Error(
      'Certificate authority "ca.org1.example.com" not found in connection profile',
    );
  }

  return {
    url: caInfo.url,
    caName: "ca.org1.example.com",
  };
};
