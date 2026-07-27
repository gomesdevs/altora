import { PremisesSchema } from "@altora/domain";
import { z } from "zod";

import type { SimulateScenarioInput } from "./scenarios-api";

export const WhatIfFormSchema = z.object({
  name: z.string().optional(),
  vacancia_percentual: z.string().optional(),
  inadimplencia_percentual: z.string().optional(),
  selic_delta_pp: z.string().optional(),
  fii_shock_pct: z.string().optional(),
  liquidation_days: z.string().optional(),
  capital_call_amount: z.string().optional(),
  tax_rate_capital_gains: z.string().optional(),
  sensitivity: z.union([
    z.literal(""),
    z.enum(["pessimista", "base", "otimista"]),
  ]).optional(),
});

export type WhatIfFormValues = z.infer<typeof WhatIfFormSchema>;

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalInt(value: string | undefined): number | undefined {
  const n = parseOptionalNumber(value);
  return n === undefined ? undefined : Math.trunc(n);
}

export function formValuesToSimulateInput(
  values: WhatIfFormValues,
): SimulateScenarioInput {
  const raw: Record<string, unknown> = {};

  const vacancia = parseOptionalNumber(values.vacancia_percentual);
  if (vacancia !== undefined) raw.vacancia_percentual = vacancia;

  const inadimplencia = parseOptionalNumber(values.inadimplencia_percentual);
  if (inadimplencia !== undefined) raw.inadimplencia_percentual = inadimplencia;

  const selic = parseOptionalNumber(values.selic_delta_pp);
  if (selic !== undefined) raw.selic_delta_pp = selic;

  const fii = parseOptionalNumber(values.fii_shock_pct);
  if (fii !== undefined) raw.fii_shock_pct = fii;

  const liquidation = parseOptionalInt(values.liquidation_days);
  if (liquidation !== undefined) raw.liquidation_days = liquidation;

  const capitalCall = parseOptionalNumber(values.capital_call_amount);
  if (capitalCall !== undefined) {
    raw.capital_call = { amount: capitalCall, currency: "BRL" };
  }

  const taxRate = parseOptionalNumber(values.tax_rate_capital_gains);
  if (taxRate !== undefined) raw.tax_rate_capital_gains = taxRate;

  if (values.sensitivity) {
    raw.sensitivity = values.sensitivity;
  }

  const parsed = PremisesSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Premissas inválidas — revise os campos do formulário.");
  }

  const name = values.name?.trim();
  return {
    name: name || undefined,
    premises: parsed.data,
  };
}
