import { z } from "zod";

import type { Asset } from "./asset.js";

export const CreateImovelAssetInputSchema = z
  .object({
    type: z.literal("imovel"),
    entityId: z.string().uuid(),
    name: z.string().min(1).max(200),
    region: z.string().min(1),
    valuationAmount: z.number().positive(),
    valuationAsOf: z.string().date(),
    valuationSource: z.string().min(1),
    monthlyIncomeAmount: z.number().min(0),
    vacancyRate: z.number().min(0).max(1).optional(),
    liquidityDays: z.number().int().min(0).optional(),
  })
  .strict();

export const CreateFiiAssetInputSchema = z
  .object({
    type: z.literal("fii"),
    entityId: z.string().uuid(),
    name: z.string().min(1).max(200),
    region: z.string().min(1),
    issuer: z.string().min(1),
    valuationAmount: z.number().positive(),
    valuationAsOf: z.string().date(),
    valuationSource: z.string().min(1),
    monthlyIncomeAmount: z.number().min(0),
    liquidityDays: z.number().int().min(0).optional(),
  })
  .strict();

export const CreateAssetInputSchema = z.discriminatedUnion("type", [
  CreateImovelAssetInputSchema,
  CreateFiiAssetInputSchema,
]);

export type CreateImovelAssetInput = z.infer<typeof CreateImovelAssetInputSchema>;
export type CreateFiiAssetInput = z.infer<typeof CreateFiiAssetInputSchema>;
export type CreateAssetInput = z.infer<typeof CreateAssetInputSchema>;

function brl(amount: number) {
  return { amount, currency: "BRL" as const };
}

/** Monta `Asset` canônico a partir do input validado (sem persistir). */
export function assetFromCreateInput(input: CreateAssetInput, id: string): Asset {
  if (input.type === "imovel") {
    return {
      id,
      entityId: input.entityId,
      type: "imovel",
      name: input.name,
      region: input.region,
      valuation: {
        amount: brl(input.valuationAmount),
        method: "laudo",
        asOf: input.valuationAsOf,
        source: input.valuationSource,
      },
      monthlyIncome: brl(input.monthlyIncomeAmount),
      vacancyRate: input.vacancyRate,
      liquidityDays: input.liquidityDays,
    };
  }

  return {
    id,
    entityId: input.entityId,
    type: "fii",
    name: input.name,
    region: input.region,
    issuer: input.issuer,
    valuation: {
      amount: brl(input.valuationAmount),
      method: "market",
      asOf: input.valuationAsOf,
      source: input.valuationSource,
    },
    monthlyIncome: brl(input.monthlyIncomeAmount),
    liquidityDays: input.liquidityDays ?? 5,
  };
}
