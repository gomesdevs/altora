import { DomainError } from "../errors.js";
import { brl, type Money } from "../schemas/money.js";
import type { Asset } from "../schemas/asset.js";
import type { Portfolio } from "../schemas/portfolio.js";

export function calculateEffectiveYield(asset: Asset): number {
  const valuation = asset.valuation.amount.amount;
  if (!(valuation > 0)) {
    throw new DomainError(
      "INVALID_VALUATION",
      "Valuation must be greater than zero",
    );
  }

  const monthly = asset.monthlyIncome?.amount ?? 0;
  const vacancy = asset.vacancyRate ?? 0;
  const annual = monthly * 12 * (1 - vacancy);
  return annual / valuation;
}

export type ConcentrationDimension = "class" | "region" | "issuer";

const CLASS_BY_TYPE: Record<Asset["type"], string> = {
  imovel: "real_estate",
  fii: "real_estate",
  cri: "fixed_income",
  credito_tokenizado: "fixed_income",
  pe: "private_equity",
  participacao: "private_equity",
  cash: "cash",
};

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

export function calculateConcentration(
  portfolio: Portfolio,
  dimension: ConcentrationDimension,
): Record<string, number> {
  const netWorth = portfolio.netWorth.amount;
  if (!(netWorth > 0)) {
    throw new DomainError("EMPTY_PORTFOLIO", "Portfolio net worth must be > 0");
  }

  const buckets = new Map<string, number>();

  const add = (key: string | undefined, amount: number) => {
    if (!key) return;
    buckets.set(key, (buckets.get(key) ?? 0) + amount);
  };

  for (const asset of portfolio.assets) {
    const amount = asset.valuation.amount.amount;
    if (dimension === "class") {
      add(CLASS_BY_TYPE[asset.type], amount);
    } else if (dimension === "region") {
      add(asset.region, amount);
    } else {
      add(asset.issuer, amount);
    }
  }

  if (dimension === "class") {
    add("cash", portfolio.cash.amount);
  }

  const result: Record<string, number> = {};
  for (const [key, amount] of buckets) {
    result[key] = round4(amount / netWorth);
  }
  return result;
}

export function totalMonthlyIncome(assets: Asset[]): Money {
  const total = assets.reduce(
    (sum, asset) =>
      sum + (asset.monthlyIncome?.amount ?? 0) * (1 - (asset.vacancyRate ?? 0)),
    0,
  );
  return brl(total);
}
