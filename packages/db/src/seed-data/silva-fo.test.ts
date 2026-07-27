import { describe, expect, it } from "vitest";
import { aggregatePortfolio } from "@altora/domain";

import {
  SILVA_FO_ASSETS,
  SILVA_FO_CASH,
  SILVA_FO_TENANT_ID,
  toDomainAsset,
} from "./silva-fo.js";

describe("Silva FO seed data", () => {
  it("alinha ao PL canônico de R$ 3.850.000", () => {
    const assets = SILVA_FO_ASSETS.map((row) =>
      toDomainAsset({
        id: row.id,
        entityId: row.entityId,
        type: row.type,
        name: row.name,
        payload: {
          ...row.domain,
          id: row.id,
          entityId: row.entityId,
          type: row.type,
          name: row.name,
        },
      }),
    );
    const portfolio = aggregatePortfolio(assets, SILVA_FO_CASH);
    expect(portfolio.netWorth.amount).toBe(3_850_000);
    expect(portfolio.monthlyIncome.amount).toBe(14_625);
    expect(SILVA_FO_TENANT_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
