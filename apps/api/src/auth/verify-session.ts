import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload } from "jose";

import { parseSessionClaims, type SessionClaims } from "./claims";

export type AuthMode = "dev" | "clerk";

export function getAuthMode(): AuthMode {
  const mode = (process.env.AUTH_MODE ?? "dev").toLowerCase();
  return mode === "clerk" ? "clerk" : "dev";
}

export function getDevSecret(): Uint8Array {
  const secret =
    process.env.AUTH_DEV_SECRET ?? "altora-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

function claimsFromPayload(payload: JWTPayload): SessionClaims {
  const tenantId =
    (typeof payload.tenant_id === "string" && payload.tenant_id) ||
    (typeof payload.publicMetadata === "object" &&
    payload.publicMetadata !== null &&
    "tenant_id" in payload.publicMetadata &&
    typeof (payload.publicMetadata as { tenant_id?: unknown }).tenant_id ===
      "string"
      ? (payload.publicMetadata as { tenant_id: string }).tenant_id
      : undefined);

  return parseSessionClaims({
    sub: payload.sub,
    tenant_id: tenantId,
    org_id: typeof payload.org_id === "string" ? payload.org_id : undefined,
  });
}

/** Emite JWT HS256 para AUTH_MODE=dev (login local / testes). */
export async function signDevSession(input: {
  sub: string;
  tenantId: string;
  expiresIn?: string;
}): Promise<string> {
  return new SignJWT({ tenant_id: input.tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.sub)
    .setIssuedAt()
    .setExpirationTime(input.expiresIn ?? "8h")
    .sign(getDevSecret());
}

async function verifyDevJwt(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, getDevSecret(), {
    algorithms: ["HS256"],
  });
  return claimsFromPayload(payload);
}

async function verifyClerkJwt(token: string): Promise<SessionClaims> {
  const jwksUrl =
    process.env.CLERK_JWKS_URL ??
    (process.env.CLERK_ISSUER
      ? `${process.env.CLERK_ISSUER.replace(/\/$/, "")}/.well-known/jwks.json`
      : undefined);

  if (!jwksUrl) {
    throw new Error(
      "AUTH_MODE=clerk requires CLERK_JWKS_URL or CLERK_ISSUER",
    );
  }

  const JWKS = createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(token, JWKS);
  return claimsFromPayload(payload);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims> {
  if (getAuthMode() === "clerk") {
    return verifyClerkJwt(token);
  }
  return verifyDevJwt(token);
}

export function extractBearerToken(
  authorizationHeader: string | undefined,
): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}
