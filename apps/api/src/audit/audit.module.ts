import { Module } from "@nestjs/common";

import { AUDIT_LOG_REPOSITORY } from "../tokens";
import { AuditService } from "./audit.service";
import { InMemoryAuditLogRepository } from "./audit.repository";

@Module({
  providers: [
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: InMemoryAuditLogRepository,
    },
    AuditService,
  ],
  exports: [AuditService],
})
export class AuditModule {}
