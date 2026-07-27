import { DomainError } from "../errors.js";
import { brl, type Money } from "../schemas/money.js";
import type { Asset } from "../schemas/asset.js";
import type { Portfolio } from "../schemas/portfolio.js";

export type LiquidityHorizon = 30 | 90 | 180 | 365;

const HORIZONS: LiquidityHorizon[] = [30, 90, 180, 365];

/**
 * Dias efetivos até liquidez sem fire sale.
 * CRI com maturityDate é tratado como hold-to-maturity (fora da liquidez estrutural).
 */
export function effectiveLiquidityDays(asset: Asset): number | null {
  if (asset.type === "cri" && asset.maturityDate) {
    return null;
  }
  const liquidity = asset.liquidityDays ?? Number.POSITIVE_INFINITY;
  const lockUp = asset.lockUpDays ?? 0;
  return Math.max(liquidity, lockUp);
}

export function isLiquidAtHorizon(
  asset: Asset,
  horizonDays: LiquidityHorizon,
): boolean {
  const days = effectiveLiquidityDays(asset);
  if (days === null) return false;
  return days <= horizonDays;
}

export function calculateStructuralLiquidity(
  portfolio: Portfolio,
  horizonDays: LiquidityHorizon,
): Money {
  if (!HORIZONS.includes(horizonDays)) {
    throw new DomainError("INVALID_HORIZON", `Unsupported horizon: ${horizonDays}`);
  }

  let total = portfolio.cash.amount;
  for (const asset of portfolio.assets) {
    if (isLiquidAtHorizon(asset, horizonDays)) {
      total += asset.valuation.amount.amount;
    }
  }
  return brl(total);
}

export function structuralLiquidityByHorizon(
  portfolio: Portfolio,
): Record<"30d" | "90d" | "180d" | "365d", Money> {
  return {
    "30d": calculateStructuralLiquidity(portfolio, 30),
    "90d": calculateStructuralLiquidity(portfolio, 90),
    "180d": calculateStructuralLiquidity(portfolio, 180),
    "365d": calculateStructuralLiquidity(portfolio, 365),
  };
}
