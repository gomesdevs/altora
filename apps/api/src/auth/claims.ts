/**
 * Claims de sessão JWT (ADR-005).
 * Validação sem Zod para não acoplar o guard a deps extras no bootstrap.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SessionClaims = {
  sub: string;
  tenant_id: string;
  org_id?: string;
};

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function parseSessionClaims(input: {
  sub?: unknown;
  tenant_id?: unknown;
  org_id?: unknown;
}): SessionClaims {
  if (typeof input.sub !== "string" || input.sub.length === 0) {
    throw new Error("Invalid session claims: missing sub");
  }
  if (typeof input.tenant_id !== "string" || !isUuid(input.tenant_id)) {
    throw new Error("Invalid session claims: tenant_id must be UUID");
  }
  return {
    sub: input.sub,
    tenant_id: input.tenant_id,
    org_id: typeof input.org_id === "string" ? input.org_id : undefined,
  };
}
