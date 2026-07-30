import { Module } from "@nestjs/common";

import { PortfolioModule } from "../portfolio/portfolio.module";
import { TenantGuard } from "../tenant/tenant.guard";
import { ScenariosController } from "./scenarios.controller";
import { ScenariosService } from "./scenarios.service";

@Module({
  imports: [PortfolioModule],
  controllers: [ScenariosController],
  providers: [TenantGuard, ScenariosService],
})
export class ScenariosModule {}
