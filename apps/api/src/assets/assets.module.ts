import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { TenantGuard } from "../tenant/tenant.guard";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";

@Module({
  imports: [AuditModule],
  controllers: [AssetsController],
  providers: [TenantGuard, AssetsService],
})
export class AssetsModule {}
