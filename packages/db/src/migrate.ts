/**
 * Migração idempotente mínima (bootstrap).
 * Em produção preferir drizzle-kit migrate + SQL versionado.
 */
import postgres from "postgres";

const url =
  process.env.DATABASE_URL ??
  "postgresql://altora:altora@localhost:5432/altora";

async function main() {
  const sql = postgres(url, { max: 1 });

  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS entities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id),
      name text NOT NULL,
      type text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS entities_tenant_id_idx ON entities (tenant_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id),
      entity_id uuid NOT NULL REFERENCES entities(id),
      type text NOT NULL,
      name text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS assets_tenant_id_idx ON assets (tenant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS assets_entity_id_idx ON assets (entity_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_cash (
      tenant_id uuid PRIMARY KEY REFERENCES tenants(id),
      cash jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id),
      actor_id text NOT NULL,
      action text NOT NULL,
      resource_type text NOT NULL,
      resource_id text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS audit_logs_tenant_id_idx ON audit_logs (tenant_id)`;

  // RLS — rede de segurança (ADR-002)
  for (const table of [
    "entities",
    "assets",
    "portfolio_cash",
    "audit_logs",
  ] as const) {
    await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    await sql.unsafe(`DROP POLICY IF EXISTS tenant_isolation ON ${table}`);
    await sql.unsafe(`
      CREATE POLICY tenant_isolation ON ${table}
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    `);
  }

  await sql.end();
  console.log("db:migrate ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
