import { describe, expect, it } from "vitest";

import { runSimulation } from "./engine.js";

describe("runSimulation stub", () => {
  it("não retorna número pontual quando há PE no snapshot", () => {
    const result = runSimulation({
      snapshot: {
        id: "snap-1",
        version: 1,
        capturedAt: "2026-07-27T12:00:00.000Z",
        tenantId: "tenant-1",
        entities: [{ id: "e1", name: "Holding", type: "holding" }],
        assets: [
          {
            id: "pe-1",
            entityId: "e1",
            type: "pe",
            name: "Fundo PE",
            valuation: {
              amount: { amount: 2_000_000, currency: "BRL" },
              method: "nav",
              asOf: "2026-06-30",
              source: "GP",
            },
          },
        ],
        cash: { amount: 100_000, currency: "BRL" },
      },
      premises: { sensitivity: "base" },
    });

    expect(result.confidence).toBe("low");
    expect(typeof result.yield.after).toBe("object");
    expect(result.disclaimer.length).toBeGreaterThanOrEqual(10);
  });
});
