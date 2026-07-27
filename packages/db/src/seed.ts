/**
 * Seed idempotente de desenvolvimento — dados fictícios (nunca de clientes reais).
 */
import { eq } from "drizzle-orm";

import { createDb } from "./client.js";
import { assets, auditLogs, entities, tenants } from "./schema.js";

const url =
  process.env.DATABASE_URL ??
  "postgresql://altora:altora@localhost:5432/altora";

const DEV_TENANT_NAME = "Silva Family Office (dev)";

async function main() {
  const db = createDb(url);

  const existing = await db
    .select()
    .from(tenants)
    .where(eq(tenants.name, DEV_TENANT_NAME))
    .limit(1);

  if (existing[0]) {
    console.log("db:seed already applied —", existing[0].id);
    process.exit(0);
  }

  const [tenant] = await db
    .insert(tenants)
    .values({ name: DEV_TENANT_NAME })
    .returning();

  if (!tenant) {
    throw new Error("failed to insert tenant");
  }

  const [entity] = await db
    .insert(entities)
    .values({
      tenantId: tenant.id,
      name: "Holding Silva Ltda.",
      type: "holding",
    })
    .returning();

  if (!entity) {
    throw new Error("failed to insert entity");
  }

  await db.insert(assets).values({
    tenantId: tenant.id,
    entityId: entity.id,
    type: "fii",
    name: "FII Exemplo (seed)",
    payload: { note: "ativo fictício para desenvolvimento" },
  });

  await db.insert(auditLogs).values({
    tenantId: tenant.id,
    actorId: "seed",
    action: "seed.bootstrap",
    resourceType: "tenant",
    resourceId: tenant.id,
    metadata: { source: "db:seed" },
  });

  console.log("db:seed ok — tenant", tenant.id);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
