import { z } from "zod";

import { AssetSchema } from "./asset.js";
import { MoneySchema, type Money } from "./money.js";
import type { Asset } from "./asset.js";

export const PortfolioSchema = z
  .object({
    assets: z.array(AssetSchema),
    cash: MoneySchema,
    netWorth: MoneySchema,
    monthlyIncome: MoneySchema,
  })
  .strict();

export type Portfolio = {
  assets: Asset[];
  cash: Money;
  netWorth: Money;
  monthlyIncome: Money;
};

export type SnapshotMeta = {
  id: string;
  tenantId: string;
  entities: Array<{
    id: string;
    name: string;
    type: "holding" | "spe" | "pessoa";
  }>;
  version?: number;
  capturedAt?: string;
};
