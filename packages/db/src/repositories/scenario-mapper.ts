import {
  PremisesSchema,
  SimulationResultSchema,
  SnapshotSchema,
} from "@altora/domain";

import type { StoredScenario } from "./scenario-audit-types.js";

export function rowToStoredScenario(input: {
  id: string;
  tenantId: string;
  name: string;
  snapshotId: string;
  snapshotVersion: number;
  snapshot: unknown;
  premises: unknown;
  result: unknown;
  createdAt: Date | string;
}): StoredScenario {
  return {
    id: input.id,
    tenantId: input.tenantId,
    name: input.name,
    snapshotId: input.snapshotId,
    snapshotVersion: input.snapshotVersion,
    snapshot: SnapshotSchema.parse(input.snapshot),
    premises: PremisesSchema.parse(input.premises ?? {}),
    result: SimulationResultSchema.parse(input.result),
    createdAt:
      typeof input.createdAt === "string"
        ? input.createdAt
        : input.createdAt.toISOString(),
  };
}
