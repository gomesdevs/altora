export * from "./schema.js";
export { createDb, type Db } from "./client.js";
export {
  SILVA_FO_TENANT_ID,
  SILVA_FO_TENANT_NAME,
  SILVA_FO_CASH,
  SILVA_FO_ENTITIES,
  SILVA_FO_ASSETS,
  toDomainAsset,
  type SeedAssetRow,
  type SeedEntity,
} from "./seed-data/silva-fo.js";
export { withTenant } from "./repositories/with-tenant.js";
export { assetRowToDomain, assetToPayload } from "./repositories/asset-mapper.js";
export { DrizzleAssetRepository } from "./repositories/asset.repository.js";
export { DrizzlePortfolioRepository } from "./repositories/portfolio.repository.js";
export type { PortfolioRecord } from "./repositories/types.js";
export { DrizzleScenarioRepository } from "./repositories/scenario.repository.js";
export { DrizzleAuditLogRepository } from "./repositories/audit.repository.js";
export { rowToStoredScenario } from "./repositories/scenario-mapper.js";
export type {
  StoredScenario,
  AuditEvent,
  AuditAppendInput,
} from "./repositories/scenario-audit-types.js";
