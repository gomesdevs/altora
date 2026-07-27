import { describe, expect, it } from "vitest";

import { simulate, simulateVariants } from "../index.js";
import type { Premises } from "../schemas/premises.js";
import type { Snapshot } from "../schemas/snapshot.js";
import type { SimulationResult } from "../schemas/simulation-result.js";
import {
  loadGoldenFixtures,
  withinTolerance,
  type FixtureTolerance,
} from "./helpers.js";

function expectMoney(
  actual: { amount: number; currency: string },
  expected: { amount: number; currency: string },
  tolerance: FixtureTolerance,
  label: string,
) {
  expect(actual.currency, label).toBe(expected.currency);
  expect(
    withinTolerance(actual.amount, expected.amount, tolerance),
    `${label}: ${actual.amount} vs ${expected.amount}`,
  ).toBe(true);
}

function expectYieldAfter(
  actual: SimulationResult["yield"]["after"],
  expected: unknown,
  tolerance: FixtureTolerance,
) {
  if (expected == null) return;
  if (typeof expected === "number") {
    expect(typeof actual).toBe("number");
    expect(
      withinTolerance(actual as number, expected, tolerance),
    ).toBe(true);
    return;
  }
  const exp = expected as { min: number; max: number; confidence: string };
  expect(actual).toMatchObject({ confidence: exp.confidence });
  const act = actual as { min: number; max: number };
  expect(withinTolerance(act.min, exp.min, tolerance)).toBe(true);
  expect(withinTolerance(act.max, exp.max, tolerance)).toBe(true);
}

function expectConcentration(
  actual: Record<string, number> | undefined,
  expected: Record<string, number> | undefined,
  tolerance: FixtureTolerance,
) {
  if (!expected) return;
  expect(actual).toBeTruthy();
  for (const [key, value] of Object.entries(expected)) {
    expect(
      withinTolerance(actual![key] ?? 0, value, tolerance),
      `concentration ${key}`,
    ).toBe(true);
  }
}

function expectResult(
  actual: SimulationResult,
  expected: Record<string, unknown>,
  tolerance: FixtureTolerance,
) {
  const cf = expected.cashFlow as Record<string, { amount: number; currency: string }>;
  for (const h of ["30d", "90d", "180d", "365d"] as const) {
    expectMoney(actual.cashFlow[h], cf[h]!, tolerance, `cashFlow.${h}`);
  }

  const y = expected.yield as { before: number; after?: unknown };
  expect(withinTolerance(actual.yield.before, y.before, tolerance)).toBe(true);
  expectYieldAfter(actual.yield.after, y.after, tolerance);

  const conc = expected.concentration as {
    byClass?: Record<string, number>;
    byRegion?: Record<string, number>;
    byIssuer?: Record<string, number>;
  };
  expectConcentration(actual.concentration?.byClass, conc.byClass, tolerance);
  expectConcentration(actual.concentration?.byRegion, conc.byRegion, tolerance);
  expectConcentration(actual.concentration?.byIssuer, conc.byIssuer, tolerance);

  const liq = expected.structuralLiquidity as Record<
    string,
    { amount: number; currency: string }
  >;
  for (const h of ["30d", "90d", "180d", "365d"] as const) {
    expectMoney(
      actual.structuralLiquidity[h],
      liq[h]!,
      tolerance,
      `structuralLiquidity.${h}`,
    );
  }

  if (expected.netWorth) {
    expectMoney(
      actual.netWorth!,
      expected.netWorth as { amount: number; currency: string },
      tolerance,
      "netWorth",
    );
  }

  expect(actual.disclaimer.length).toBeGreaterThan(10);
  if (expected.confidence) {
    expect(actual.confidence).toBe(expected.confidence);
  }
}

describe("golden fixtures 01–10", () => {
  const fixtures = loadGoldenFixtures();

  it("carrega 10 fixtures", () => {
    expect(fixtures).toHaveLength(10);
  });

  for (const fixture of fixtures) {
    it(`golden: ${fixture.id}`, () => {
      const snapshot = fixture.input.snapshot as Snapshot;
      const premises = (fixture.input.premises ?? {}) as Premises;
      const result = simulate(snapshot, { premises });
      expectResult(result, fixture.expected, fixture.tolerance);

      if (fixture.expectedVariants && fixture.input.scenario?.variants) {
        const variants = simulateVariants(
          snapshot,
          fixture.input.scenario.variants as Premises[],
        );
        expect(variants).toHaveLength(fixture.expectedVariants.length);
        variants.forEach((variant, index) => {
          expectResult(
            variant,
            fixture.expectedVariants![index]!,
            fixture.tolerance,
          );
        });
      }
    });
  }
});
