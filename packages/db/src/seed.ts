/**
 * Seed idempotente — portfólio canônico Silva FO.
 * Fonte: docs/domain/harness/fixtures/_base/portfolio-silva-fo.json
 */
import { eq } from "drizzle-orm";

import { createDb } from "./client.js";
import {
  assets,
  auditLogs,
  entities,
  portfolioCash,
  tenants,
} from "./schema.js";
import {
  SILVA_FO_ASSETS,
  SILVA_FO_CASH,
  SILVA_FO_ENTITIES,
  SILVA_FO_TENANT_ID,
  SILVA_FO_TENANT_NAME,
} from "./seed-data/silva-fo.js";

const url =
  process.env.DATABASE_URL ??
  "postgresql://altora:altora@localhost:5433/altora";

async function main() {
  const db = createDb(url);

  const existing = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, SILVA_FO_TENANT_ID))
    .limit(1);

  if (!existing[0]) {
    await db.insert(tenants).values({
      id: SILVA_FO_TENANT_ID,
      name: SILVA_FO_TENANT_NAME,
    });
  } else if (existing[0].name !== SILVA_FO_TENANT_NAME) {
    await db
      .update(tenants)
      .set({ name: SILVA_FO_TENANT_NAME })
      .where(eq(tenants.id, SILVA_FO_TENANT_ID));
  }

  for (const entity of SILVA_FO_ENTITIES) {
    const found = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entity.id))
      .limit(1);
    if (!found[0]) {
      await db.insert(entities).values({
        id: entity.id,
        tenantId: SILVA_FO_TENANT_ID,
        name: entity.name,
        type: entity.type,
      });
    } else if (
      found[0].name !== entity.name ||
      found[0].type !== entity.type
    ) {
      await db
        .update(entities)
        .set({ name: entity.name, type: entity.type })
        .where(eq(entities.id, entity.id));
    }
  }

  for (const asset of SILVA_FO_ASSETS) {
    const payload = {
      ...asset.domain,
      id: asset.id,
      entityId: asset.entityId,
      type: asset.type,
      name: asset.name,
    };
    await db
      .insert(assets)
      .values({
        id: asset.id,
        tenantId: SILVA_FO_TENANT_ID,
        entityId: asset.entityId,
        type: asset.type,
        name: asset.name,
        payload,
      })
      .onConflictDoUpdate({
        target: assets.id,
        set: {
          tenantId: SILVA_FO_TENANT_ID,
          entityId: asset.entityId,
          type: asset.type,
          name: asset.name,
          payload,
          updatedAt: new Date(),
        },
      });
  }

  await db
    .insert(portfolioCash)
    .values({
      tenantId: SILVA_FO_TENANT_ID,
      cash: SILVA_FO_CASH,
    })
    .onConflictDoUpdate({
      target: portfolioCash.tenantId,
      set: { cash: SILVA_FO_CASH, updatedAt: new Date() },
    });

  await db.insert(auditLogs).values({
    tenantId: SILVA_FO_TENANT_ID,
    actorId: "seed",
    action: "seed.silva_fo",
    resourceType: "tenant",
    resourceId: SILVA_FO_TENANT_ID,
    metadata: {
      source: "db:seed",
      assets: SILVA_FO_ASSETS.length,
      netWorthTarget: 3_850_000,
    },
  });

  console.log("db:seed ok — Silva FO tenant", SILVA_FO_TENANT_ID);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
