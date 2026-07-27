import { z } from "zod";

import { MoneySchema } from "./money.js";

export const PremisesSchema = z
  .object({
    vacancia_percentual: z.number().min(0).max(100).optional(),
    inadimplencia_percentual: z.number().min(0).max(100).optional(),
    selic_delta_pp: z.number().optional(),
    fii_shock_pct: z.number().optional(),
    liquidation_days: z.number().int().min(1).optional(),
    capital_call: MoneySchema.optional(),
    tax_rate_capital_gains: z.number().min(0).max(1).optional(),
    sell_asset_ids: z.array(z.string()).optional(),
    reallocate_to: z.enum(["cash", "cri", "fii"]).optional(),
    sensitivity: z.enum(["pessimista", "base", "otimista"]).optional(),
  })
  .strict();

export type Premises = z.infer<typeof PremisesSchema>;
