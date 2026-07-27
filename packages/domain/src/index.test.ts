import { describe, expect, it } from "vitest";

import {
  AssetSchema,
  MoneySchema,
  SnapshotSchema,
  confidenceForAssetType,
  requiresRangeOutput,
} from "./index.js";

describe("MoneySchema", () => {
  it("aceita BRL válido", () => {
    expect(MoneySchema.parse({ amount: 1000, currency: "BRL" })).toEqual({
      amount: 1000,
      currency: "BRL",
    });
  });

  it("rejeita outra moeda", () => {
    expect(() =>
      MoneySchema.parse({ amount: 10, currency: "USD" }),
    ).toThrow();
  });
});

describe("confiança epistemológica", () => {
  it("FII é alta; PE e participação exigem faixa", () => {
    expect(confidenceForAssetType("fii")).toBe("high");
    expect(confidenceForAssetType("imovel")).toBe("medium");
    expect(confidenceForAssetType("pe")).toBe("low");
    expect(requiresRangeOutput("participacao")).toBe(true);
    expect(requiresRangeOutput("fii")).toBe(false);
  });
});

describe("SnapshotSchema", () => {
  it("exige tenantId e valuation completo", () => {
    const snapshot = SnapshotSchema.parse({
      id: "snap-1",
      version: 1,
      capturedAt: "2026-07-27T12:00:00.000Z",
      tenantId: "tenant-silva",
      entities: [{ id: "ent-1", name: "Holding Silva", type: "holding" }],
      assets: [
        AssetSchema.parse({
          id: "asset-1",
          entityId: "ent-1",
          type: "fii",
          name: "FII Exemplo",
          valuation: {
            amount: { amount: 1_000_000, currency: "BRL" },
            method: "market",
            asOf: "2026-07-27",
            source: "B3",
          },
        }),
      ],
      cash: { amount: 50_000, currency: "BRL" },
    });

    expect(snapshot.tenantId).toBe("tenant-silva");
    expect(snapshot.assets).toHaveLength(1);
  });
});
