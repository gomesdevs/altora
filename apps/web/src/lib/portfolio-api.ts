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

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchConsolidatedPortfolio(
  accessToken: string,
): Promise<ConsolidatedPortfolio> {
  const res = await fetch(`${API_URL}/portfolio/consolidated`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("Sessão inválida — faça login novamente.");
  }

  if (!res.ok) {
    throw new Error(`Falha ao carregar portfólio (${res.status})`);
  }

  return res.json() as Promise<ConsolidatedPortfolio>;
}
