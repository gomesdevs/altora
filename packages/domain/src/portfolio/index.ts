import { DomainError } from "../errors.js";
import { brl } from "../schemas/money.js";
import type { Asset } from "../schemas/asset.js";
import type { Money } from "../schemas/money.js";
import type { Portfolio } from "../schemas/portfolio.js";
import { totalMonthlyIncome } from "../metrics/index.js";

export function aggregatePortfolio(assets: Asset[], cash: Money): Portfolio {
  if (assets.length === 0 && cash.amount <= 0) {
    throw new DomainError("EMPTY_PORTFOLIO", "Portfolio has no assets or cash");
  }

  const assetsValue = assets.reduce(
    (sum, asset) => sum + asset.valuation.amount.amount,
    0,
  );
  const monthlyIncome = totalMonthlyIncome(assets);

  return {
    assets,
    cash,
    netWorth: brl(assetsValue + cash.amount),
    monthlyIncome,
  };
}
