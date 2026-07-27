import { DomainError } from "../errors.js";
import type { Snapshot } from "../schemas/snapshot.js";
import type { Portfolio, SnapshotMeta } from "../schemas/portfolio.js";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

export function createSnapshot(
  portfolio: Portfolio,
  metadata: SnapshotMeta,
): Snapshot {
  if (portfolio.assets.length === 0 && portfolio.cash.amount <= 0) {
    throw new DomainError("EMPTY_PORTFOLIO", "Cannot snapshot empty portfolio");
  }

  const snapshot: Snapshot = {
    id: metadata.id,
    version: metadata.version ?? 1,
    capturedAt: metadata.capturedAt ?? new Date().toISOString(),
    tenantId: metadata.tenantId,
    entities: metadata.entities.map((e) => ({ ...e })),
    assets: portfolio.assets.map((asset) => structuredClone(asset)),
    cash: { ...portfolio.cash },
  };

  return deepFreeze(snapshot);
}

/** Clona snapshot sem congelar — para stress/derivação. */
export function cloneSnapshot(snapshot: Snapshot): Snapshot {
  return structuredClone(snapshot);
}
