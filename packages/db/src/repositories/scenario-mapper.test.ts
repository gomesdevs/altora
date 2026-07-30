import { describe, expect, it } from "vitest";
import { SILVA_FO_TENANT_ID, silvaFoDomainAssets } from "@altora/domain";
import {
  PremisesSchema,
  SimulationResultSchema,
  SnapshotSchema,
  createSnapshot,
  simulate,
  aggregatePortfolio,
  SILVA_FO_CASH,
} from "@altora/domain";

import { rowToStoredScenario } from "./scenario-mapper.js";

describe("scenario-mapper", () => {
  it("round-trip StoredScenario via Zod", () => {
    const assets = silvaFoDomainAssets();
    const portfolio = aggregatePortfolio(assets, SILVA_FO_CASH);
    const snapshot = createSnapshot(portfolio, {
      id: "snap-test",
      tenantId: SILVA_FO_TENANT_ID,
      version: 1,
      entities: [
        { id: "b2222222-2222-4222-8222-222222222222", name: "Holding", type: "holding" },
      ],
      capturedAt: new Date().toISOString(),
    });
    const premises = PremisesSchema.parse({ vacancia_percentual: 10 });
    const result = simulate(snapshot, { premises });

    const stored = rowToStoredScenario({
      id: "s1111111-1111-4111-8111-111111111111",
      tenantId: SILVA_FO_TENANT_ID,
      name: "test",
      snapshotId: snapshot.id,
      snapshotVersion: snapshot.version,
      snapshot,
      premises,
      result,
      createdAt: new Date(),
    });

    expect(stored.name).toBe("test");
    expect(SnapshotSchema.safeParse(stored.snapshot).success).toBe(true);
    expect(SimulationResultSchema.safeParse(stored.result).success).toBe(true);
    expect(stored.result.disclaimer.length).toBeGreaterThan(10);
  });
});
