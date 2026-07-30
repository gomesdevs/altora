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

export type AuditEvent = {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AuditAppendInput = {
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};
