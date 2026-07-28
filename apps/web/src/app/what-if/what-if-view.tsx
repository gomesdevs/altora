"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { formatBrl, formatPct } from "@/lib/format";
import { simulateScenario } from "@/lib/scenarios-api";
import {
  formValuesToSimulateInput,
  WhatIfFormSchema,
  type WhatIfFormValues,
} from "@/lib/what-if-form";

const CLASS_LABELS: Record<string, string> = {
  real_estate: "Real estate",
  fixed_income: "Renda fixa",
  private_equity: "Private equity",
  cash: "Caixa",
};

const HORIZONS = [
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "180d", label: "180 dias" },
  { key: "365d", label: "365 dias" },
] as const;

const defaultValues: WhatIfFormValues = {
  name: "",
  vacancia_percentual: "",
  inadimplencia_percentual: "",
  selic_delta_pp: "",
  fii_shock_pct: "",
  liquidation_days: "",
  capital_call_amount: "",
  tax_rate_capital_gains: "",
  sensitivity: "",
};

export function WhatIfView() {
  const { accessToken } = useAuth();
  const form = useForm<WhatIfFormValues>({
    resolver: zodResolver(WhatIfFormSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values: WhatIfFormValues) => {
      if (!accessToken) {
        throw new Error("Sessão ausente — faça login.");
      }
      return simulateScenario(
        accessToken,
        formValuesToSimulateInput(values),
      );
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const result = mutation.data?.result;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Premissas do cenário</CardTitle>
          <CardDescription>
            Defina estresses hipotéticos. A simulação roda na API — nada é
            calculado neste browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Nome do cenário"
                hint="Opcional"
                error={form.formState.errors.name?.message}
              >
                <Input id="name" {...form.register("name")} placeholder="Stress vacância 15%" />
              </Field>

              <Field
                id="sensitivity"
                label="Sensibilidade"
                hint="Opcional"
              >
                <select
                  id="sensitivity"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register("sensitivity")}
                >
                  <option value="">—</option>
                  <option value="pessimista">Pessimista</option>
                  <option value="base">Base</option>
                  <option value="otimista">Otimista</option>
                </select>
              </Field>

              <Field
                id="vacancia_percentual"
                label="Vacância (%)"
                hint="0–100"
              >
                <Input
                  id="vacancia_percentual"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  {...form.register("vacancia_percentual")}
                />
              </Field>

              <Field
                id="inadimplencia_percentual"
                label="Inadimplência (%)"
                hint="0–100"
              >
                <Input
                  id="inadimplencia_percentual"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  {...form.register("inadimplencia_percentual")}
                />
              </Field>

              <Field id="selic_delta_pp" label="Δ Selic (pp)" hint="Ex.: 2">
                <Input
                  id="selic_delta_pp"
                  type="number"
                  step="0.1"
                  {...form.register("selic_delta_pp")}
                />
              </Field>

              <Field id="fii_shock_pct" label="Choque FII (%)" hint="Ex.: -20">
                <Input
                  id="fii_shock_pct"
                  type="number"
                  step="0.1"
                  {...form.register("fii_shock_pct")}
                />
              </Field>

              <Field
                id="liquidation_days"
                label="Dias para liquidação"
                hint="Inteiro ≥ 1"
              >
                <Input
                  id="liquidation_days"
                  type="number"
                  min={1}
                  step={1}
                  {...form.register("liquidation_days")}
                />
              </Field>

              <Field
                id="capital_call_amount"
                label="Capital call (R$)"
                hint="Valor em BRL"
              >
                <Input
                  id="capital_call_amount"
                  type="number"
                  min={0}
                  step={1000}
                  {...form.register("capital_call_amount")}
                />
              </Field>

              <Field
                id="tax_rate_capital_gains"
                label="IR ganho de capital"
                hint="0–1 (ex.: 0.15)"
              >
                <Input
                  id="tax_rate_capital_gains"
                  type="number"
                  min={0}
                  max={1}
                  step="0.01"
                  {...form.register("tax_rate_capital_gains")}
                />
              </Field>
            </div>

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Erro na simulação</AlertTitle>
                <AlertDescription>
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Falha ao simular cenário"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={mutation.isPending || !accessToken}
            >
              {mutation.isPending ? "Simulando…" : "Simular cenário"}
            </Button>
            {!accessToken && (
              <p className="text-sm text-destructive">
                Sessão necessária.{" "}
                <a className="underline" href="/login?next=/what-if">
                  Fazer login
                </a>
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Caixa projetado</CardTitle>
              <CardDescription>
                Fluxo de caixa após premissas — horizontes em dias corridos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HORIZONS.map(({ key, label }) => (
                  <div key={key} className="rounded-md border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-xl tabular-nums">
                      {formatBrl(result.cashFlow[key].amount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yield efetivo</CardTitle>
                <CardDescription>Antes e depois das premissas.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg tabular-nums">
                  {formatYieldDisplay(result.yield.before, result.yield.after)}
                </p>
                {result.confidence === "low" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Confiança epistêmica baixa — yield exibido em faixa.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Concentração por classe</CardTitle>
                <CardDescription>Após aplicar o cenário.</CardDescription>
              </CardHeader>
              <CardContent>
                {result.concentration?.byClass ? (
                  <ul className="space-y-2">
                    {Object.entries(result.concentration.byClass)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, weight]) => (
                        <li
                          key={cls}
                          className="flex justify-between gap-4 text-sm tabular-nums"
                        >
                          <span>{CLASS_LABELS[cls] ?? cls}</span>
                          <span>{formatPct(weight)}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Concentração não retornada neste cenário.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTitle>Modelagem hipotética (INV-06)</AlertTitle>
            <AlertDescription>{result.disclaimer}</AlertDescription>
          </Alert>

          {mutation.data && (
            <p className="text-xs text-muted-foreground">
              Cenário persistido: <code>{mutation.data.id}</code>
              {mutation.data.invariants["INV-05"] &&
              mutation.data.invariants["INV-06"]
                ? " · invariantes INV-05/INV-06 verificados na API"
                : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatYieldDisplay(
  before: number,
  after?: number | { min: number; max: number; confidence: string },
): string {
  const beforeFmt = formatPct(before);
  if (after === undefined) return beforeFmt;
  if (typeof after === "number") return `${beforeFmt} → ${formatPct(after)}`;
  return `${beforeFmt} → ${formatPct(after.min)} – ${formatPct(after.max)}`;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
