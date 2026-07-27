import type { Premises } from "../schemas/premises.js";
import type { Snapshot } from "../schemas/snapshot.js";
import { DomainError } from "../errors.js";
import { cloneSnapshot } from "../snapshot/index.js";
import { costBasisFor } from "./cashflow.js";

/**
 * Aplica stress e devolve novo snapshot (INV-05 — original intacto).
 */
export function applyStress(
  snapshot: Snapshot,
  stressType: string,
  params: Record<string, unknown> = {},
): Snapshot {
  const next = cloneSnapshot(snapshot);

  switch (stressType) {
    case "fii_shock": {
      const pct = Number(params.fii_shock_pct ?? 0);
      next.assets = next.assets.map((asset) => {
        if (asset.type !== "fii") return asset;
        const amount = asset.valuation.amount.amount * (1 + pct / 100);
        return {
          ...asset,
          valuation: {
            ...asset.valuation,
            amount: { amount, currency: "BRL" },
          },
        };
      });
      break;
    }
    case "vacancia": {
      const vacancia = Number(params.vacancia_percentual ?? 0) / 100;
      next.assets = next.assets.map((asset) => {
        if (asset.type !== "imovel") return asset;
        return { ...asset, vacancyRate: vacancia };
      });
      break;
    }
    case "sell": {
      const ids = new Set(
        (params.sell_asset_ids as string[] | undefined) ?? [],
      );
      next.assets = next.assets.filter((asset) => !ids.has(asset.id));
      break;
    }
    case "noop":
      break;
    default:
      throw new DomainError(
        "INVALID_PREMISES",
        `Unknown stress type: ${stressType}`,
      );
  }

  return next;
}

export function applyPremisesToSnapshot(
  snapshot: Snapshot,
  premises: Premises,
): { working: Snapshot; soldIds: Set<string>; saleNetProceeds: number } {
  let working = cloneSnapshot(snapshot);
  const soldIds = new Set(premises.sell_asset_ids ?? []);
  let saleNetProceeds = 0;

  if (premises.fii_shock_pct != null && premises.fii_shock_pct !== 0) {
    working = applyStress(working, "fii_shock", {
      fii_shock_pct: premises.fii_shock_pct,
    });
  }

  if (premises.vacancia_percentual != null) {
    working = applyStress(working, "vacancia", {
      vacancia_percentual: premises.vacancia_percentual,
    });
  }

  if (soldIds.size > 0) {
    for (const asset of snapshot.assets) {
      if (!soldIds.has(asset.id)) continue;
      const proceeds = asset.valuation.amount.amount;
      const gain = Math.max(0, proceeds - costBasisFor(asset));
      const tax = gain * (premises.tax_rate_capital_gains ?? 0);
      saleNetProceeds += proceeds - tax;
    }
    working = applyStress(working, "sell", {
      sell_asset_ids: [...soldIds],
    });
    working.cash = {
      amount: working.cash.amount + saleNetProceeds,
      currency: "BRL",
    };
  }

  return { working, soldIds, saleNetProceeds };
}
