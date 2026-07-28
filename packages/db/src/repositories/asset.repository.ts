import type { Asset, SeedEntity } from "@altora/domain";
import { eq } from "drizzle-orm";

import type { Db } from "../client.js";
import { assets, entities } from "../schema.js";
import { assetRowToDomain, assetToPayload } from "./asset-mapper.js";
import { withTenant } from "./with-tenant.js";

export class DrizzleAssetRepository {
  constructor(private readonly db: Db) {}

  async listByTenant(tenantId: string): Promise<Asset[]> {
    return withTenant(this.db, tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(assets)
        .where(eq(assets.tenantId, tenantId));
      return rows.map((row) =>
        assetRowToDomain({
          id: row.id,
          entityId: row.entityId,
          type: row.type,
          name: row.name,
          payload: row.payload as Record<string, unknown>,
        }),
      );
    });
  }

  async create(tenantId: string, asset: Asset): Promise<Asset> {
    return withTenant(this.db, tenantId, async (tx) => {
      const [row] = await tx
        .insert(assets)
        .values({
          id: asset.id,
          tenantId,
          entityId: asset.entityId,
          type: asset.type,
          name: asset.name,
          payload: assetToPayload(asset),
        })
        .returning();
      if (!row) {
        throw new Error("Failed to insert asset");
      }
      return assetRowToDomain({
        id: row.id,
        entityId: row.entityId,
        type: row.type,
        name: row.name,
        payload: row.payload as Record<string, unknown>,
      });
    });
  }

  async listEntities(tenantId: string): Promise<SeedEntity[]> {
    return withTenant(this.db, tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(entities)
        .where(eq(entities.tenantId, tenantId));
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as SeedEntity["type"],
      }));
    });
  }
}
