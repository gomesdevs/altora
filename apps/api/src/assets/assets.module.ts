import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { PortfolioModule } from "../portfolio/portfolio.module";
import { TenantGuard } from "../tenant/tenant.guard";
import { ASSET_REPOSITORY } from "../tokens";
import { AssetsController } from "./assets.controller";
import { InMemoryAssetRepository } from "./asset.repository";
import { AssetsService } from "./assets.service";

@Module({
  imports: [PortfolioModule, AuditModule],
  controllers: [AssetsController],
  providers: [
    TenantGuard,
    {
      provide: ASSET_REPOSITORY,
      useClass: InMemoryAssetRepository,
    },
    AssetsService,
  ],
})
export class AssetsModule {}
