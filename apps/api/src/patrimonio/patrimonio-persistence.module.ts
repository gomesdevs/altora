import { Global, Module, type DynamicModule } from "@nestjs/common";
import {
  createDb,
  DrizzleAssetRepository,
  DrizzleAuditLogRepository,
  DrizzlePortfolioRepository,
  DrizzleScenarioRepository,
  type Db,
} from "@altora/db";

import { InMemoryAssetRepository } from "../assets/asset.repository";
import { InMemoryAuditLogRepository } from "../audit/audit.repository";
import { InMemoryPortfolioRepository } from "../portfolio/portfolio.repository";
import { InMemoryScenarioRepository } from "../scenarios/scenario.repository";
import {
  ASSET_REPOSITORY,
  AUDIT_LOG_REPOSITORY,
  DB,
  PORTFOLIO_REPOSITORY,
  SCENARIO_REPOSITORY,
} from "../tokens";

function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

@Global()
@Module({})
export class PatrimonioPersistenceModule {
  static register(): DynamicModule {
    if (usePostgres()) {
      return {
        module: PatrimonioPersistenceModule,
        providers: [
          {
            provide: DB,
            useFactory: (): Db => createDb(process.env.DATABASE_URL!),
          },
          {
            provide: ASSET_REPOSITORY,
            useFactory: (db: Db) => new DrizzleAssetRepository(db),
            inject: [DB],
          },
          {
            provide: PORTFOLIO_REPOSITORY,
            useFactory: (db: Db) => new DrizzlePortfolioRepository(db),
            inject: [DB],
          },
          {
            provide: SCENARIO_REPOSITORY,
            useFactory: (db: Db) => new DrizzleScenarioRepository(db),
            inject: [DB],
          },
          {
            provide: AUDIT_LOG_REPOSITORY,
            useFactory: (db: Db) => new DrizzleAuditLogRepository(db),
            inject: [DB],
          },
        ],
        exports: [
          DB,
          ASSET_REPOSITORY,
          PORTFOLIO_REPOSITORY,
          SCENARIO_REPOSITORY,
          AUDIT_LOG_REPOSITORY,
        ],
      };
    }

    return {
      module: PatrimonioPersistenceModule,
      providers: [
        InMemoryAssetRepository,
        {
          provide: ASSET_REPOSITORY,
          useExisting: InMemoryAssetRepository,
        },
        {
          provide: PORTFOLIO_REPOSITORY,
          useFactory: (assets: InMemoryAssetRepository) =>
            new InMemoryPortfolioRepository(assets),
          inject: [InMemoryAssetRepository],
        },
        {
          provide: SCENARIO_REPOSITORY,
          useClass: InMemoryScenarioRepository,
        },
        {
          provide: AUDIT_LOG_REPOSITORY,
          useClass: InMemoryAuditLogRepository,
        },
      ],
      exports: [
        ASSET_REPOSITORY,
        PORTFOLIO_REPOSITORY,
        SCENARIO_REPOSITORY,
        AUDIT_LOG_REPOSITORY,
      ],
    };
  }
}
