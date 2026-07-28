import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import {
  SILVA_FO_ENTITY_SPE_ID,
  SILVA_FO_TENANT_ID,
} from "@altora/domain";

import { AppModule } from "../app.module";
import { signDevSession } from "../auth";

describe("e2e assets API", () => {
  let app: INestApplication;
  let baseUrl: string;
  let bearer: string;

  beforeAll(async () => {
    process.env.AUTH_MODE = "dev";
    process.env.AUTH_DEV_SECRET = "e2e-assets-secret";
    bearer = await signDevSession({
      sub: "user_assets_e2e",
      tenantId: SILVA_FO_TENANT_ID,
    });

    app = await NestFactory.create(AppModule, {
      logger: ["error", "warn"],
    });
    await app.listen(0);
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("failed to bind test server");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /assets lista com Bearer", async () => {
    const res = await fetch(`${baseUrl}/assets`, {
      headers: { authorization: `Bearer ${bearer}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string; type: string }>;
    expect(body.length).toBeGreaterThan(0);
  });

  it("POST /assets cria imóvel", async () => {
    const res = await fetch(`${baseUrl}/assets`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({
        type: "imovel",
        entityId: SILVA_FO_ENTITY_SPE_ID,
        name: "E2E Imóvel",
        region: "SP",
        valuationAmount: 1_100_000,
        valuationAsOf: "2025-06-15",
        valuationSource: "Laudo E2E",
        monthlyIncomeAmount: 9_000,
      }),
    });
    expect([200, 201]).toContain(res.status);
    const body = (await res.json()) as { id: string; type: string; name: string };
    expect(body.type).toBe("imovel");
    expect(body.name).toBe("E2E Imóvel");
  });

  it("rejeita sem Bearer", async () => {
    const res = await fetch(`${baseUrl}/assets`);
    expect(res.status).toBe(401);
  });
});
