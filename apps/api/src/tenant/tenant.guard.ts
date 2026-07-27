import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

export const TENANT_HEADER = "x-tenant-id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TenantRequest = Request & { tenantId?: string };

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const raw = request.header(TENANT_HEADER);
    if (!raw || !UUID_RE.test(raw)) {
      throw new UnauthorizedException(
        `Missing or invalid ${TENANT_HEADER} header`,
      );
    }
    request.tenantId = raw;
    return true;
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
