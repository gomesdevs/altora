import { eq } from "drizzle-orm";

import type { SeedEntity } from "@altora/domain";

import type { Db } from "../client.js";
import { assets, entities, portfolioCash } from "../schema.js";
import { assetRowToDomain } from "./asset-mapper.js";
import type { PortfolioRecord } from "./types.js";
import { withTenant } from "./with-tenant.js";

export class DrizzlePortfolioRepository {
  constructor(private readonly db: Db) {}

  async findByTenant(tenantId: string): Promise<PortfolioRecord | null> {
    return withTenant(this.db, tenantId, async (tx) => {
      const entityRows = await tx
        .select()
        .from(entities)
        .where(eq(entities.tenantId, tenantId));

      if (entityRows.length === 0) {
        return null;
      }

      const cashRows = await tx
        .select()
        .from(portfolioCash)
        .where(eq(portfolioCash.tenantId, tenantId))
        .limit(1);

      if (!cashRows[0]) {
        return null;
      }

      const assetRows = await tx
        .select()
        .from(assets)
        .where(eq(assets.tenantId, tenantId));

      return {
        entities: entityRows.map((row) => ({
          id: row.id,
          name: row.name,
          type: row.type as SeedEntity["type"],
        })),
        cash: cashRows[0].cash,
        assets: assetRows.map((row) =>
          assetRowToDomain({
            id: row.id,
            entityId: row.entityId,
            type: row.type,
            name: row.name,
            payload: row.payload as Record<string, unknown>,
          }),
        ),
      };
    });
  }
}
