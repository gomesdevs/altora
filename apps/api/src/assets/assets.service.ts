import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateAssetInputSchema,
  assetFromCreateInput,
  type Asset,
  type SeedEntity,
} from "@altora/domain";
import { randomUUID } from "node:crypto";

import { AuditService } from "../audit/audit.service";
import { ASSET_REPOSITORY } from "../tokens";
import type { AssetRepository } from "./asset.repository";

export type AssetDto = Asset;

@Injectable()
export class AssetsService {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assets: AssetRepository,
    @Inject(AuditService)
    private readonly audit: AuditService,
  ) {}

  async list(tenantId: string): Promise<AssetDto[]> {
    return this.assets.listByTenant(tenantId);
  }

  async listEntities(tenantId: string): Promise<SeedEntity[]> {
    const entities = await this.assets.listEntities(tenantId);
    if (entities.length === 0) {
      throw new NotFoundException("No entities for tenant");
    }
    return entities;
  }

  async create(
    tenantId: string,
    actorId: string,
    body: unknown,
  ): Promise<AssetDto> {
    const parsed = CreateAssetInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid asset payload",
        issues: parsed.error.issues,
      });
    }

    const entities = await this.assets.listEntities(tenantId);
    if (!entities.some((e) => e.id === parsed.data.entityId)) {
      throw new BadRequestException("entityId does not belong to tenant");
    }

    const asset = assetFromCreateInput(parsed.data, randomUUID());
    const stored = await this.assets.create(tenantId, asset);

    await this.audit.record({
      tenantId,
      actorId,
      action: "asset.create",
      resourceType: "asset",
      resourceId: stored.id,
      metadata: {
        assetType: stored.type,
        entityId: stored.entityId,
        name: stored.name,
      },
    });

    return stored;
  }
}
