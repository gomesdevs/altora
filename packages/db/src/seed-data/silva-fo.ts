import type { Asset, Money } from "@altora/domain";

/**
 * IDs estáveis (UUID v4-shaped) para seed idempotente e demos locais.
 * Alinhados semanticamente ao fixture Silva FO.
 */
export const SILVA_FO_TENANT_ID = "a1111111-1111-4111-8111-111111111111";
export const SILVA_FO_TENANT_NAME = "Silva Family Office (dev)";

export const SILVA_FO_ENTITY_HOLDING_ID = "b2222222-2222-4222-8222-222222222222";
export const SILVA_FO_ENTITY_SPE_ID = "b3333333-3333-4333-8333-333333333333";

export const SILVA_FO_ASSET_IMOVEL_ID = "c4444444-4444-4444-8444-444444444444";
export const SILVA_FO_ASSET_FII_ID = "c5555555-5555-4555-8555-555555555555";
export const SILVA_FO_ASSET_CRI_ID = "c6666666-6666-4666-8666-666666666666";
export const SILVA_FO_ASSET_PE_ID = "c7777777-7777-4777-8777-777777777777";

/** Caixa do portfólio canônico — R$ 200.000 */
export const SILVA_FO_CASH: Money = { amount: 200_000, currency: "BRL" };

export type SeedEntity = {
  id: string;
  name: string;
  type: "holding" | "spe" | "pessoa";
};

export type SeedAssetRow = {
  id: string;
  entityId: string;
  type: Asset["type"];
  name: string;
  /** Campos de domínio persistidos em assets.payload */
  domain: Omit<Asset, "id" | "entityId" | "type" | "name"> &
    Partial<Pick<Asset, "id" | "entityId" | "type" | "name">>;
};

/**
 * Snapshot canônico Silva FO (docs/domain/harness/fixtures/_base/portfolio-silva-fo.json).
 */
export const SILVA_FO_ENTITIES: SeedEntity[] = [
  {
    id: SILVA_FO_ENTITY_HOLDING_ID,
    name: "Holding Silva Ltda.",
    type: "holding",
  },
  {
    id: SILVA_FO_ENTITY_SPE_ID,
    name: "SPE Jardins Imóveis",
    type: "spe",
  },
];

export const SILVA_FO_ASSETS: SeedAssetRow[] = [
  {
    id: SILVA_FO_ASSET_IMOVEL_ID,
    entityId: SILVA_FO_ENTITY_SPE_ID,
    type: "imovel",
    name: "Apartamento Jardins SP",
    domain: {
      region: "SP",
      valuation: {
        amount: { amount: 2_100_000, currency: "BRL" },
        method: "laudo",
        asOf: "2025-03-15",
        source: "Avaliador XYZ Ltda.",
      },
      monthlyIncome: { amount: 8_500, currency: "BRL" },
      vacancyRate: 0,
      liquidityDays: 180,
    },
  },
  {
    id: SILVA_FO_ASSET_FII_ID,
    entityId: SILVA_FO_ENTITY_HOLDING_ID,
    type: "fii",
    name: "KNRI11",
    domain: {
      region: "SP",
      issuer: "Kinea",
      valuation: {
        amount: { amount: 450_000, currency: "BRL" },
        method: "market",
        asOf: "2025-07-26",
        source: "B3",
      },
      monthlyIncome: { amount: 3_375, currency: "BRL" },
      liquidityDays: 5,
    },
  },
  {
    id: SILVA_FO_ASSET_CRI_ID,
    entityId: SILVA_FO_ENTITY_HOLDING_ID,
    type: "cri",
    name: "CRI MRV 2028",
    domain: {
      region: "BR",
      issuer: "MRV",
      valuation: {
        amount: { amount: 300_000, currency: "BRL" },
        method: "market",
        asOf: "2025-07-26",
        source: "Emissor",
      },
      monthlyIncome: { amount: 2_750, currency: "BRL" },
      indexer: "IPCA+6%",
      maturityDate: "2028-06-30",
      liquidityDays: 90,
    },
  },
  {
    id: SILVA_FO_ASSET_PE_ID,
    entityId: SILVA_FO_ENTITY_HOLDING_ID,
    type: "pe",
    name: "Fundo VC Brasil",
    domain: {
      region: "BR",
      issuer: "VC Brasil Gestora",
      valuation: {
        amount: { amount: 800_000, currency: "BRL" },
        method: "nav",
        asOf: "2025-04-30",
        source: "Administrador — NAV com defasagem 90d",
      },
      commitment: { amount: 1_000_000, currency: "BRL" },
      navLagDays: 90,
      lockUpDays: 365,
      liquidityDays: 365,
    },
  },
];

/** Monta Asset de domínio a partir da linha de seed/DB. */
export function toDomainAsset(row: {
  id: string;
  entityId: string;
  type: string;
  name: string;
  payload: Record<string, unknown>;
}): Asset {
  const payload = row.payload as Partial<Asset>;
  return {
    id: row.id,
    entityId: row.entityId,
    type: row.type as Asset["type"],
    name: row.name,
    valuation: payload.valuation as Asset["valuation"],
    region: payload.region,
    issuer: payload.issuer,
    monthlyIncome: payload.monthlyIncome,
    vacancyRate: payload.vacancyRate,
    liquidityDays: payload.liquidityDays,
    lockUpDays: payload.lockUpDays,
    indexer: payload.indexer,
    maturityDate: payload.maturityDate,
    commitment: payload.commitment,
    navLagDays: payload.navLagDays,
  };
}
