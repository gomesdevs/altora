import type { Premises, SimulationResult } from "@altora/domain";

import { API_URL, TENANT_ID } from "./portfolio-api";

export type SimulateScenarioResponse = {
  id: string;
  tenantId: string;
  name: string;
  snapshot: {
    id: string;
    version: number;
    capturedAt: string;
  };
  premises: Premises;
  result: SimulationResult;
  invariants: {
    "INV-05": boolean;
    "INV-06": boolean;
  };
  createdAt: string;
};

export type SimulateScenarioInput = {
  name?: string;
  premises?: Premises;
};

export async function simulateScenario(
  input: SimulateScenarioInput,
): Promise<SimulateScenarioResponse> {
  const res = await fetch(`${API_URL}/scenarios/simulate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": TENANT_ID,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao simular cenário (${res.status}): ${text}`);
  }

  return res.json() as Promise<SimulateScenarioResponse>;
}
