import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { SILVA_FO_TENANT_ID } from "@altora/domain";

import { AppModule } from "../app.module";
import { signDevSession } from "../auth";

describe("e2e POST /scenarios/simulate", () => {
  let app: INestApplication;
  let baseUrl: string;
  let bearer: string;

  beforeAll(async () => {
    process.env.AUTH_MODE = "dev";
    process.env.AUTH_DEV_SECRET = "e2e-secret";
    bearer = await signDevSession({
      sub: "user_e2e",
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

  it("simula, persiste e recupera no mesmo tenant", async () => {
    const simulateRes = await fetch(`${baseUrl}/scenarios/simulate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({
        name: "e2e vacancia",
        premises: { vacancia_percentual: 15 },
      }),
    });

    if (simulateRes.status !== 201 && simulateRes.status !== 200) {
      const errBody = await simulateRes.text();
      throw new Error(`simulate failed ${simulateRes.status}: ${errBody}`);
    }
    expect([200, 201]).toContain(simulateRes.status);
    const body = (await simulateRes.json()) as {
      id: string;
      invariants: { "INV-05": boolean; "INV-06": boolean };
      result: { confidence?: string; disclaimer: string };
    };

    expect(body.invariants["INV-05"]).toBe(true);
    expect(body.invariants["INV-06"]).toBe(true);
    expect(body.result.disclaimer.length).toBeGreaterThan(10);

    const getRes = await fetch(`${baseUrl}/scenarios/${body.id}`, {
      headers: { authorization: `Bearer ${bearer}` },
    });
    expect(getRes.status).toBe(200);
    const loaded = (await getRes.json()) as { id: string };
    expect(loaded.id).toBe(body.id);
  });

  it("rejeita sem Authorization Bearer", async () => {
    const res = await fetch(`${baseUrl}/scenarios/simulate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ premises: {} }),
    });
    expect(res.status).toBe(401);
  });
});
