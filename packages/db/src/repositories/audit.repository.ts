import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { Db } from "../client.js";
import { auditLogs } from "../schema.js";
import type {
  AuditAppendInput,
  AuditEvent,
} from "./scenario-audit-types.js";
import { withTenant } from "./with-tenant.js";

export class DrizzleAuditLogRepository {
  constructor(private readonly db: Db) {}

  async append(input: AuditAppendInput): Promise<AuditEvent> {
    return withTenant(this.db, input.tenantId, async (tx) => {
      const id = randomUUID();
      const createdAt = new Date();
      const [row] = await tx
        .insert(auditLogs)
        .values({
          id,
          tenantId: input.tenantId,
          actorId: input.actorId,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          metadata: input.metadata ?? {},
          createdAt,
        })
        .returning();

      if (!row) {
        throw new Error("Failed to append audit log");
      }

      return {
        id: row.id,
        tenantId: row.tenantId,
        actorId: row.actorId,
        action: row.action,
        resourceType: row.resourceType,
        resourceId: row.resourceId ?? undefined,
        metadata: row.metadata as Record<string, unknown>,
        createdAt: row.createdAt.toISOString(),
      };
    });
  }

  async listByTenant(tenantId: string): Promise<AuditEvent[]> {
    return withTenant(this.db, tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.tenantId, tenantId))
        .orderBy(desc(auditLogs.createdAt));

      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        actorId: row.actorId,
        action: row.action,
        resourceType: row.resourceType,
        resourceId: row.resourceId ?? undefined,
        metadata: row.metadata as Record<string, unknown>,
        createdAt: row.createdAt.toISOString(),
      }));
    });
  }
}
