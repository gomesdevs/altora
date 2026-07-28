import { CreateAssetInputSchema } from "@altora/domain";
import { z } from "zod";

import type { CreateAssetBody } from "./assets-api";

export const AssetWizardFormSchema = z.object({
  type: z.enum(["imovel", "fii"]),
  entityId: z.string().min(1, "Selecione a entidade"),
  name: z.string().min(1, "Nome obrigatório"),
  region: z.string().min(1, "Região obrigatória"),
  issuer: z.string().optional(),
  valuationAmount: z.string().min(1, "Valor de avaliação obrigatório"),
  valuationAsOf: z.string().min(1, "Data da avaliação obrigatória"),
  valuationSource: z.string().min(1, "Fonte da avaliação obrigatória"),
  monthlyIncomeAmount: z.string().min(1, "Renda mensal obrigatória"),
  vacancyRate: z.string().optional(),
  liquidityDays: z.string().optional(),
});

export type AssetWizardFormValues = z.infer<typeof AssetWizardFormSchema>;

function parseRequiredNumber(value: string, label: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`${label} inválido`);
  }
  return n;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalInt(value: string | undefined): number | undefined {
  const n = parseOptionalNumber(value);
  return n === undefined ? undefined : Math.trunc(n);
}

export function formValuesToCreateAssetBody(
  values: AssetWizardFormValues,
): CreateAssetBody {
  const raw: Record<string, unknown> = {
    type: values.type,
    entityId: values.entityId,
    name: values.name.trim(),
    region: values.region.trim(),
    valuationAmount: parseRequiredNumber(
      values.valuationAmount,
      "Valor de avaliação",
    ),
    valuationAsOf: values.valuationAsOf.trim(),
    valuationSource: values.valuationSource.trim(),
    monthlyIncomeAmount: parseRequiredNumber(
      values.monthlyIncomeAmount,
      "Renda mensal",
    ),
  };

  const vacancyRate = parseOptionalNumber(values.vacancyRate);
  if (vacancyRate !== undefined) raw.vacancyRate = vacancyRate;

  const liquidityDays = parseOptionalInt(values.liquidityDays);
  if (liquidityDays !== undefined) raw.liquidityDays = liquidityDays;

  if (values.type === "fii") {
    const issuer = values.issuer?.trim();
    if (!issuer) {
      throw new Error("Emissor obrigatório para FII");
    }
    raw.issuer = issuer;
  }

  const parsed = CreateAssetInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados do ativo inválidos — revise o formulário.");
  }

  return parsed.data as CreateAssetBody;
}
