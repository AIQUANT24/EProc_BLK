export interface DVAResult {
  dvaScore: number;
  domesticCost: number;
  importedCost: number;
  totalCost: number;
  classification: "Class I" | "Class II" | "Non-Local";
  confidenceScore: number;
  confidenceFactors: ConfidenceFactor[];
  riskScore: number;
}

export interface ConfidenceFactor {
  factor: string;
  weight: number;
  score: number;
  detail: string;
}

export interface WhatIfScenario {
  componentId: string;
  newOrigin?: "domestic" | "imported";
  newCost?: number;
}

// 1. Define the interfaces so the engine is completely standalone
export interface BOMComponent {
  id: string;
  productId: string; // Resolves the TS2345 error!
  name: string;
  origin: "domestic" | "imported";
  cost: number;
  supplierName?: string;
}

export interface ConfidenceFactor {
  factor: string;
  weight: number;
  score: number;
  detail: string;
}

export interface DVAResult {
  dvaScore: number;
  domesticCost: number;
  importedCost: number;
  totalCost: number;
  classification: "Class I" | "Class II" | "Non-Local";
  confidenceScore: number;
  confidenceFactors: ConfidenceFactor[];
  riskScore: number;
}

export interface WhatIfScenario {
  componentId: string;
  newOrigin?: "domestic" | "imported";
  newCost?: number;
}

// 2. Constants used for Fraud & Confidence scoring
const CONFIDENCE_WEIGHTS: Record<string, number> = {
  gstVerified: 0.3,
  customsCorrelation: 0.2,
  manufacturingLicense: 0.2,
  historicalConsistency: 0.1,
  thirdPartyAudit: 0.2,
};

// In a real app, this comes from an external API or DB verification table
const COMPONENT_VERIFICATION: Record<string, Record<string, boolean>> = {};

// 3. Engine Functions
export function classify(
  dvaScore: number,
): "Class I" | "Class II" | "Non-Local" {
  if (dvaScore >= 50) return "Class I";
  if (dvaScore >= 20) return "Class II";
  return "Non-Local";
}

export function calculateConfidence(components: BOMComponent[]): {
  score: number;
  factors: ConfidenceFactor[];
} {
  const factors: ConfidenceFactor[] = [];
  let totalScore = 0;

  for (const [key, weight] of Object.entries(CONFIDENCE_WEIGHTS)) {
    const label =
      key === "gstVerified"
        ? "GST Verification"
        : key === "customsCorrelation"
          ? "Customs Data Correlation"
          : key === "manufacturingLicense"
            ? "Manufacturing License"
            : key === "historicalConsistency"
              ? "Historical Consistency"
              : "Third-Party Audit";

    let verified = 0;
    for (const c of components) {
      const v = COMPONENT_VERIFICATION[c.id];
      if (v && v[key]) verified++;
    }
    const ratio = components.length > 0 ? verified / components.length : 0;
    const factorScore = ratio * weight;
    totalScore += factorScore;

    factors.push({
      factor: label,
      weight,
      score: ratio,
      detail: `${verified}/${components.length} components verified`,
    });
  }

  return { score: Math.min(totalScore / 1, 1), factors };
}

export function calculateDVA(components: BOMComponent[]): DVAResult {
  const totalCost = components.reduce((s, c) => s + c.cost, 0);
  const domesticCost = components
    .filter((c) => c.origin === "domestic")
    .reduce((s, c) => s + c.cost, 0);
  const importedCost = totalCost - domesticCost;
  const dvaScore = totalCost > 0 ? (domesticCost / totalCost) * 100 : 0;

  const classification = classify(dvaScore);
  const { score: confidenceScore, factors: confidenceFactors } =
    calculateConfidence(components);

  // Risk = inverse of confidence weighted by DVA proximity to threshold
  const thresholdProximity =
    Math.min(Math.abs(dvaScore - 50), Math.abs(dvaScore - 20)) / 50;
  const riskScore = Math.max(
    0,
    Math.min(1, (1 - confidenceScore) * 0.6 + (1 - thresholdProximity) * 0.4),
  );

  return {
    dvaScore: Math.round(dvaScore * 10) / 10,
    domesticCost,
    importedCost,
    totalCost,
    classification,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    confidenceFactors,
    riskScore: Math.round(riskScore * 100) / 100,
  };
}

export function whatIfAnalysis(
  components: BOMComponent[],
  scenarios: WhatIfScenario[],
): DVAResult {
  const modified = components.map((c) => {
    const scenario = scenarios.find((s) => s.componentId === c.id);
    if (!scenario) return c;
    return {
      ...c,
      origin: scenario.newOrigin ?? c.origin,
      cost: scenario.newCost ?? c.cost,
    };
  });
  return calculateDVA(modified);
}
