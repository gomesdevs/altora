import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";

import {
  CurrentActor,
  CurrentTenant,
  TenantGuard,
} from "../tenant/tenant.guard";
import { AssetsService } from "./assets.service";

@Controller("assets")
@UseGuards(TenantGuard)
export class AssetsController {
  constructor(
    @Inject(AssetsService)
    private readonly assetsService: AssetsService,
  ) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.assetsService.list(tenantId);
  }

  @Get("entities")
  listEntities(@CurrentTenant() tenantId: string) {
    return this.assetsService.listEntities(tenantId);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentActor() actorId: string,
    @Body() body: unknown,
  ) {
    return this.assetsService.create(tenantId, actorId, body);
  }
}
