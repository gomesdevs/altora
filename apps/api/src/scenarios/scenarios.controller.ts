import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentTenant, TenantGuard } from "../tenant/tenant.guard";
import {
  ScenariosService,
  type SimulateScenarioInput,
} from "./scenarios.service";

@Controller("scenarios")
@UseGuards(TenantGuard)
export class ScenariosController {
  constructor(
    @Inject(ScenariosService)
    private readonly scenariosService: ScenariosService,
  ) {}

  @Post("simulate")
  simulate(
    @CurrentTenant() tenantId: string,
    @Body() body: SimulateScenarioInput,
  ) {
    return this.scenariosService.simulate(tenantId, body ?? {});
  }

  @Get(":id")
  getById(@CurrentTenant() tenantId: string, @Param("id") id: string) {
    return this.scenariosService.getById(tenantId, id);
  }
}
