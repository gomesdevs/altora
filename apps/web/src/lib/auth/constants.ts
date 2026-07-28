export const SESSION_COOKIE = "altora_session";
export const SESSION_STORAGE_KEY = "altora_access_token";

/** Tenant demo Silva FO — claim do JWT em AUTH_MODE=dev. */
export const DEV_TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID ??
  "a1111111-1111-4111-8111-111111111111";

export function getAuthMode(): "dev" | "clerk" {
  const mode = (process.env.AUTH_MODE ?? process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev").toLowerCase();
  return mode === "clerk" ? "clerk" : "dev";
}
