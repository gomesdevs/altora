import type { AssetType } from "./schemas/asset.js";
import type {
  ConfidenceLevel,
  RangeWithConfidence,
} from "./schemas/simulation-result.js";

export type PointValue = {
  value: number;
  confidence: "high";
};

export type IntervalValue = RangeWithConfidence;

const BANDS: Record<ConfidenceLevel, { low: number; high: number }> = {
  high: { low: 1, high: 1 },
  medium: { low: 0.95, high: 1.05 },
  low: { low: 0.85, high: 1.15 },
};

/**
 * Confiança epistêmica por classe (contratos / INV-06).
 */
export function getConfidenceLevel(assetType: AssetType): ConfidenceLevel {
  switch (assetType) {
    case "fii":
    case "cash":
      return "high";
    case "imovel":
    case "cri":
    case "credito_tokenizado":
      return "medium";
    case "pe":
    case "participacao":
      return "low";
  }
}

/** Alias estável — preferir getConfidenceLevel. */
export function confidenceForAssetType(type: AssetType): ConfidenceLevel {
  return getConfidenceLevel(type);
}

export function requiresRangeOutput(type: AssetType): boolean {
  return getConfidenceLevel(type) === "low";
}

export function formatWithConfidence(
  value: number,
  assetType: AssetType,
): PointValue | IntervalValue {
  return formatWithLevel(value, getConfidenceLevel(assetType));
}

export function formatWithLevel(
  value: number,
  level: ConfidenceLevel,
): PointValue | IntervalValue {
  if (level === "high") {
    return { value, confidence: "high" };
  }
  const band = BANDS[level];
  return {
    min: round4(value * band.low),
    max: round4(value * band.high),
    confidence: level,
  };
}

export function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

export function lowestConfidence(
  levels: ConfidenceLevel[],
): ConfidenceLevel {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return levels.reduce<ConfidenceLevel>(
    (acc, level) => (rank[level] > rank[acc] ? level : acc),
    "high",
  );
}
