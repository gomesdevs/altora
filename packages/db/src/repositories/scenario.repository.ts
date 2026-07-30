import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { Db } from "../client.js";
import { scenarios, simulationResults } from "../schema.js";
import { rowToStoredScenario } from "./scenario-mapper.js";
import type { StoredScenario } from "./scenario-audit-types.js";
import { withTenant } from "./with-tenant.js";

export class DrizzleScenarioRepository {
  constructor(private readonly db: Db) {}

  async save(record: StoredScenario): Promise<StoredScenario> {
    return withTenant(this.db, record.tenantId, async (tx) => {
      await tx.insert(scenarios).values({
        id: record.id,
        tenantId: record.tenantId,
        name: record.name,
        snapshotId: record.snapshotId,
        snapshotVersion: record.snapshotVersion,
        snapshot: record.snapshot,
        premises: record.premises,
        createdAt: new Date(record.createdAt),
      });

      await tx.insert(simulationResults).values({
        id: randomUUID(),
        tenantId: record.tenantId,
        scenarioId: record.id,
        result: record.result,
        createdAt: new Date(record.createdAt),
      });

      return record;
    });
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<StoredScenario | null> {
    return withTenant(this.db, tenantId, async (tx) => {
      const rows = await tx
        .select({
          id: scenarios.id,
          tenantId: scenarios.tenantId,
          name: scenarios.name,
          snapshotId: scenarios.snapshotId,
          snapshotVersion: scenarios.snapshotVersion,
          snapshot: scenarios.snapshot,
          premises: scenarios.premises,
          createdAt: scenarios.createdAt,
          result: simulationResults.result,
        })
        .from(scenarios)
        .innerJoin(
          simulationResults,
          eq(simulationResults.scenarioId, scenarios.id),
        )
        .where(and(eq(scenarios.tenantId, tenantId), eq(scenarios.id, id)))
        .orderBy(desc(simulationResults.createdAt))
        .limit(1);

      const row = rows[0];
      if (!row) return null;
      return rowToStoredScenario(row);
    });
  }

  async listByTenant(tenantId: string): Promise<StoredScenario[]> {
    return withTenant(this.db, tenantId, async (tx) => {
      const rows = await tx
        .select({
          id: scenarios.id,
          tenantId: scenarios.tenantId,
          name: scenarios.name,
          snapshotId: scenarios.snapshotId,
          snapshotVersion: scenarios.snapshotVersion,
          snapshot: scenarios.snapshot,
          premises: scenarios.premises,
          createdAt: scenarios.createdAt,
          result: simulationResults.result,
        })
        .from(scenarios)
        .innerJoin(
          simulationResults,
          eq(simulationResults.scenarioId, scenarios.id),
        )
        .where(eq(scenarios.tenantId, tenantId))
        .orderBy(desc(scenarios.createdAt));

      // Um resultado por cenário (o mais recente já vem primeiro pelo order do join)
      const seen = new Set<string>();
      const out: StoredScenario[] = [];
      for (const row of rows) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        out.push(rowToStoredScenario(row));
      }
      return out;
    });
  }
}
