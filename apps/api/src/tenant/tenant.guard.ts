import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

import {
  extractBearerToken,
  verifySessionToken,
  type SessionClaims,
} from "../auth";

/** @deprecated Preferir Authorization Bearer (ADR-005). Mantido só para mensagens de migração. */
export const TENANT_HEADER = "x-tenant-id";

type TenantRequest = Request & {
  tenantId?: string;
  auth?: SessionClaims;
};

@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const token = extractBearerToken(request.header("authorization"));
    if (!token) {
      throw new UnauthorizedException(
        "Missing Authorization Bearer session token",
      );
    }

    try {
      const claims = await verifySessionToken(token);
      request.tenantId = claims.tenant_id;
      request.auth = claims;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    if (!request.tenantId) {
      throw new UnauthorizedException("tenant not resolved");
    }
    return request.tenantId;
  },
);

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    const sub = request.auth?.sub;
    if (!sub) {
      throw new UnauthorizedException("actor not resolved");
    }
    return sub;
  },
);
