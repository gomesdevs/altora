import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type FixtureTolerance = {
  absolute: number;
  relative: number;
};

export type GoldenFixture = {
  id: string;
  type: string;
  description: string;
  calculation_notes?: string;
  input: {
    snapshot: unknown;
    premises?: unknown;
    scenario?: { variants?: Record<string, unknown>[] };
  };
  expected: Record<string, unknown>;
  expectedVariants?: Record<string, unknown>[];
  tolerance: FixtureTolerance;
  invariants: string[];
};

const fixturesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../__fixtures__",
);

export function loadGoldenFixtures(): GoldenFixture[] {
  return readdirSync(fixturesDir)
    .filter((f) => /^(0[1-9]|10)-.*\.fixture\.json$/.test(f))
    .sort()
    .map(
      (f) =>
        JSON.parse(
          readFileSync(path.join(fixturesDir, f), "utf8"),
        ) as GoldenFixture,
    );
}

export function withinTolerance(
  actual: number,
  expected: number,
  tolerance: FixtureTolerance,
): boolean {
  if (Math.abs(expected) <= 1 && Math.abs(actual) <= 1) {
    const ratioAllow = Math.max(0.00015, tolerance.relative * Math.abs(expected));
    return Math.abs(actual - expected) <= ratioAllow;
  }
  const allow = Math.max(
    tolerance.absolute,
    tolerance.relative * Math.abs(expected),
  );
  return Math.abs(actual - expected) <= allow;
}
