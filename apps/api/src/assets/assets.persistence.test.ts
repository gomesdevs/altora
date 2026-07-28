import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  SILVA_FO_ENTITY_SPE_ID,
  SILVA_FO_TENANT_ID,
} from "@altora/domain";
import {
  createDb,
  DrizzleAssetRepository,
  DrizzlePortfolioRepository,
  SILVA_FO_ASSETS,
} from "@altora/db";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { AuditService } from "../audit/audit.service";
import { InMemoryAuditLogRepository } from "../audit/audit.repository";
import { PortfolioService } from "../portfolio/portfolio.service";
import type { InMemoryScenarioRepository } from "../scenarios/scenario.repository";
import { InMemoryScenarioRepository } from "../scenarios/scenario.repository";
import { ScenariosService } from "../scenarios/scenarios.service";
import { AssetsService } from "./assets.service";

const databaseUrl = process.env.DATABASE_URL?.trim();
const describePg = databaseUrl ? describe : describe.skip;

describePg("assets Postgres persistence", () => {
  let assetsService: AssetsService;
  let portfolioService: PortfolioService;
  let scenariosService: ScenariosService;
  let scenarioRepo: InMemoryScenarioRepository;

  beforeAll(async () => {
    const root = path.resolve(import.meta.dirname, "../../../..");
    execSync("pnpm --filter @altora/db migrate", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    });
    execSync("pnpm --filter @altora/db seed", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    });

    const db = createDb(databaseUrl!);
    const assetRepo = new DrizzleAssetRepository(db);
    const portfolioRepo = new DrizzlePortfolioRepository(db);
    const audit = new AuditService(new InMemoryAuditLogRepository());
    scenarioRepo = new InMemoryScenarioRepository();

    assetsService = new AssetsService(assetRepo, audit);
    portfolioService = new PortfolioService(portfolioRepo);
    scenariosService = new ScenariosService(portfolioRepo, scenarioRepo);
  });

  afterAll(() => {
    // postgres.js pool closes on process exit
  });

  it("seed Silva FO retorna 4 ativos", async () => {
    const listed = await assetsService.list(SILVA_FO_TENANT_ID);
    expect(listed.length).toBe(SILVA_FO_ASSETS.length);
  });

  it("POST persiste e portfolio + simulate refletem sem restart", async () => {
    const uniqueName = `Persist ${randomUUID().slice(0, 8)}`;
    const before = await portfolioService.getConsolidated(SILVA_FO_TENANT_ID);

    const created = await assetsService.create(
      SILVA_FO_TENANT_ID,
      "persist_test",
      {
        type: "imovel",
        entityId: SILVA_FO_ENTITY_SPE_ID,
        name: uniqueName,
        region: "SP",
        valuationAmount: 800_000,
        valuationAsOf: "2025-08-01",
        valuationSource: "Laudo persist",
        monthlyIncomeAmount: 6_000,
      },
    );

    const listed = await assetsService.list(SILVA_FO_TENANT_ID);
    expect(listed.some((a) => a.id === created.id)).toBe(true);

    const consolidated = await portfolioService.getConsolidated(
      SILVA_FO_TENANT_ID,
    );
    expect(consolidated.assetCount).toBe(before.assetCount + 1);
    expect(consolidated.netWorth.amount).toBeGreaterThan(
      before.netWorth.amount,
    );

    await scenariosService.simulate(SILVA_FO_TENANT_ID, {
      name: "post asset snapshot",
      premises: {},
    });
    const stored = await scenarioRepo.listByTenant(SILVA_FO_TENANT_ID);
    const last = stored.at(-1);
    expect(last?.snapshot.assets.length).toBe(consolidated.assetCount);
    expect(last?.result.disclaimer.length).toBeGreaterThan(10);
  });

  it("re-seed não remove ativo criado via POST", async () => {
    const userAssetId = randomUUID();
    const assetRepo = new DrizzleAssetRepository(createDb(databaseUrl!));
    await assetRepo.create(SILVA_FO_TENANT_ID, {
      id: userAssetId,
      entityId: SILVA_FO_ENTITY_SPE_ID,
      type: "fii",
      name: "User FII survives seed",
      region: "SP",
      issuer: "User",
      valuation: {
        amount: { amount: 100_000, currency: "BRL" },
        method: "market",
        asOf: "2025-08-01",
        source: "B3",
      },
      monthlyIncome: { amount: 800, currency: "BRL" },
      liquidityDays: 5,
    });

    const root = path.resolve(import.meta.dirname, "../../../..");
    execSync("pnpm --filter @altora/db seed", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    });

    const listed = await assetsService.list(SILVA_FO_TENANT_ID);
    expect(listed.some((a) => a.id === userAssetId)).toBe(true);
  });
});
