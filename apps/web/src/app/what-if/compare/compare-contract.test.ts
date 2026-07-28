import { describe, expect, it } from "vitest";

import type { SimulateScenarioResponse } from "../../../lib/scenarios-api";

/**
 * Contrato da UI de comparação: só tipa/exibe DTOs da API.
 * Não importa simulate de @altora/domain.
 */
describe("what-if compare client contract", () => {
  it("lista tipada traz result pronto para colunas lado a lado", () => {
    const list: SimulateScenarioResponse[] = [
      {
        id: "a",
        tenantId: "a1111111-1111-4111-8111-111111111111",
        name: "vacancia 10%",
        snapshot: {
          id: "s1",
          version: 1,
          capturedAt: "2026-07-28T12:00:00.000Z",
        },
        premises: { vacancia_percentual: 10 },
        result: {
          cashFlow: {
            "30d": { amount: 100_000, currency: "BRL" },
            "90d": { amount: 110_000, currency: "BRL" },
            "180d": { amount: 120_000, currency: "BRL" },
            "365d": { amount: 130_000, currency: "BRL" },
          },
          yield: { before: 0.045, after: 0.04 },
          concentration: { byClass: { cash: 0.1, real_estate: 0.9 } },
          structuralLiquidity: {
            "30d": { amount: 80_000, currency: "BRL" },
            "90d": { amount: 85_000, currency: "BRL" },
            "180d": { amount: 90_000, currency: "BRL" },
            "365d": { amount: 95_000, currency: "BRL" },
          },
          disclaimer:
            "Cenário hipotético para modelagem patrimonial. Não constitui recomendação de investimento.",
        },
        invariants: { "INV-05": true, "INV-06": true },
        createdAt: "2026-07-28T12:00:01.000Z",
      },
      {
        id: "b",
        tenantId: "a1111111-1111-4111-8111-111111111111",
        name: "vacancia 20%",
        snapshot: {
          id: "s2",
          version: 1,
          capturedAt: "2026-07-28T12:01:00.000Z",
        },
        premises: { vacancia_percentual: 20 },
        result: {
          cashFlow: {
            "30d": { amount: 90_000, currency: "BRL" },
            "90d": { amount: 95_000, currency: "BRL" },
            "180d": { amount: 100_000, currency: "BRL" },
            "365d": { amount: 105_000, currency: "BRL" },
          },
          yield: { before: 0.045, after: 0.035 },
          concentration: { byClass: { cash: 0.12, real_estate: 0.88 } },
          structuralLiquidity: {
            "30d": { amount: 70_000, currency: "BRL" },
            "90d": { amount: 75_000, currency: "BRL" },
            "180d": { amount: 80_000, currency: "BRL" },
            "365d": { amount: 85_000, currency: "BRL" },
          },
          disclaimer:
            "Cenário hipotético para modelagem patrimonial. Não constitui recomendação de investimento.",
        },
        invariants: { "INV-05": true, "INV-06": true },
        createdAt: "2026-07-28T12:01:01.000Z",
      },
    ];

    expect(list).toHaveLength(2);
    expect(list[0]!.result.cashFlow["30d"].amount).toBe(100_000);
    expect(list[1]!.result.cashFlow["30d"].amount).toBe(90_000);
    expect(list.every((s) => s.result.disclaimer.length > 10)).toBe(true);
  });

  it("seleção de comparação limita a 2–3 ids", () => {
    const MAX = 3;
    const MIN = 2;
    let selected: string[] = [];
    const toggle = (id: string) => {
      if (selected.includes(id)) {
        selected = selected.filter((x) => x !== id);
        return;
      }
      if (selected.length >= MAX) return;
      selected = [...selected, id];
    };

    toggle("a");
    toggle("b");
    toggle("c");
    toggle("d"); // deve ignorar (já no máximo)
    expect(selected).toEqual(["a", "b", "c"]);
    expect(selected.length).toBeGreaterThanOrEqual(MIN);
    expect(selected.length).toBeLessThanOrEqual(MAX);
  });
});
