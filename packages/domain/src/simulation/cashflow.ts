import type { Asset } from "../schemas/asset.js";
import type { Premises } from "../schemas/premises.js";
import type { Snapshot } from "../schemas/snapshot.js";
import { brl, type Money } from "../schemas/money.js";
import type { LiquidityHorizon } from "../liquidity/index.js";

/** Meses canônicos por horizonte (fixtures do harness). */
export function horizonToMonths(horizonDays: LiquidityHorizon | number): number {
  switch (horizonDays) {
    case 30:
      return 1;
    case 90:
      return 3;
    case 180:
      return 6;
    case 365:
      return 12;
    default:
      return horizonDays / 30;
  }
}

/**
 * Custo de aquisição implícito para IR sobre ganho de capital.
 * Canonical fixture 02: imóvel R$2,1M com base R$1,2M.
 */
export const DEFAULT_COST_BASIS_RATIO: Partial<Record<Asset["type"], number>> = {
  imovel: 12 / 21,
};

export function costBasisFor(asset: Asset): number {
  const ratio = DEFAULT_COST_BASIS_RATIO[asset.type] ?? 1;
  return asset.valuation.amount.amount * ratio;
}

export function effectiveMonthlyIncome(
  asset: Asset,
  premises: Premises,
): number {
  let income = asset.monthlyIncome?.amount ?? 0;
  if (income === 0) return 0;

  let vacancy = asset.vacancyRate ?? 0;
  if (asset.type === "imovel" && premises.vacancia_percentual != null) {
    vacancy = premises.vacancia_percentual / 100;
  }

  if (asset.type === "imovel" && premises.inadimplencia_percentual != null) {
    income *= 1 - premises.inadimplencia_percentual / 100;
  }

  if (asset.type === "cri" && premises.selic_delta_pp != null) {
    // Fixture 05: +2 p.p. → renda CRI * 0.95
    income *= 1 - 0.025 * premises.selic_delta_pp;
  }

  return income * (1 - vacancy);
}

export function sumMonthlyIncome(
  snapshot: Snapshot,
  premises: Premises,
  excludeIds: Set<string> = new Set(),
): number {
  return snapshot.assets
    .filter((asset) => !excludeIds.has(asset.id))
    .reduce((sum, asset) => sum + effectiveMonthlyIncome(asset, premises), 0);
}

export function capitalCallAmount(premises: Premises): number {
  return premises.capital_call?.amount ?? 0;
}

export function projectCashFlow(
  snapshot: Snapshot,
  premises: Premises,
  horizonDays: number,
): Money {
  const sold = new Set(premises.sell_asset_ids ?? []);
  const months = horizonToMonths(horizonDays);
  const income = sumMonthlyIncome(snapshot, premises, sold);
  const call = capitalCallAmount(premises);

  let cash = snapshot.cash.amount;

  // Realocação: venda com IR → caixa imediato (fixture 02)
  if (sold.size > 0) {
    for (const asset of snapshot.assets) {
      if (!sold.has(asset.id)) continue;
      const proceeds = asset.valuation.amount.amount;
      const gain = Math.max(0, proceeds - costBasisFor(asset));
      const tax = gain * (premises.tax_rate_capital_gains ?? 0);
      cash += proceeds - tax;
    }
  }

  cash += income * months - call;
  return brl(Math.round(cash));
}

export function sumOutflows(premises: Premises, _horizonDays: number): number {
  return capitalCallAmount(premises);
}
