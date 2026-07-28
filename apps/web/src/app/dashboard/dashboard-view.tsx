"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { fetchConsolidatedPortfolio } from "../../lib/portfolio-api";

const CLASS_LABELS: Record<string, string> = {
  real_estate: "Real estate",
  fixed_income: "Renda fixa",
  private_equity: "Private equity",
  cash: "Caixa",
};

function formatBrl(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPct(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}

export function DashboardView() {
  const { accessToken, isReady, logout } = useAuth();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["portfolio", "consolidated", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Sessão ausente — faça login.");
      }
      return fetchConsolidatedPortfolio(accessToken);
    },
    enabled: isReady && Boolean(accessToken),
  });

  if (!isReady) {
    return <p style={{ opacity: 0.7 }}>Carregando sessão…</p>;
  }

  if (!accessToken) {
    return (
      <div>
        <p style={{ color: "#8b1e1e" }}>
          Sessão necessária para ver o patrimônio.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          <Link href="/login?next=/dashboard">Fazer login</Link>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <p style={{ opacity: 0.7 }}>Carregando consolidação…</p>;
  }

  if (isError || !data) {
    return (
      <div>
        <p style={{ color: "#8b1e1e" }}>
          {error instanceof Error ? error.message : "Erro ao carregar dashboard"}
        </p>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: "0.75rem" }}>
          Confirme que a API está em <code>localhost:3001</code> e que{" "}
          <code>AUTH_DEV_SECRET</code> é o mesmo no web e na API.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            border: "1px solid #1a1a1a",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Tentar de novo
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          style={{
            marginTop: "1rem",
            marginLeft: "0.75rem",
            padding: "0.5rem 1rem",
            border: "1px solid #1a1a1a",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sair
        </button>
      </div>
    );
  }

  const allocation = Object.entries(data.concentration.byClass).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          onClick={() => void logout()}
          style={{
            padding: "0.35rem 0.75rem",
            border: "1px solid rgba(0,0,0,0.2)",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.85rem",
          }}
        >
          Sair
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <Kpi label="Patrimônio líquido" value={formatBrl(data.netWorth.amount)} />
        <Kpi label="Yield efetivo" value={formatPct(data.yield)} />
        <Kpi label="Renda mensal" value={formatBrl(data.monthlyIncome.amount)} />
        <Kpi label="Ativos" value={String(data.assetCount)} />
      </div>

      <section>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            letterSpacing: "0.02em",
          }}
        >
          Alocação por classe
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: 420 }}>
          {allocation.map(([cls, weight]) => (
            <li
              key={cls}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "1rem",
                padding: "0.65rem 0",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <span>{CLASS_LABELS[cls] ?? cls}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatPct(weight)}
              </span>
              <div
                style={{
                  gridColumn: "1 / -1",
                  height: 4,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, weight * 100)}%`,
                    height: "100%",
                    background: "#1a1a1a",
                    borderRadius: 2,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: "2rem", fontSize: "0.8rem", opacity: 0.55 }}>
        Métricas calculadas na API via <code>@altora/domain</code>
        {isFetching ? " · atualizando…" : ""}. Tenant vem do JWT da sessão.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.55,
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.65rem",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}
