import type { Asset, Money } from "@altora/domain";
import {
  SILVA_FO_CASH,
  SILVA_FO_ENTITIES,
  SILVA_FO_TENANT_ID,
  silvaFoDomainAssets,
  type SeedEntity,
} from "@altora/domain";

import type { InMemoryAssetRepository } from "../assets/asset.repository";

export type PortfolioRecord = {
  assets: Asset[];
  cash: Money;
  entities: SeedEntity[];
};

export interface PortfolioRepository {
  findByTenant(tenantId: string): Promise<PortfolioRecord | null>;
}

/**
 * Repositório em memória — mesmo dataset do seed Silva FO.
 * Usado em testes e quando a API sobe sem Postgres.
 */
export class InMemoryPortfolioRepository implements PortfolioRepository {
  constructor(private readonly assets?: InMemoryAssetRepository) {
    if (!this.assets) {
      this.byTenant.set(SILVA_FO_TENANT_ID, {
        assets: silvaFoDomainAssets(),
        cash: { ...SILVA_FO_CASH },
        entities: SILVA_FO_ENTITIES.map((e) => ({ ...e })),
      });
    }
  }

  private readonly byTenant = new Map<string, PortfolioRecord>();

  async findByTenant(tenantId: string): Promise<PortfolioRecord | null> {
    if (this.assets) {
      const entities = await this.assets.listEntities(tenantId);
      if (entities.length === 0) {
        return null;
      }
      const assetList = await this.assets.listByTenant(tenantId);
      const cash =
        tenantId === SILVA_FO_TENANT_ID
          ? { ...SILVA_FO_CASH }
          : { amount: 0, currency: "BRL" as const };
      return {
        assets: assetList,
        cash,
        entities,
      };
    }
    return this.byTenant.get(tenantId) ?? null;
  }
}
