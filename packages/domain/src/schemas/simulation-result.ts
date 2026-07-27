import { z } from "zod";

import { MoneySchema } from "./money.js";

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);

export const RangeWithConfidenceSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    confidence: ConfidenceLevelSchema,
  })
  .strict();

export const HorizonCashSchema = z
  .object({
    "30d": MoneySchema,
    "90d": MoneySchema,
    "180d": MoneySchema,
    "365d": MoneySchema,
  })
  .strict();

export const SimulationResultSchema = z
  .object({
    cashFlow: HorizonCashSchema,
    yield: z
      .object({
        before: z.number(),
        after: z.union([z.number(), RangeWithConfidenceSchema]).optional(),
      })
      .strict(),
    concentration: z
      .object({
        byClass: z.record(z.number().min(0).max(1)).optional(),
        byRegion: z.record(z.number().min(0).max(1)).optional(),
        byIssuer: z.record(z.number().min(0).max(1)).optional(),
      })
      .strict()
      .optional(),
    structuralLiquidity: HorizonCashSchema,
    netWorth: MoneySchema.optional(),
    disclaimer: z.string().min(10),
    confidence: ConfidenceLevelSchema.optional(),
  })
  .strict();

export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type RangeWithConfidence = z.infer<typeof RangeWithConfidenceSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
