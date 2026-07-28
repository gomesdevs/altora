import { SignJWT } from "jose";

import { DEV_TENANT_ID } from "./constants";

function getDevSecret(): Uint8Array {
  const secret =
    process.env.AUTH_DEV_SECRET ?? "altora-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

/** Mesmo formato da API (ADR-005) — AUTH_MODE=dev. */
export async function signDevAccessToken(input?: {
  sub?: string;
  tenantId?: string;
}): Promise<string> {
  const tenantId = input?.tenantId ?? DEV_TENANT_ID;
  const sub = input?.sub ?? "user_dev_silva";
  return new SignJWT({ tenant_id: tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getDevSecret());
}
