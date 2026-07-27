import { Controller, Get, Inject, UseGuards } from "@nestjs/common";

import { CurrentTenant, TenantGuard } from "../tenant/tenant.guard";
import { PortfolioService } from "./portfolio.service";

@Controller("portfolio")
@UseGuards(TenantGuard)
export class PortfolioController {
  constructor(
    @Inject(PortfolioService)
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get("consolidated")
  getConsolidated(@CurrentTenant() tenantId: string) {
    return this.portfolioService.getConsolidated(tenantId);
  }
}
