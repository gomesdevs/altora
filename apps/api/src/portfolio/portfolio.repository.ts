import type { Asset, Money } from "@altora/domain";
import {
  SILVA_FO_CASH,
  SILVA_FO_TENANT_ID,
  silvaFoDomainAssets,
} from "@altora/domain";

export type PortfolioRecord = {
  assets: Asset[];
  cash: Money;
};

export interface PortfolioRepository {
  findByTenant(tenantId: string): Promise<PortfolioRecord | null>;
}

/**
 * Repositório em memória — mesmo dataset do seed Silva FO.
 * Usado em testes e quando a API sobe sem Postgres.
 */
export class InMemoryPortfolioRepository implements PortfolioRepository {
  private readonly byTenant = new Map<string, PortfolioRecord>();

  constructor() {
    this.byTenant.set(SILVA_FO_TENANT_ID, {
      assets: silvaFoDomainAssets(),
      cash: { ...SILVA_FO_CASH },
    });
  }

  async findByTenant(tenantId: string): Promise<PortfolioRecord | null> {
    return this.byTenant.get(tenantId) ?? null;
  }
}
