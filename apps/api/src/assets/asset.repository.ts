import type { Asset } from "@altora/domain";
import {
  SILVA_FO_ENTITIES,
  SILVA_FO_TENANT_ID,
  silvaFoDomainAssets,
  type SeedEntity,
} from "@altora/domain";

export interface AssetRepository {
  listByTenant(tenantId: string): Promise<Asset[]>;
  create(tenantId: string, asset: Asset): Promise<Asset>;
  listEntities(tenantId: string): Promise<SeedEntity[]>;
}

export class InMemoryAssetRepository implements AssetRepository {
  private readonly assetsByTenant = new Map<string, Asset[]>();
  private readonly entitiesByTenant = new Map<string, SeedEntity[]>();

  constructor() {
    this.assetsByTenant.set(SILVA_FO_TENANT_ID, silvaFoDomainAssets());
    this.entitiesByTenant.set(
      SILVA_FO_TENANT_ID,
      SILVA_FO_ENTITIES.map((e) => ({ ...e })),
    );
  }

  async listByTenant(tenantId: string): Promise<Asset[]> {
    return [...(this.assetsByTenant.get(tenantId) ?? [])];
  }

  async create(tenantId: string, asset: Asset): Promise<Asset> {
    const bucket = this.assetsByTenant.get(tenantId) ?? [];
    bucket.push(asset);
    this.assetsByTenant.set(tenantId, bucket);
    return asset;
  }

  async listEntities(tenantId: string): Promise<SeedEntity[]> {
    return [...(this.entitiesByTenant.get(tenantId) ?? [])];
  }

  /** Test helper — registra entidades de um tenant demo. */
  seedEntities(tenantId: string, entities: SeedEntity[]): void {
    this.entitiesByTenant.set(tenantId, entities);
  }
}
