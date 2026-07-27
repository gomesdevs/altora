import { describe, expect, it } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { SILVA_FO_TENANT_ID } from "@altora/domain";

import { PortfolioService } from "./portfolio.service";
import { InMemoryPortfolioRepository } from "./portfolio.repository";
import { TenantGuard, TENANT_HEADER } from "../tenant/tenant.guard";

function mockContext(headers: Record<string, string | undefined>) {
  const request = {
    header: (name: string) => headers[name.toLowerCase()],
    tenantId: undefined as string | undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
}

describe("TenantGuard", () => {
  const guard = new TenantGuard();

  it("rejeita ausência de x-tenant-id", () => {
    const ctx = mockContext({});
    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException);
  });

  it("aceita UUID válido e anexa tenantId", () => {
    const ctx = mockContext({
      [TENANT_HEADER]: SILVA_FO_TENANT_ID,
    });
    expect(guard.canActivate(ctx as never)).toBe(true);
    expect(ctx.request.tenantId).toBe(SILVA_FO_TENANT_ID);
  });
});

describe("PortfolioService.getConsolidated", () => {
  const service = new PortfolioService(new InMemoryPortfolioRepository());

  it("consolida Silva FO com métricas de domínio", async () => {
    const result = await service.getConsolidated(SILVA_FO_TENANT_ID);
    expect(result.tenantId).toBe(SILVA_FO_TENANT_ID);
    expect(result.netWorth.amount).toBe(3_850_000);
    expect(result.yield).toBe(0.0456);
    expect(result.assetCount).toBe(4);
    expect(result.concentration.byClass.real_estate).toBeCloseTo(0.6623, 3);
    expect(result.concentration.byClass.private_equity).toBeCloseTo(0.2078, 3);
  });

  it("não vaza dados de outro tenant", async () => {
    await expect(
      service.getConsolidated("d9999999-9999-4999-8999-999999999999"),
    ).rejects.toThrow(/not found/i);
  });
});
