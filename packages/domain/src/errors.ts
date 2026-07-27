export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message?: string) {
    super(message ?? code);
    this.name = "DomainError";
    this.code = code;
  }
}

export type DomainErrorCode =
  | "INVALID_VALUATION"
  | "EMPTY_PORTFOLIO"
  | "INVALID_HORIZON"
  | "INVALID_PREMISES"
  | "TENANT_MISMATCH";
