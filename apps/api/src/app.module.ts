import { Module } from "@nestjs/common";

import { AssetsModule } from "./assets/assets.module";
import { HealthController } from "./health.controller";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { ScenariosModule } from "./scenarios/scenarios.module";

@Module({
  imports: [PortfolioModule, ScenariosModule, AssetsModule],
  controllers: [HealthController],
})
export class AppModule {}
