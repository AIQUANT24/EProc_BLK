export interface LedgerEntry {
  id: string;
  event: string;
  entity: string;
  user: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  dataHash: string;
  previousHash: string;
}

let blockCounter = 1000;
let previousHash = "0x000000...genesis";

function generateHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 12; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash + "..." + chars[Math.floor(Math.random() * 16)].repeat(3);
}

function hashData(data: string): string {
  // Simple simulated hash
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0;
  }
  return "0x" + Math.abs(h).toString(16).padStart(8, "0") + "...sha256";
}

export function anchorToLedger(event: string, entity: string, user: string, data?: Record<string, unknown>): LedgerEntry {
  const txHash = generateHash();
  const dataHash = hashData(JSON.stringify(data || { event, entity, timestamp: Date.now() }));
  const entry: LedgerEntry = {
    id: `LED-${String(++blockCounter).padStart(4, "0")}`,
    event,
    entity,
    user,
    txHash,
    blockNumber: blockCounter,
    timestamp: new Date().toISOString(),
    dataHash,
    previousHash,
  };
  previousHash = txHash;
  return entry;
}

// Pre-seed some entries
const SEED_ENTRIES: LedgerEntry[] = [
  anchorToLedger("Supplier Registered", "SUP-001", "Vikram Industries", { name: "Vikram Industries Pvt Ltd" }),
  anchorToLedger("Supplier Registered", "SUP-002", "Bharat Electronics", { name: "Bharat Electronics Ltd" }),
  anchorToLedger("Product Created", "PRD-001", "Vikram Industries", { name: "Industrial Motor Assembly" }),
  anchorToLedger("BOM Submitted", "PRD-001", "Vikram Industries", { components: 8, totalCost: 245000 }),
  anchorToLedger("DVA Calculated", "PRD-001", "System", { dvaScore: 62.8, classification: "Class I" }),
  anchorToLedger("Classification Assigned", "PRD-001", "System", { classification: "Class I", confidence: 0.87 }),
  anchorToLedger("Verification Requested", "PRD-001", "GeM Portal", { requestedBy: "GeM Portal" }),
  anchorToLedger("Verification Completed", "PRD-001", "System", { status: "verified", dvaScore: 62.8 }),
  anchorToLedger("Product Created", "PRD-002", "Bharat Electronics", { name: "Radar Processing Unit" }),
  anchorToLedger("BOM Submitted", "PRD-002", "Bharat Electronics", { components: 12, totalCost: 1850000 }),
  anchorToLedger("DVA Calculated", "PRD-002", "System", { dvaScore: 45.2, classification: "Class II" }),
  anchorToLedger("Alert Generated", "PRD-005", "Fraud Engine", { alertType: "Low DVA Score", severity: "high" }),
  anchorToLedger("Alert Generated", "PRD-004", "Fraud Engine", { alertType: "Cost Anomaly", severity: "medium" }),
];

export function getSeedEntries(): LedgerEntry[] {
  return [...SEED_ENTRIES];
}
