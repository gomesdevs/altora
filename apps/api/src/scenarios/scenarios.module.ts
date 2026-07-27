import { Module } from "@nestjs/common";

import { PortfolioModule } from "../portfolio/portfolio.module";
import { TenantGuard } from "../tenant/tenant.guard";
import { SCENARIO_REPOSITORY } from "../tokens";
import { InMemoryScenarioRepository } from "./scenario.repository";
import { ScenariosController } from "./scenarios.controller";
import { ScenariosService } from "./scenarios.service";

@Module({
  imports: [PortfolioModule],
  controllers: [ScenariosController],
  providers: [
    TenantGuard,
    {
      provide: SCENARIO_REPOSITORY,
      useClass: InMemoryScenarioRepository,
    },
    ScenariosService,
  ],
})
export class ScenariosModule {}
