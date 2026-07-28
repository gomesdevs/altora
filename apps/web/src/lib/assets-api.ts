import type { Asset, SeedEntity } from "@altora/domain";

import { API_URL } from "./portfolio-api";

export type AssetDto = Asset;
export type EntityDto = SeedEntity;

export type CreateAssetBody = {
  type: "imovel" | "fii";
  entityId: string;
  name: string;
  region: string;
  valuationAmount: number;
  valuationAsOf: string;
  valuationSource: string;
  monthlyIncomeAmount: number;
  issuer?: string;
  vacancyRate?: number;
  liquidityDays?: number;
};

export async function listAssets(accessToken: string): Promise<AssetDto[]> {
  const res = await fetch(`${API_URL}/assets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("Sessão inválida — faça login novamente.");
  }

  if (!res.ok) {
    throw new Error(`Falha ao listar ativos (${res.status})`);
  }

  return res.json() as Promise<AssetDto[]>;
}

export async function listEntities(accessToken: string): Promise<EntityDto[]> {
  const res = await fetch(`${API_URL}/assets/entities`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("Sessão inválida — faça login novamente.");
  }

  if (!res.ok) {
    throw new Error(`Falha ao listar entidades (${res.status})`);
  }

  return res.json() as Promise<EntityDto[]>;
}

export async function createAsset(
  accessToken: string,
  body: CreateAssetBody,
): Promise<AssetDto> {
  const res = await fetch(`${API_URL}/assets`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error("Sessão inválida — faça login novamente.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao criar ativo (${res.status}): ${text}`);
  }

  return res.json() as Promise<AssetDto>;
}
