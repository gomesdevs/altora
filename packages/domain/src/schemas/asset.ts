import { z } from "zod";

import { MoneySchema } from "./money.js";
import { ValuationSchema } from "./valuation.js";

export const AssetTypeSchema = z.enum([
  "imovel",
  "fii",
  "cri",
  "pe",
  "participacao",
  "credito_tokenizado",
  "cash",
]);

export const AssetSchema = z
  .object({
    id: z.string().min(1),
    entityId: z.string().min(1),
    type: AssetTypeSchema,
    name: z.string().min(1),
    valuation: ValuationSchema,
    region: z.string().optional(),
    issuer: z.string().optional(),
    monthlyIncome: MoneySchema.optional(),
    vacancyRate: z.number().min(0).max(1).optional(),
    liquidityDays: z.number().int().min(0).optional(),
    lockUpDays: z.number().int().min(0).optional(),
    indexer: z.string().optional(),
    maturityDate: z.string().date().optional(),
    commitment: MoneySchema.optional(),
    navLagDays: z.number().int().min(0).optional(),
  })
  .strict();

export type Asset = z.infer<typeof AssetSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
