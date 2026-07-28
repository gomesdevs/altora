import { Module } from "@nestjs/common";

import { TenantGuard } from "../tenant/tenant.guard";
import { PortfolioController } from "./portfolio.controller";
import { PortfolioService } from "./portfolio.service";

@Module({
  controllers: [PortfolioController],
  providers: [TenantGuard, PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
