import type { Premises, Snapshot, SimulationResult } from "@altora/domain";
import {
  PremisesSchema,
  SnapshotSchema,
  confidenceForAssetType,
  requiresRangeOutput,
} from "@altora/domain";

/**
 * Entrada do motor: snapshot imutável + premissas do cenário.
 * Regras patrimoniais vivem em @altora/domain — aqui só orquestração.
 */
export type SimulationInput = {
  snapshot: Snapshot;
  premises: Premises;
};

/**
 * Stub do motor — implementação completa virá com golden fixtures.
 * Já exige snapshot + premissas tipados e respeita INV-06 no contrato.
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  const snapshot = SnapshotSchema.parse(input.snapshot);
  const premises = PremisesSchema.parse(input.premises);

  // Snapshot não é mutado — parse retorna cópia validada.
  void premises;

  const hasLowConfidence = snapshot.assets.some((asset) =>
    requiresRangeOutput(asset.type),
  );

  const lowest = snapshot.assets
    .map((a) => confidenceForAssetType(a.type))
    .reduce<ReturnType<typeof confidenceForAssetType>>((acc, level) => {
      const rank = { high: 0, medium: 1, low: 2 } as const;
      return rank[level] > rank[acc] ? level : acc;
    }, "high");

  return {
    cashFlow: {
      "30d": snapshot.cash,
      "90d": snapshot.cash,
      "180d": snapshot.cash,
      "365d": snapshot.cash,
    },
    yield: {
      before: 0,
      after: hasLowConfidence
        ? { min: 0, max: 0, confidence: "low" }
        : 0,
    },
    concentration: { byClass: {} },
    structuralLiquidity: {
      "30d": { amount: 0, currency: "BRL" },
      "90d": { amount: 0, currency: "BRL" },
      "180d": { amount: 0, currency: "BRL" },
      "365d": { amount: 0, currency: "BRL" },
    },
    netWorth: snapshot.cash,
    disclaimer:
      "Cenário hipotético de modelagem. Stub do motor — não use como recomendação.",
    confidence: lowest,
  };
}
