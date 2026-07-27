/**
 * Re-export do canônico Silva FO (fonte tipada em @altora/domain).
 * Persistência/seed do DB consomem daqui para manter um único dataset.
 */
export {
  SILVA_FO_TENANT_ID,
  SILVA_FO_TENANT_NAME,
  SILVA_FO_CASH,
  SILVA_FO_ENTITIES,
  SILVA_FO_ASSETS,
  toDomainAsset,
  silvaFoDomainAssets,
  type SeedAssetRow,
  type SeedEntity,
} from "@altora/domain";
