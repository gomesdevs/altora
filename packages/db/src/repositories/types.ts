import type { Asset, Money, SeedEntity } from "@altora/domain";

export type PortfolioRecord = {
  assets: Asset[];
  cash: Money;
  entities: SeedEntity[];
};
