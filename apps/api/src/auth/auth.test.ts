import { describe, expect, it } from "vitest";
import { SILVA_FO_TENANT_ID } from "@altora/domain";

import { parseSessionClaims, signDevSession, verifySessionToken } from "./index";

describe("auth session claims", () => {
  it("parseSessionClaims exige tenant_id UUID", () => {
    expect(() =>
      parseSessionClaims({ sub: "u1", tenant_id: "not-a-uuid" }),
    ).toThrow(/tenant_id/);
    expect(
      parseSessionClaims({
        sub: "u1",
        tenant_id: SILVA_FO_TENANT_ID,
      }).tenant_id,
    ).toBe(SILVA_FO_TENANT_ID);
  });

  it("sign + verify roundtrip em AUTH_MODE=dev", async () => {
    process.env.AUTH_MODE = "dev";
    process.env.AUTH_DEV_SECRET = "claims-test-secret";
    const token = await signDevSession({
      sub: "user_claims",
      tenantId: SILVA_FO_TENANT_ID,
    });
    const claims = await verifySessionToken(token);
    expect(claims.sub).toBe("user_claims");
    expect(claims.tenant_id).toBe(SILVA_FO_TENANT_ID);
  });
});
