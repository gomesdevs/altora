"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { formatBrl, formatPct } from "@/lib/format";
import {
  listScenarios,
  type SimulateScenarioResponse,
} from "@/lib/scenarios-api";

const MAX_COMPARE = 3;
const MIN_COMPARE = 2;

const HORIZONS = [
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "180d", label: "180d" },
  { key: "365d", label: "365d" },
] as const;

const CLASS_LABELS: Record<string, string> = {
  real_estate: "Real estate",
  fixed_income: "Renda fixa",
  private_equity: "Private equity",
  cash: "Caixa",
};

export function CompareView() {
  const { accessToken, isReady } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["scenarios", "list", accessToken],
    queryFn: () => {
      if (!accessToken) throw new Error("Sessão ausente — faça login.");
      return listScenarios(accessToken);
    },
    enabled: isReady && Boolean(accessToken),
  });

  const compared = useMemo(() => {
    if (!data) return [];
    return selected
      .map((id) => data.find((s) => s.id === id))
      .filter((s): s is SimulateScenarioResponse => Boolean(s));
  }, [data, selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  if (!isReady) {
    return <p className="text-muted-foreground">Carregando sessão…</p>;
  }

  if (!accessToken) {
    return (
      <p className="text-sm">
        Sessão necessária.{" "}
        <Link className="underline" href="/login?next=/what-if/compare">
          Fazer login
        </Link>
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando cenários…</p>;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro ao listar</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Falha desconhecida"}
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
          >
            Tentar de novo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const scenarios = data ?? [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cenários do tenant</CardTitle>
          <CardDescription>
            Selecione de {MIN_COMPARE} a {MAX_COMPARE} para comparar. Dados
            vêm da API — sem recálculo no browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum cenário persistido.{" "}
              <Link className="underline" href="/what-if">
                Simular um cenário
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {scenarios.map((scenario) => {
                const checked = selected.includes(scenario.id);
                const disabled = !checked && selected.length >= MAX_COMPARE;
                return (
                  <li
                    key={scenario.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(scenario.id)}
                      id={`scenario-${scenario.id}`}
                    />
                    <label
                      htmlFor={`scenario-${scenario.id}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {new Date(scenario.createdAt).toLocaleString("pt-BR")}
                        {" · "}
                        <code className="text-[0.7rem]">{scenario.id.slice(0, 8)}</code>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Selecionados: {selected.length}/{MAX_COMPARE}
          </p>
        </CardContent>
      </Card>

      {compared.length >= MIN_COMPARE && (
        <CompareTable scenarios={compared} />
      )}

      {selected.length > 0 && selected.length < MIN_COMPARE && (
        <p className="text-sm text-muted-foreground">
          Selecione mais {MIN_COMPARE - selected.length} cenário(s) para
          comparar.
        </p>
      )}
    </div>
  );
}

function CompareTable({
  scenarios,
}: {
  scenarios: SimulateScenarioResponse[];
}) {
  const classKeys = Array.from(
    new Set(
      scenarios.flatMap((s) => Object.keys(s.result.concentration?.byClass ?? {})),
    ),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Caixa projetado</CardTitle>
          <CardDescription>Horizontes 30 / 90 / 180 / 365 dias.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-medium">Horizonte</th>
                {scenarios.map((s) => (
                  <th key={s.id} className="py-2 pr-4 font-medium">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORIZONS.map(({ key, label }) => (
                <tr key={key} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="py-2 pr-4 tabular-nums">
                      {formatBrl(s.result.cashFlow[key].amount)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yield efetivo</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-medium">Métrica</th>
                {scenarios.map((s) => (
                  <th key={s.id} className="py-2 pr-4 font-medium">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 text-muted-foreground">Antes</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="py-2 pr-4 tabular-nums">
                    {formatPct(s.result.yield.before)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 text-muted-foreground">Depois</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="py-2 pr-4 tabular-nums">
                    {formatYieldAfter(s.result.yield.after)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 text-muted-foreground">Confiança</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="py-2 pr-4">
                    {s.result.confidence ?? "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Concentração por classe</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {classKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Concentração não retornada nestes cenários.
            </p>
          ) : (
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium">Classe</th>
                  {scenarios.map((s) => (
                    <th key={s.id} className="py-2 pr-4 font-medium">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classKeys.map((cls) => (
                  <tr key={cls} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {CLASS_LABELS[cls] ?? cls}
                    </td>
                    {scenarios.map((s) => {
                      const weight = s.result.concentration?.byClass?.[cls];
                      return (
                        <td key={s.id} className="py-2 pr-4 tabular-nums">
                          {weight === undefined ? "—" : formatPct(weight)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {scenarios.map((s) => (
          <Alert key={s.id}>
            <AlertTitle>
              Modelagem hipotética (INV-06) — {s.name}
            </AlertTitle>
            <AlertDescription>{s.result.disclaimer}</AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}

function formatYieldAfter(
  after?: number | { min: number; max: number; confidence: string },
): string {
  if (after === undefined) return "—";
  if (typeof after === "number") return formatPct(after);
  return `${formatPct(after.min)} – ${formatPct(after.max)}`;
}
