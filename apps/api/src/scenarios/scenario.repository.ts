import type { Premises, SimulationResult, Snapshot } from "@altora/domain";

export type StoredScenario = {
  id: string;
  tenantId: string;
  name: string;
  snapshotId: string;
  snapshotVersion: number;
  snapshot: Snapshot;
  premises: Premises;
  result: SimulationResult;
  createdAt: string;
};

export interface ScenarioRepository {
  save(record: StoredScenario): Promise<StoredScenario>;
  findById(tenantId: string, id: string): Promise<StoredScenario | null>;
  listByTenant(tenantId: string): Promise<StoredScenario[]>;
}

export class InMemoryScenarioRepository implements ScenarioRepository {
  private readonly byTenant = new Map<string, Map<string, StoredScenario>>();

  async save(record: StoredScenario): Promise<StoredScenario> {
    let bucket = this.byTenant.get(record.tenantId);
    if (!bucket) {
      bucket = new Map();
      this.byTenant.set(record.tenantId, bucket);
    }
    bucket.set(record.id, record);
    return record;
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<StoredScenario | null> {
    return this.byTenant.get(tenantId)?.get(id) ?? null;
  }

  async listByTenant(tenantId: string): Promise<StoredScenario[]> {
    const bucket = this.byTenant.get(tenantId);
    if (!bucket) return [];
    return [...bucket.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
}
