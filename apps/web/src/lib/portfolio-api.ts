export type ConsolidatedPortfolio = {
  tenantId: string;
  netWorth: { amount: number; currency: "BRL" };
  monthlyIncome: { amount: number; currency: "BRL" };
  yield: number;
  concentration: {
    byClass: Record<string, number>;
  };
  assetCount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID ?? "a1111111-1111-4111-8111-111111111111";

export async function fetchConsolidatedPortfolio(): Promise<ConsolidatedPortfolio> {
  const res = await fetch(`${API_URL}/portfolio/consolidated`, {
    headers: {
      "x-tenant-id": TENANT_ID,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Falha ao carregar portfólio (${res.status})`);
  }

  return res.json() as Promise<ConsolidatedPortfolio>;
}

export { TENANT_ID, API_URL };
