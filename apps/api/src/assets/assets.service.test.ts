import { describe, expect, it } from "vitest";
import {
  SILVA_FO_ENTITY_HOLDING_ID,
  SILVA_FO_ENTITY_SPE_ID,
  SILVA_FO_TENANT_ID,
} from "@altora/domain";

import { AuditService } from "../audit/audit.service";
import { InMemoryAuditLogRepository } from "../audit/audit.repository";
import { InMemoryPortfolioRepository } from "../portfolio/portfolio.repository";
import { PortfolioService } from "../portfolio/portfolio.service";
import { InMemoryAssetRepository } from "./asset.repository";
import { AssetsService } from "./assets.service";

function buildService() {
  const auditRepo = new InMemoryAuditLogRepository();
  const audit = new AuditService(auditRepo);
  const assets = new InMemoryAssetRepository();
  const portfolios = new InMemoryPortfolioRepository(assets);
  const portfolioService = new PortfolioService(portfolios);
  const service = new AssetsService(assets, audit);
  return { service, audit, portfolioService };
}

describe("AssetsService", () => {
  it("cria imóvel com validação Zod e audit log", async () => {
    const { service, audit } = buildService();
    const before = await audit.listForTenant(SILVA_FO_TENANT_ID);

    const created = await service.create(
      SILVA_FO_TENANT_ID,
      "user_test",
      {
        type: "imovel",
        entityId: SILVA_FO_ENTITY_SPE_ID,
        name: "Galpão Guarulhos",
        region: "SP",
        valuationAmount: 2_000_000,
        valuationAsOf: "2025-05-01",
        valuationSource: "Laudo XYZ",
        monthlyIncomeAmount: 15_000,
        vacancyRate: 0.08,
        liquidityDays: 90,
      },
    );

    expect(created.type).toBe("imovel");
    expect(created.name).toBe("Galpão Guarulhos");

    const listed = await service.list(SILVA_FO_TENANT_ID);
    expect(listed.some((a) => a.id === created.id)).toBe(true);

    const events = await audit.listForTenant(SILVA_FO_TENANT_ID);
    expect(events.length).toBe(before.length + 1);
    expect(events.at(-1)?.action).toBe("asset.create");
    expect(events.at(-1)?.resourceId).toBe(created.id);
  });

  it("cria FII mínimo", async () => {
    const { service } = buildService();
    const created = await service.create(SILVA_FO_TENANT_ID, "user_test", {
      type: "fii",
      entityId: SILVA_FO_ENTITY_HOLDING_ID,
      name: "XPML11",
      region: "SP",
      issuer: "XP",
      valuationAmount: 180_000,
      valuationAsOf: "2025-07-01",
      valuationSource: "B3",
      monthlyIncomeAmount: 1_200,
    });
    expect(created.type).toBe("fii");
    expect(created.issuer).toBe("XP");
  });

  it("rejeita entityId de outro tenant", async () => {
    const { service } = buildService();
    await expect(
      service.create(SILVA_FO_TENANT_ID, "user_test", {
        type: "fii",
        entityId: "d9999999-9999-4999-8999-999999999999",
        name: "Bad",
        region: "SP",
        issuer: "X",
        valuationAmount: 100_000,
        valuationAsOf: "2025-01-01",
        valuationSource: "B3",
        monthlyIncomeAmount: 1_000,
      }),
    ).rejects.toThrow(/entityId/i);
  });

  it("novo ativo aparece no portfolio consolidado (fonte compartilhada)", async () => {
    const { service, portfolioService } = buildService();
    const before = await portfolioService.getConsolidated(SILVA_FO_TENANT_ID);
    const created = await service.create(SILVA_FO_TENANT_ID, "user_test", {
      type: "fii",
      entityId: SILVA_FO_ENTITY_HOLDING_ID,
      name: "Sync FII",
      region: "SP",
      issuer: "Sync",
      valuationAmount: 50_000,
      valuationAsOf: "2025-07-01",
      valuationSource: "B3",
      monthlyIncomeAmount: 500,
    });
    const after = await portfolioService.getConsolidated(SILVA_FO_TENANT_ID);
    expect(after.assetCount).toBe(before.assetCount + 1);
    expect(after.netWorth.amount).toBeGreaterThan(before.netWorth.amount);
    expect(created.name).toBe("Sync FII");
  });
});
