import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Schema inicial multi-tenant.
 * Toda tabela patrimonial carrega tenantId (ADR-002).
 * RLS será aplicado nas migrations SQL.
 */

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const entities = pgTable(
  "entities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("entities_tenant_id_idx").on(table.tenantId)],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id),
    type: text("type").notNull(),
    name: text("name").notNull(),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("assets_tenant_id_idx").on(table.tenantId),
    index("assets_entity_id_idx").on(table.entityId),
  ],
);

/** Caixa consolidado por tenant (Money em jsonb). */
export const portfolioCash = pgTable("portfolio_cash", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id),
  cash: jsonb("cash").notNull().$type<{ amount: number; currency: "BRL" }>(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Cenário what-if: premissas + referência ao snapshot imutável. */
export const scenarios = pgTable(
  "scenarios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    snapshotId: text("snapshot_id").notNull(),
    snapshotVersion: integer("snapshot_version").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    premises: jsonb("premises").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("scenarios_tenant_id_idx").on(table.tenantId)],
);

/** Resultado persistido da simulação (append-oriented). */
export const simulationResults = pgTable(
  "simulation_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    scenarioId: uuid("scenario_id")
      .notNull()
      .references(() => scenarios.id),
    result: jsonb("result").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("simulation_results_tenant_id_idx").on(table.tenantId),
    index("simulation_results_scenario_id_idx").on(table.scenarioId),
  ],
);

/** Append-only — sem UPDATE/DELETE na aplicação. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("audit_logs_tenant_id_idx").on(table.tenantId)],
);
