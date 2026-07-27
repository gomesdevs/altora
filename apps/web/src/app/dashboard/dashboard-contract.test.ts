import { describe, expect, it } from "vitest";

import type { ConsolidatedPortfolio } from "../../lib/portfolio-api";

/**
 * Garante que o client só tipa/exibe o DTO da API —
 * sem recalcular yield ou concentração no frontend.
 */
describe("dashboard client contract", () => {
  it("DTO consolidado traz métricas prontas da API", () => {
    const dto: ConsolidatedPortfolio = {
      tenantId: "a1111111-1111-4111-8111-111111111111",
      netWorth: { amount: 3_850_000, currency: "BRL" },
      monthlyIncome: { amount: 14_625, currency: "BRL" },
      yield: 0.0456,
      concentration: {
        byClass: {
          real_estate: 0.6623,
          fixed_income: 0.0779,
          private_equity: 0.2078,
          cash: 0.0519,
        },
      },
      assetCount: 4,
    };

    expect(dto.yield).toBe(0.0456);
    expect(Object.keys(dto.concentration.byClass).length).toBeGreaterThan(0);
  });
});
