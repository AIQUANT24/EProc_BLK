import type { BOMComponent, Product } from "@/contexts/MockDataContext";

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
  check: (ctx: FraudCheckContext) => FraudAlert | null;
}

export interface FraudCheckContext {
  product: Product;
  components: BOMComponent[];
  previousDva?: number;
}

export interface FraudAlert {
  ruleId: string;
  ruleName: string;
  severity: "high" | "medium" | "low";
  description: string;
  details: string;
  productId: string;
  productName: string;
}

const FRAUD_RULES: FraudRule[] = [
  {
    id: "FR-01",
    name: "DVA Jump Detection",
    description: "DVA changes > 15% between declarations",
    severity: "high",
    check: ({ product, components, previousDva }) => {
      if (previousDva === undefined) return null;
      const totalCost = components.reduce((s, c) => s + c.cost, 0);
      const domesticCost = components.filter(c => c.origin === "domestic").reduce((s, c) => s + c.cost, 0);
      const currentDva = totalCost > 0 ? (domesticCost / totalCost) * 100 : 0;
      const diff = Math.abs(currentDva - previousDva);
      if (diff > 15) {
        return {
          ruleId: "FR-01", ruleName: "DVA Jump Detection", severity: "high",
          description: `DVA changed by ${diff.toFixed(1)}% (threshold: 15%)`,
          details: `Previous DVA: ${previousDva.toFixed(1)}%, Current: ${currentDva.toFixed(1)}%`,
          productId: product.id, productName: product.name,
        };
      }
      return null;
    },
  },
  {
    id: "FR-02",
    name: "Post-Bid BOM Change",
    description: "BOM modified after bid submission",
    severity: "high",
    check: ({ product }) => {
      if (product.status === "submitted" || product.status === "verified") {
        // Simulated: flag if product was modified after submission
        return null; // Would need timestamp tracking
      }
      return null;
    },
  },
  {
    id: "FR-03",
    name: "Import Mismatch",
    description: "Component claimed domestic but import record found",
    severity: "high",
    check: ({ components }) => {
      // Simulated: check for known imported components claimed as domestic
      const suspicious = components.filter(c =>
        c.origin === "domestic" && c.supplierName.toLowerCase().includes("import")
      );
      if (suspicious.length > 0) {
        return {
          ruleId: "FR-03", ruleName: "Import Mismatch", severity: "high",
          description: `${suspicious.length} component(s) flagged for origin mismatch`,
          details: suspicious.map(c => c.name).join(", "),
          productId: "", productName: "",
        };
      }
      return null;
    },
  },
  {
    id: "FR-04",
    name: "Cost Anomaly Detection",
    description: "Component cost significantly deviates from expected range",
    severity: "medium",
    check: ({ product, components }) => {
      const totalCost = components.reduce((s, c) => s + c.cost, 0);
      const importedCost = components.filter(c => c.origin === "imported").reduce((s, c) => s + c.cost, 0);
      const importRatio = totalCost > 0 ? importedCost / totalCost : 0;
      if (importRatio > 0.6) {
        return {
          ruleId: "FR-04", ruleName: "Cost Anomaly", severity: "medium",
          description: `Imported component cost exceeds 60% of total BOM (${(importRatio * 100).toFixed(1)}%)`,
          details: `Imported: ₹${importedCost.toLocaleString("en-IN")} / Total: ₹${totalCost.toLocaleString("en-IN")}`,
          productId: product.id, productName: product.name,
        };
      }
      return null;
    },
  },
  {
    id: "FR-05",
    name: "Circular Supply Detection",
    description: "Supplier and component supplier appear to be same entity",
    severity: "medium",
    check: ({ components }) => {
      const names = components.map(c => c.supplierName.toLowerCase());
      const duplicates = names.filter((n, i) => n === "in-house" || names.indexOf(n) !== i);
      // Only flag if multiple in-house with high cost
      const inHouse = components.filter(c => c.supplierName.toLowerCase() === "in-house");
      if (inHouse.length > 2) {
        return {
          ruleId: "FR-05", ruleName: "Circular Supply", severity: "medium",
          description: `${inHouse.length} components sourced in-house — potential self-supply inflation`,
          details: inHouse.map(c => c.name).join(", "),
          productId: "", productName: "",
        };
      }
      return null;
    },
  },
  {
    id: "FR-06",
    name: "Missing Cost Data",
    description: "Components with zero or missing cost values",
    severity: "low",
    check: ({ product, components }) => {
      const zeroCost = components.filter(c => c.cost <= 0);
      if (zeroCost.length > 0) {
        return {
          ruleId: "FR-06", ruleName: "Missing Cost Data", severity: "low",
          description: `${zeroCost.length} component(s) have zero or missing cost`,
          details: zeroCost.map(c => c.name).join(", "),
          productId: product.id, productName: product.name,
        };
      }
      return null;
    },
  },
];

export function runFraudChecks(ctx: FraudCheckContext): FraudAlert[] {
  return FRAUD_RULES.map(rule => rule.check(ctx)).filter(Boolean) as FraudAlert[];
}

export function getAllRules(): Omit<FraudRule, "check">[] {
  return FRAUD_RULES.map(({ check, ...rest }) => rest);
}
