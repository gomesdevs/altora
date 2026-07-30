import { beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  DrizzleAssetRepository,
  DrizzleAuditLogRepository,
  DrizzlePortfolioRepository,
  DrizzleScenarioRepository,
} from "@altora/db";
import {
  SILVA_FO_ENTITY_SPE_ID,
  SILVA_FO_TENANT_ID,
} from "@altora/domain";
import { execSync } from "node:child_process";
import path from "node:path";

import { AuditService } from "../audit/audit.service";
import { AssetsService } from "../assets/assets.service";
import { ScenariosService } from "./scenarios.service";

const databaseUrl = process.env.DATABASE_URL?.trim();
const describePg = databaseUrl ? describe : describe.skip;

describePg("scenarios + audit Postgres persistence", () => {
  let scenariosService: ScenariosService;
  let assetsService: AssetsService;
  let audit: AuditService;
  let databaseUrlLocal: string;

  beforeAll(() => {
    databaseUrlLocal = databaseUrl!;
    const root = path.resolve(import.meta.dirname, "../../../..");
    execSync("pnpm --filter @altora/db migrate", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrlLocal },
      stdio: "pipe",
    });
    execSync("pnpm --filter @altora/db seed", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrlLocal },
      stdio: "pipe",
    });

    const db = createDb(databaseUrlLocal);
    scenariosService = new ScenariosService(
      new DrizzlePortfolioRepository(db),
      new DrizzleScenarioRepository(db),
    );
    audit = new AuditService(new DrizzleAuditLogRepository(db));
    assetsService = new AssetsService(
      new DrizzleAssetRepository(db),
      audit,
    );
  });

  it("simulate persiste e sobrevive a novo client (restart)", async () => {
    const created = await scenariosService.simulate(SILVA_FO_TENANT_ID, {
      name: `persist-${Date.now()}`,
      premises: { vacancia_percentual: 12 },
    });

    // Novo client = "restart" da API
    const fresh = new ScenariosService(
      new DrizzlePortfolioRepository(createDb(databaseUrlLocal)),
      new DrizzleScenarioRepository(createDb(databaseUrlLocal)),
    );

    const loaded = await fresh.getById(SILVA_FO_TENANT_ID, created.id);
    expect(loaded.name).toBe(created.name);
    expect(loaded.result.disclaimer.length).toBeGreaterThan(10);

    const listed = await fresh.list(SILVA_FO_TENANT_ID);
    expect(listed.some((s) => s.id === created.id)).toBe(true);
  });

  it("POST /assets grava audit_logs persistido", async () => {
    const before = await audit.listForTenant(SILVA_FO_TENANT_ID);

    const created = await assetsService.create(
      SILVA_FO_TENANT_ID,
      "audit_persist",
      {
        type: "imovel",
        entityId: SILVA_FO_ENTITY_SPE_ID,
        name: `Audit imóvel ${Date.now()}`,
        region: "SP",
        valuationAmount: 750_000,
        valuationAsOf: "2025-09-01",
        valuationSource: "Laudo audit",
        monthlyIncomeAmount: 5_000,
      },
    );

    const freshAudit = new AuditService(
      new DrizzleAuditLogRepository(createDb(databaseUrlLocal)),
    );
    const events = await freshAudit.listForTenant(SILVA_FO_TENANT_ID);
    expect(events.length).toBeGreaterThan(before.length);
    expect(
      events.some(
        (e) => e.action === "asset.create" && e.resourceId === created.id,
      ),
    ).toBe(true);
  });
});
