import { describe, expect, it } from "vitest";
import { SILVA_FO_TENANT_ID } from "@altora/domain";

import { InMemoryPortfolioRepository } from "../portfolio/portfolio.repository";
import { InMemoryScenarioRepository } from "./scenario.repository";
import { ScenariosService } from "./scenarios.service";

describe("ScenariosService.simulate", () => {
  const service = new ScenariosService(
    new InMemoryPortfolioRepository(),
    new InMemoryScenarioRepository(),
  );

  it("persiste resultado e respeita INV-05/06 (capital call → low)", async () => {
    const response = await service.simulate(SILVA_FO_TENANT_ID, {
      name: "capital call PE",
      premises: {
        capital_call: { amount: 150_000, currency: "BRL" },
      },
    });

    expect(response.invariants["INV-05"]).toBe(true);
    expect(response.invariants["INV-06"]).toBe(true);
    expect(response.result.confidence).toBe("low");
    expect(response.result.yield.after).toMatchObject({ confidence: "low" });
    expect(response.result.disclaimer.toLowerCase()).toMatch(/hipotétic|modelagem/);

    const loaded = await service.getById(SILVA_FO_TENANT_ID, response.id);
    expect(loaded.result.cashFlow["30d"].amount).toBe(
      response.result.cashFlow["30d"].amount,
    );
  });

  it("isolamento de tenant na leitura", async () => {
    const created = await service.simulate(SILVA_FO_TENANT_ID, {
      premises: { vacancia_percentual: 15 },
    });
    await expect(
      service.getById("d9999999-9999-4999-8999-999999999999", created.id),
    ).rejects.toThrow(/not found/i);
  });
});
