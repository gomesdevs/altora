import { describe, expect, it } from "vitest";
import { SILVA_FO_ASSETS } from "@altora/domain";

import { assetRowToDomain, assetToPayload } from "./asset-mapper.js";

describe("asset-mapper", () => {
  it("round-trip payload ↔ Asset", () => {
    const row = SILVA_FO_ASSETS[0];
    const domain = assetRowToDomain({
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
    });
    const payload = assetToPayload(domain);
    const again = assetRowToDomain({
      id: row.id,
      entityId: row.entityId,
      type: row.type,
      name: row.name,
      payload,
    });
    expect(again.valuation.amount.amount).toBe(domain.valuation.amount.amount);
    expect(again.type).toBe(row.type);
  });
});
