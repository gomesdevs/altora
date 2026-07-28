import { describe, expect, it } from "vitest";

import {
  assetFromCreateInput,
  CreateAssetInputSchema,
} from "../schemas/asset-create.js";

describe("CreateAssetInputSchema", () => {
  it("aceita imóvel mínimo", () => {
    const parsed = CreateAssetInputSchema.parse({
      type: "imovel",
      entityId: "b3333333-3333-4333-8333-333333333333",
      name: "Loja Pinheiros",
      region: "SP",
      valuationAmount: 1_500_000,
      valuationAsOf: "2025-06-01",
      valuationSource: "Laudo ABC",
      monthlyIncomeAmount: 12_000,
      vacancyRate: 0.05,
      liquidityDays: 120,
    });
    const asset = assetFromCreateInput(parsed, "new-asset-id");
    expect(asset.type).toBe("imovel");
    expect(asset.valuation.method).toBe("laudo");
    expect(asset.monthlyIncome?.amount).toBe(12_000);
  });

  it("aceita FII mínimo", () => {
    const parsed = CreateAssetInputSchema.parse({
      type: "fii",
      entityId: "b2222222-2222-4222-8222-222222222222",
      name: "HGLG11",
      region: "SP",
      issuer: "CSHG",
      valuationAmount: 250_000,
      valuationAsOf: "2025-07-01",
      valuationSource: "B3",
      monthlyIncomeAmount: 1_800,
    });
    const asset = assetFromCreateInput(parsed, "fii-id");
    expect(asset.type).toBe("fii");
    expect(asset.valuation.method).toBe("market");
    expect(asset.issuer).toBe("CSHG");
  });

  it("rejeita tipo fora do escopo", () => {
    expect(() =>
      CreateAssetInputSchema.parse({
        type: "pe",
        entityId: "b2222222-2222-4222-8222-222222222222",
        name: "PE",
        valuationAmount: 100,
        valuationAsOf: "2025-01-01",
        valuationSource: "x",
        monthlyIncomeAmount: 0,
      }),
    ).toThrow();
  });
});
