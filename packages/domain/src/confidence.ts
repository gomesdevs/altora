import type { AssetType } from "./schemas/asset.js";
import type { ConfidenceLevel } from "./schemas/simulation-result.js";

/**
 * Confiança epistemológica por classe de ativo (INV-06).
 * PE e participação nunca retornam número pontual em simulações.
 */
export function confidenceForAssetType(type: AssetType): ConfidenceLevel {
  switch (type) {
    case "fii":
    case "cri":
    case "cash":
    case "credito_tokenizado":
      return "high";
    case "imovel":
      return "medium";
    case "pe":
    case "participacao":
      return "low";
  }
}

export function requiresRangeOutput(type: AssetType): boolean {
  return confidenceForAssetType(type) === "low";
}
