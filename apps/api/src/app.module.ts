import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { ScenariosModule } from "./scenarios/scenarios.module";

@Module({
  imports: [PortfolioModule, ScenariosModule],
  controllers: [HealthController],
})
export class AppModule {}
