import { randomUUID } from "node:crypto";

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

export interface AuditLogRepository {
  append(input: AuditAppendInput): Promise<AuditEvent>;
  listByTenant(tenantId: string): Promise<AuditEvent[]>;
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private readonly events: AuditEvent[] = [];

  async append(input: AuditAppendInput): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: randomUUID(),
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  async listByTenant(tenantId: string): Promise<AuditEvent[]> {
    return this.events.filter((e) => e.tenantId === tenantId);
  }
}
