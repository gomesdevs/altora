import { describe, expect, it } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { SILVA_FO_TENANT_ID } from "@altora/domain";

import { signDevSession } from "../auth";
import { TenantGuard } from "../tenant/tenant.guard";
import { PortfolioService } from "./portfolio.service";
import { InMemoryPortfolioRepository } from "./portfolio.repository";

function mockContext(headers: Record<string, string | undefined>) {
  const request = {
    header: (name: string) => headers[name.toLowerCase()],
    tenantId: undefined as string | undefined,
    auth: undefined as unknown,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
}

describe("TenantGuard (JWT session)", () => {
  const guard = new TenantGuard();

  it("rejeita ausência de Bearer", async () => {
    const ctx = mockContext({});
    await expect(guard.canActivate(ctx as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("ignora x-tenant-id sem Bearer", async () => {
    const ctx = mockContext({
      "x-tenant-id": SILVA_FO_TENANT_ID,
    });
    await expect(guard.canActivate(ctx as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("aceita JWT dev válido e anexa tenantId", async () => {
    process.env.AUTH_MODE = "dev";
    process.env.AUTH_DEV_SECRET = "test-secret";
    const token = await signDevSession({
      sub: "user_test",
      tenantId: SILVA_FO_TENANT_ID,
    });
    const ctx = mockContext({ authorization: `Bearer ${token}` });
    await expect(guard.canActivate(ctx as never)).resolves.toBe(true);
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
