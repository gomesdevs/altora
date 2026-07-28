import { Global, Module, type DynamicModule } from "@nestjs/common";
import {
  createDb,
  DrizzleAssetRepository,
  DrizzlePortfolioRepository,
  type Db,
} from "@altora/db";

import { InMemoryAssetRepository } from "../assets/asset.repository";
import { InMemoryPortfolioRepository } from "../portfolio/portfolio.repository";
import { ASSET_REPOSITORY, DB, PORTFOLIO_REPOSITORY } from "../tokens";

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
        ],
        exports: [DB, ASSET_REPOSITORY, PORTFOLIO_REPOSITORY],
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
      ],
      exports: [ASSET_REPOSITORY, PORTFOLIO_REPOSITORY],
    };
  }
}
