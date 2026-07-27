# packages/db — Instruções para agentes

Schema, migrations, seeds e acesso a dados. PostgreSQL com Prisma ou Drizzle.

## Regras

- **Todo registro patrimonial tem `tenant_id`** (NOT NULL, indexado)
- **Row-Level Security (RLS)** habilitado em tabelas sensíveis
- Migrations versionadas e reversíveis quando possível
- Audit log em tabela append-only

## Fazer

```sql
-- ✅ RLS como rede de segurança
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

```typescript
// ✅ Repository sempre recebe tenantId
findAssets(tenantId: string): Promise<Asset[]>
```

## Não fazer

```typescript
// ❌ Query global sem tenant
prisma.asset.findMany()

// ❌ Soft-delete sem audit
await prisma.asset.delete({ where: { id } })
```

## Schema (conceitual)

```
Tenant → Entity → Asset, Document, Scenario
Tenant → User, Role, AuditLog
```

## Seeds

- Dados fictícios para dev (family office exemplo)
- Nunca dados reais de clientes
- Seed idempotente (`pnpm db:seed` pode rodar múltiplas vezes)

## Referências

- [ADR-002 Multi-tenant](../../docs/adr/002-multi-tenant-row-level-security.md)
- [docs/06-stack-arquitetura.md](../../docs/06-stack-arquitetura.md#multi-tenant)
