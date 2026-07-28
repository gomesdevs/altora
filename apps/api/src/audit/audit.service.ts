import { Inject, Injectable } from "@nestjs/common";

import { AUDIT_LOG_REPOSITORY } from "../tokens";
import type {
  AuditAppendInput,
  AuditEvent,
  AuditLogRepository,
} from "./audit.repository";

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly audit: AuditLogRepository,
  ) {}

  async record(input: AuditAppendInput): Promise<AuditEvent> {
    return this.audit.append(input);
  }

  async listForTenant(tenantId: string): Promise<AuditEvent[]> {
    return this.audit.listByTenant(tenantId);
  }
}
