import { Module } from "@nestjs/common";

import { TenantGuard } from "../tenant/tenant.guard";
import { PORTFOLIO_REPOSITORY } from "../tokens";
import { PortfolioController } from "./portfolio.controller";
import { InMemoryPortfolioRepository } from "./portfolio.repository";
import { PortfolioService } from "./portfolio.service";

@Module({
  controllers: [PortfolioController],
  providers: [
    TenantGuard,
    {
      provide: PORTFOLIO_REPOSITORY,
      useClass: InMemoryPortfolioRepository,
    },
    PortfolioService,
  ],
  exports: [PORTFOLIO_REPOSITORY, PortfolioService],
})
export class PortfolioModule {}
