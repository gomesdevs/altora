import { describe, expect, it } from "vitest";

import type { SimulateScenarioResponse } from "../../lib/scenarios-api";
import { formValuesToSimulateInput } from "../../lib/what-if-form";

/**
 * Garante que o client só tipa/exibe o DTO da API —
 * sem recalcular simulação no frontend.
 */
describe("what-if client contract", () => {
  it("DTO de simulação traz métricas prontas da API", () => {
    const dto: SimulateScenarioResponse = {
      id: "scenario-1",
      tenantId: "a1111111-1111-4111-8111-111111111111",
      name: "vacancia 15%",
      snapshot: {
        id: "snap-1",
        version: 1,
        capturedAt: "2026-07-27T12:00:00.000Z",
      },
      premises: { vacancia_percentual: 15 },
      result: {
        cashFlow: {
          "30d": { amount: 180_000, currency: "BRL" },
          "90d": { amount: 195_000, currency: "BRL" },
          "180d": { amount: 210_000, currency: "BRL" },
          "365d": { amount: 225_000, currency: "BRL" },
        },
        yield: { before: 0.045, after: 0.042 },
        concentration: {
          byClass: {
            real_estate: 0.65,
            fixed_income: 0.08,
            private_equity: 0.2,
            cash: 0.07,
          },
        },
        structuralLiquidity: {
          "30d": { amount: 150_000, currency: "BRL" },
          "90d": { amount: 160_000, currency: "BRL" },
          "180d": { amount: 170_000, currency: "BRL" },
          "365d": { amount: 180_000, currency: "BRL" },
        },
        disclaimer:
          "Cenário hipotético para modelagem patrimonial. Não constitui recomendação de investimento.",
        confidence: "medium",
      },
      invariants: { "INV-05": true, "INV-06": true },
      createdAt: "2026-07-27T12:00:01.000Z",
    };

    expect(dto.result.cashFlow["30d"].amount).toBe(180_000);
    expect(dto.result.disclaimer.length).toBeGreaterThan(10);
    expect(dto.invariants["INV-06"]).toBe(true);
    expect(Object.keys(dto.result.concentration?.byClass ?? {}).length).toBe(
      4,
    );
  });

  it("formulário mapeia premissas para o body da API", () => {
    const input = formValuesToSimulateInput({
      name: "stress vacância",
      vacancia_percentual: "15",
      capital_call_amount: "500000",
      sensitivity: "base",
    });

    expect(input.name).toBe("stress vacância");
    expect(input.premises?.vacancia_percentual).toBe(15);
    expect(input.premises?.capital_call).toEqual({
      amount: 500_000,
      currency: "BRL",
    });
    expect(input.premises?.sensitivity).toBe("base");
  });
});
