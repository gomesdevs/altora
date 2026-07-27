import { Module } from "@nestjs/common";

import { TenantGuard } from "../tenant/tenant.guard";
import { PortfolioController } from "./portfolio.controller";
import {
  InMemoryPortfolioRepository,
  type PortfolioRepository,
} from "./portfolio.repository";
import { PortfolioService } from "./portfolio.service";

export const PORTFOLIO_REPOSITORY = Symbol("PORTFOLIO_REPOSITORY");

@Module({
  controllers: [PortfolioController],
  providers: [
    TenantGuard,
    {
      provide: PORTFOLIO_REPOSITORY,
      useClass: InMemoryPortfolioRepository,
    },
    {
      provide: PortfolioService,
      useFactory: (repo: PortfolioRepository) => new PortfolioService(repo),
      inject: [PORTFOLIO_REPOSITORY],
    },
  ],
})
export class PortfolioModule {}
