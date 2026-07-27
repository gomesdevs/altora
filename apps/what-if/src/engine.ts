import type { Premises, Snapshot, SimulationResult } from "@altora/domain";
import { PremisesSchema, SnapshotSchema, simulate } from "@altora/domain";

/**
 * Entrada do motor: snapshot imutável + premissas do cenário.
 * Regras patrimoniais vivem em @altora/domain — aqui só orquestração HTTP.
 */
export type SimulationInput = {
  snapshot: Snapshot;
  premises: Premises;
};

export function runSimulation(input: SimulationInput): SimulationResult {
  const snapshot = SnapshotSchema.parse(input.snapshot);
  const premises = PremisesSchema.parse(input.premises);
  return simulate(snapshot, { premises });
}
