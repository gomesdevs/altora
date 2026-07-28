import { AssetSchema, toDomainAsset, type Asset } from "@altora/domain";

export function assetRowToDomain(row: {
  id: string;
  entityId: string;
  type: string;
  name: string;
  payload: Record<string, unknown>;
}): Asset {
  const asset = toDomainAsset(row);
  return AssetSchema.parse(asset);
}

export function assetToPayload(asset: Asset): Record<string, unknown> {
  return {
    id: asset.id,
    entityId: asset.entityId,
    type: asset.type,
    name: asset.name,
    valuation: asset.valuation,
    region: asset.region,
    issuer: asset.issuer,
    monthlyIncome: asset.monthlyIncome,
    vacancyRate: asset.vacancyRate,
    liquidityDays: asset.liquidityDays,
    lockUpDays: asset.lockUpDays,
    indexer: asset.indexer,
    maturityDate: asset.maturityDate,
    commitment: asset.commitment,
    navLagDays: asset.navLagDays,
  };
}
