import { describe, expect, it } from "vitest";

import { DEV_TENANT_ID, getAuthMode } from "../../lib/auth/constants";
import { signDevAccessToken } from "../../lib/auth/sign-dev";

describe("auth client contract", () => {
  it("modo padrão é dev sem CLERK_*", () => {
    expect(getAuthMode()).toBe("dev");
    expect(DEV_TENANT_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("token dev carrega claim tenant_id (não x-tenant-id)", async () => {
    process.env.AUTH_DEV_SECRET = "web-auth-contract-secret";
    const token = await signDevAccessToken({
      sub: "user_contract",
      tenantId: DEV_TENANT_ID,
    });
    const [, payloadB64] = token.split(".");
    expect(payloadB64).toBeTruthy();
    const json = JSON.parse(
      Buffer.from(payloadB64!, "base64url").toString("utf8"),
    ) as { tenant_id?: string; sub?: string };
    expect(json.tenant_id).toBe(DEV_TENANT_ID);
    expect(json.sub).toBe("user_contract");
    expect(token.includes("x-tenant-id")).toBe(false);
  });
});
