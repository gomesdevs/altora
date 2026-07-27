import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import {
  applyStress,
  calculateConcentration,
  calculateStructuralLiquidity,
  aggregatePortfolio,
  simulate,
  type Snapshot,
  type Premises,
} from "../index.js";
import { loadGoldenFixtures } from "./helpers.js";

const baseline = loadGoldenFixtures().find((f) => f.id === "01-baseline-metrics")!;
const snapshot = baseline.input.snapshot as Snapshot;

function pointYield(after: unknown): number {
  if (typeof after === "number") return after;
  const range = after as { min: number; max: number };
  return (range.min + range.max) / 2;
}

function yieldMin(after: unknown): number {
  if (typeof after === "number") return after;
  return (after as { min: number }).min;
}

function yieldMax(after: unknown): number {
  if (typeof after === "number") return after;
  return (after as { max: number }).max;
}

describe("invariants INV-01..INV-10", () => {
  it("INV-01 — aumentar imposto nunca melhora netWorth", () => {
    fc.assert(
      fc.property(fc.double({ min: 1, max: 3, noNaN: true }), (feeMultiplier) => {
        const base = simulate(snapshot, {
          premises: {
            sell_asset_ids: ["asset-imovel-jardins"],
            tax_rate_capital_gains: 0.15,
            reallocate_to: "cash",
          },
        });
        const stressed = simulate(snapshot, {
          premises: {
            sell_asset_ids: ["asset-imovel-jardins"],
            tax_rate_capital_gains: 0.15 * feeMultiplier,
            reallocate_to: "cash",
          },
        });
        return (
          (stressed.netWorth?.amount ?? 0) <=
          (base.netWorth?.amount ?? 0) + 1
        );
      }),
      { numRuns: 20 },
    );
  });

  it("INV-02 — conservação de caixa (baseline 30d)", () => {
    const premises: Premises = {};
    const result = simulate(snapshot, { premises });
    const monthly = 14625;
    const expected = snapshot.cash.amount + monthly * 1;
    expect(result.cashFlow["30d"].amount).toBe(expected);
  });

  it("INV-03 — aumentar lock-up do PE não aumenta liquidez 30d", () => {
    const portfolio = aggregatePortfolio(snapshot.assets, snapshot.cash);
    const base = calculateStructuralLiquidity(portfolio, 30);

    const tighterAssets = snapshot.assets.map((a) =>
      a.type === "pe" ? { ...a, lockUpDays: 999, liquidityDays: 999 } : a,
    );
    const tighter = calculateStructuralLiquidity(
      aggregatePortfolio(tighterAssets, snapshot.cash),
      30,
    );
    expect(tighter.amount).toBeLessThanOrEqual(base.amount);
  });

  it("INV-04 — concentração bounded", () => {
    const result = simulate(snapshot, { premises: {} });
    for (const dim of ["byClass", "byRegion", "byIssuer"] as const) {
      const values = Object.values(result.concentration?.[dim] ?? {});
      expect(values.every((v) => v >= 0 && v <= 1)).toBe(true);
      const sum = values.reduce((a, b) => a + b, 0);
      expect(sum).toBeLessThanOrEqual(1.001);
    }
  });

  it("INV-05 — snapshot imutável após simulate/applyStress", () => {
    const before = structuredClone(snapshot);
    simulate(snapshot, {
      premises: { vacancia_percentual: 15, fii_shock_pct: -20 },
    });
    applyStress(snapshot, "fii_shock", { fii_shock_pct: -50 });
    expect(snapshot).toEqual(before);
  });

  it("INV-06 — PE produz faixa low; FII pode ser pontual high", () => {
    const peHeavy = loadGoldenFixtures().find(
      (f) => f.id === "07-liquidez-baixa-pe-heavy",
    )!;
    const peResult = simulate(peHeavy.input.snapshot as Snapshot, {
      premises: {},
    });
    expect(peResult.yield.after).toMatchObject({ confidence: "low" });
    expect(typeof peResult.yield.after).toBe("object");

    const fii = simulate(snapshot, { premises: { fii_shock_pct: -20 } });
    expect(typeof fii.yield.after).toBe("number");
    expect(fii.confidence).toBe("high");
  });

  it("INV-07 — ordem de sensibilidade trio", () => {
    const fix = loadGoldenFixtures().find((f) => f.id === "09-sensibilidade-trio")!;
    const variants = fix.input.scenario!.variants as Premises[];
    const [pess, base, opt] = [
      simulate(snapshot, { premises: variants[0] }),
      simulate(snapshot, { premises: variants[1] }),
      simulate(snapshot, { premises: variants[2] }),
    ];
    expect(yieldMin(pess.yield.after)).toBeLessThanOrEqual(
      pointYield(base.yield.after) + 1e-9,
    );
    expect(pointYield(base.yield.after)).toBeLessThanOrEqual(
      yieldMax(opt.yield.after) + 1e-9,
    );
    expect(pess.netWorth!.amount).toBeLessThanOrEqual(base.netWorth!.amount);
    expect(base.netWorth!.amount).toBeLessThanOrEqual(opt.netWorth!.amount);
  });

  it("INV-08 — vacância monotônica (property-based)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (vacancy) => {
        const stressed = simulate(snapshot, {
          premises: { vacancia_percentual: vacancy },
        });
        const base = simulate(snapshot, { premises: { vacancia_percentual: 0 } });
        return (
          pointYield(stressed.yield.after) <=
          pointYield(base.yield.after) + 1e-6
        );
      }),
      { numRuns: 15 },
    );
  });

  it("INV-09 — isolamento de tenant", () => {
    const other: Snapshot = {
      ...structuredClone(snapshot),
      tenantId: "tenant-other",
      assets: snapshot.assets.map((a) => ({
        ...a,
        id: `${a.id}-other`,
        valuation: {
          ...a.valuation,
          amount: { amount: 999_999_999, currency: "BRL" },
        },
      })),
      cash: { amount: 1, currency: "BRL" },
    };
    const resultA = simulate(snapshot, { premises: {} });
    expect(resultA.netWorth?.amount).toBe(3_850_000);
    expect(resultA.netWorth?.amount).not.toBe(
      simulate(other, { premises: {} }).netWorth?.amount,
    );
  });

  it("INV-10 — disclaimer obrigatório de modelagem", () => {
    for (const fixture of loadGoldenFixtures()) {
      const result = simulate(fixture.input.snapshot as Snapshot, {
        premises: (fixture.input.premises ?? {}) as Premises,
      });
      expect(result.disclaimer.length).toBeGreaterThan(10);
      expect(result.disclaimer.toLowerCase()).toMatch(
        /hipotétic|modelagem|não constitui recomendação/,
      );
    }
  });
});

describe("concentration helper", () => {
  it("soma byClass ≤ 1", () => {
    const portfolio = aggregatePortfolio(snapshot.assets, snapshot.cash);
    const byClass = calculateConcentration(portfolio, "class");
    const sum = Object.values(byClass).reduce((a, b) => a + b, 0);
    expect(sum).toBeLessThanOrEqual(1.001);
  });
});
