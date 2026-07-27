import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  PremisesSchema,
  aggregatePortfolio,
  createSnapshot,
  simulate,
  type Premises,
  type SimulationResult,
  type Snapshot,
} from "@altora/domain";
import { randomUUID } from "node:crypto";

import { PORTFOLIO_REPOSITORY, SCENARIO_REPOSITORY } from "../tokens";
import type { PortfolioRepository } from "../portfolio/portfolio.repository";
import type {
  ScenarioRepository,
  StoredScenario,
} from "./scenario.repository";

export type SimulateScenarioInput = {
  premises?: unknown;
  name?: string;
};

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

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function assertInv05(before: Snapshot, after: Snapshot): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}

function assertInv06(result: SimulationResult): boolean {
  if (result.disclaimer.length < 10) return false;
  if (
    !/hipotétic|modelagem|não constitui recomendação/i.test(result.disclaimer)
  ) {
    return false;
  }
  if (result.confidence !== "low") return true;
  const after = result.yield.after;
  return (
    typeof after === "object" &&
    after !== null &&
    "min" in after &&
    "max" in after &&
    after.confidence === "low"
  );
}

@Injectable()
export class ScenariosService {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolios: PortfolioRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarios: ScenarioRepository,
  ) {}

  async simulate(
    tenantId: string,
    input: SimulateScenarioInput,
  ): Promise<SimulateScenarioResponse> {
    const parsed = PremisesSchema.safeParse(input.premises ?? {});
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid premises",
        issues: parsed.error.issues,
      });
    }
    const premises = parsed.data;

    const record = await this.portfolios.findByTenant(tenantId);
    if (!record) {
      throw new NotFoundException("Portfolio not found for tenant");
    }

    const portfolio = aggregatePortfolio(record.assets, record.cash);
    const snapshot = createSnapshot(portfolio, {
      id: `snap-${randomUUID()}`,
      tenantId,
      version: 1,
      entities: record.entities,
      capturedAt: new Date().toISOString(),
    });

    const snapshotBefore = deepClone(snapshot);
    const result = simulate(snapshot, { premises });
    const inv05 = assertInv05(snapshotBefore, snapshot);
    if (!inv05) {
      throw new UnprocessableEntityException(
        "INV-05 violated: snapshot mutated during simulate",
      );
    }

    const inv06 = assertInv06(result);
    if (!inv06) {
      throw new UnprocessableEntityException(
        "INV-06 violated: low-confidence result must use yield range + disclaimer",
      );
    }

    const stored: StoredScenario = {
      id: randomUUID(),
      tenantId,
      name: input.name?.trim() || `cenário ${new Date().toISOString()}`,
      snapshotId: snapshot.id,
      snapshotVersion: snapshot.version,
      snapshot: deepClone(snapshot),
      premises,
      result,
      createdAt: new Date().toISOString(),
    };
    await this.scenarios.save(stored);

    return {
      id: stored.id,
      tenantId,
      name: stored.name,
      snapshot: {
        id: snapshot.id,
        version: snapshot.version,
        capturedAt: snapshot.capturedAt,
      },
      premises,
      result,
      invariants: {
        "INV-05": inv05,
        "INV-06": inv06,
      },
      createdAt: stored.createdAt,
    };
  }

  async getById(
    tenantId: string,
    scenarioId: string,
  ): Promise<SimulateScenarioResponse> {
    const stored = await this.scenarios.findById(tenantId, scenarioId);
    if (!stored) {
      throw new NotFoundException("Scenario not found for tenant");
    }
    return {
      id: stored.id,
      tenantId: stored.tenantId,
      name: stored.name,
      snapshot: {
        id: stored.snapshotId,
        version: stored.snapshotVersion,
        capturedAt: stored.snapshot.capturedAt,
      },
      premises: stored.premises,
      result: stored.result,
      invariants: {
        "INV-05": true,
        "INV-06": assertInv06(stored.result),
      },
      createdAt: stored.createdAt,
    };
  }
}
