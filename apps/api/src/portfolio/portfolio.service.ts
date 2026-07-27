import { Injectable, NotFoundException } from "@nestjs/common";
import {
  aggregatePortfolio,
  calculateConcentration,
  round4,
} from "@altora/domain";

import type { PortfolioRepository } from "./portfolio.repository";

export type ConsolidatedPortfolioDto = {
  tenantId: string;
  netWorth: { amount: number; currency: "BRL" };
  monthlyIncome: { amount: number; currency: "BRL" };
  yield: number;
  concentration: {
    byClass: Record<string, number>;
  };
  assetCount: number;
};

@Injectable()
export class PortfolioService {
  constructor(private readonly repo: PortfolioRepository) {}

  async getConsolidated(tenantId: string): Promise<ConsolidatedPortfolioDto> {
    const record = await this.repo.findByTenant(tenantId);
    if (!record) {
      throw new NotFoundException("Portfolio not found for tenant");
    }

    // Métricas só via @altora/domain (nunca no controller/front)
    const portfolio = aggregatePortfolio(record.assets, record.cash);
    const byClass = calculateConcentration(portfolio, "class");
    const yieldAnnual = round4(
      (portfolio.monthlyIncome.amount * 12) / portfolio.netWorth.amount,
    );

    return {
      tenantId,
      netWorth: portfolio.netWorth,
      monthlyIncome: portfolio.monthlyIncome,
      yield: yieldAnnual,
      concentration: { byClass },
      assetCount: record.assets.length,
    };
  }
}
