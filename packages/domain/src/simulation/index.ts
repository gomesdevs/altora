import type { Asset } from "../schemas/asset.js";
import type { Money } from "../schemas/money.js";
import type { Premises } from "../schemas/premises.js";
import type { Snapshot } from "../schemas/snapshot.js";
import type {
  ConfidenceLevel,
  SimulationResult,
} from "../schemas/simulation-result.js";
import { brl } from "../schemas/money.js";
import { DomainError } from "../errors.js";
import {
  formatWithLevel,
  getConfidenceLevel,
  lowestConfidence,
  round4,
} from "../confidence.js";
import { aggregatePortfolio } from "../portfolio/index.js";
import { calculateConcentration } from "../metrics/index.js";
import {
  structuralLiquidityByHorizon,
  type LiquidityHorizon,
} from "../liquidity/index.js";
import {
  capitalCallAmount,
  projectCashFlow,
  sumMonthlyIncome,
} from "./cashflow.js";
import { applyPremisesToSnapshot } from "./stress.js";

export const DEFAULT_DISCLAIMER =
  "Cenário hipotético para modelagem patrimonial. Não constitui recomendação de investimento.";

const HORIZONS: LiquidityHorizon[] = [30, 90, 180, 365];

function resolveScenarioConfidence(
  snapshot: Snapshot,
  premises: Premises,
  workingNetWorth: number,
): ConfidenceLevel {
  const peValue = snapshot.assets
    .filter((a) => a.type === "pe" || a.type === "participacao")
    .reduce((s, a) => s + a.valuation.amount.amount, 0);
  const peWeight = workingNetWorth > 0 ? peValue / workingNetWorth : 0;

  if (premises.capital_call || peWeight >= 0.4) {
    return "low";
  }

  if (
    premises.vacancia_percentual != null ||
    premises.inadimplencia_percentual != null ||
    (premises.sell_asset_ids?.length ?? 0) > 0 ||
    premises.sensitivity != null
  ) {
    return "medium";
  }

  if (
    premises.fii_shock_pct != null ||
    premises.selic_delta_pp != null ||
    Object.keys(premises).length === 0
  ) {
    return "high";
  }

  const assetLevels = snapshot.assets.map((a) => getConfidenceLevel(a.type));
  return lowestConfidence(assetLevels);
}

function portfolioYield(monthlyIncome: number, netWorth: number): number {
  if (!(netWorth > 0)) {
    throw new DomainError("EMPTY_PORTFOLIO");
  }
  return round4((monthlyIncome * 12) / netWorth);
}

function formatYieldAfter(
  point: number,
  level: ConfidenceLevel,
): number | { min: number; max: number; confidence: ConfidenceLevel } {
  const formatted = formatWithLevel(point, level);
  if ("value" in formatted) {
    return round4(formatted.value);
  }
  return formatted;
}

export function simulate(
  snapshot: Snapshot,
  scenario: { premises?: Premises; variants?: Premises[] } | Premises = {},
): SimulationResult {
  const premises: Premises =
    scenario != null &&
    typeof scenario === "object" &&
    "premises" in scenario &&
    scenario.premises !== undefined
      ? scenario.premises
      : ((scenario as Premises) ?? {});

  const beforePortfolio = aggregatePortfolio(snapshot.assets, snapshot.cash);
  const yieldBefore = portfolioYield(
    beforePortfolio.monthlyIncome.amount,
    beforePortfolio.netWorth.amount,
  );

  const { working } = applyPremisesToSnapshot(snapshot, premises);
  const call = capitalCallAmount(premises);

  const afterPortfolio = aggregatePortfolio(working.assets, working.cash);

  // Capital call (fixture 04): PL/concentração baseline; drena caixa e liquidez
  const reportPortfolio = call > 0 ? beforePortfolio : afterPortfolio;
  const netWorthAmount = reportPortfolio.netWorth.amount;

  let yieldPoint: number;
  if (call > 0) {
    yieldPoint = yieldBefore;
  } else {
    const monthlyAfter = sumMonthlyIncome(working, premises, new Set());
    yieldPoint = portfolioYield(monthlyAfter, afterPortfolio.netWorth.amount);
  }

  const confidence = resolveScenarioConfidence(
    snapshot,
    premises,
    reportPortfolio.netWorth.amount,
  );

  const cashFlow = {
    "30d": projectCashFlow(snapshot, premises, 30),
    "90d": projectCashFlow(snapshot, premises, 90),
    "180d": projectCashFlow(snapshot, premises, 180),
    "365d": projectCashFlow(snapshot, premises, 365),
  };

  const structuralLiquidity = structuralLiquidityByHorizon(
    call > 0 ? beforePortfolio : afterPortfolio,
  );
  if (call > 0) {
    for (const h of HORIZONS) {
      const key = `${h}d` as keyof typeof structuralLiquidity;
      structuralLiquidity[key] = brl(
        Math.max(0, structuralLiquidity[key].amount - call),
      );
    }
  }

  const concentration = {
    byClass: calculateConcentration(reportPortfolio, "class"),
    byRegion: calculateConcentration(reportPortfolio, "region"),
    byIssuer: calculateConcentration(reportPortfolio, "issuer"),
  };

  let disclaimer = DEFAULT_DISCLAIMER;
  if (confidence === "low") {
    disclaimer = call > 0
      ? `${DEFAULT_DISCLAIMER} NAV de PE com defasagem. Capital calls são incertos.`
      : `${DEFAULT_DISCLAIMER} PE com alta incerteza de liquidez e NAV.`;
  }

  return {
    cashFlow,
    yield: {
      before: yieldBefore,
      after: formatYieldAfter(yieldPoint, confidence),
    },
    concentration,
    structuralLiquidity,
    netWorth: brl(netWorthAmount),
    disclaimer,
    confidence,
  };
}

export function simulateVariants(
  snapshot: Snapshot,
  variants: Premises[],
): SimulationResult[] {
  return variants.map((premises) => simulate(snapshot, { premises }));
}

export { projectCashFlow, sumMonthlyIncome, horizonToMonths } from "./cashflow.js";
export { applyStress, applyPremisesToSnapshot } from "./stress.js";
