import { describe, expect, it } from "vitest";

import type { AssetDto } from "../../lib/assets-api";
import { formValuesToCreateAssetBody } from "../../lib/asset-create-form";

describe("assets client contract", () => {
  it("DTO de ativo vem tipado da API", () => {
    const dto: AssetDto = {
      id: "c8888888-8888-4888-8888-888888888888",
      entityId: "b3333333-3333-4333-8333-333333333333",
      type: "imovel",
      name: "Galpão Teste",
      region: "SP",
      valuation: {
        amount: { amount: 1_500_000, currency: "BRL" },
        method: "laudo",
        asOf: "2025-06-01",
        source: "Laudo",
      },
      monthlyIncome: { amount: 12_000, currency: "BRL" },
      vacancyRate: 0.05,
      liquidityDays: 60,
    };

    expect(dto.type).toBe("imovel");
    expect(dto.valuation.amount.amount).toBe(1_500_000);
  });

  it("formulário mapeia body de criação para a API", () => {
    const body = formValuesToCreateAssetBody({
      type: "fii",
      entityId: "b2222222-2222-4222-8222-222222222222",
      name: "XPML11",
      region: "SP",
      issuer: "XP",
      valuationAmount: "250000",
      valuationAsOf: "2025-07-01",
      valuationSource: "B3",
      monthlyIncomeAmount: "1800",
      liquidityDays: "5",
    });

    expect(body.type).toBe("fii");
    expect(body.issuer).toBe("XP");
    expect(body.valuationAmount).toBe(250_000);
    expect(body.liquidityDays).toBe(5);
  });
});
