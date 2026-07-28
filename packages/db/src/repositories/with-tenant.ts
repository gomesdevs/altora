import { sql } from "drizzle-orm";

import type { Db } from "../client.js";

/**
 * Define `app.tenant_id` na transação (SET LOCAL) para políticas RLS (ADR-002).
 */
export async function withTenant<T>(
  db: Db,
  tenantId: string,
  fn: (tx: Db) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
    return fn(tx as unknown as Db);
  });
}
