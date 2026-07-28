# apps/api — Instruções para agentes

NestJS. Cérebro da aplicação: ativos, entidades, permissões, orquestração what-if.

## Responsabilidades

- Autenticação, MFA, convites, roles (RBAC)
- CRUD patrimonial com `tenant_id` em toda operação
- Orquestrar snapshot → motor what-if → persistir resultado
- Enfileirar jobs no worker (import, relatórios, sync)
- Audit log em toda mutação

## Fazer

```typescript
// ✅ Guard + tenant do JWT (Authorization Bearer)
@UseGuards(TenantGuard, RolesGuard)
@Get('assets')
findAll(@CurrentTenant() tenantId: string) {
  return this.assetService.findByTenant(tenantId);
}
```

```typescript
// ❌ Não confiar em x-tenant-id — tenant vem do JWT (ADR-005)
```

Auth: ver [ADR-005](../../docs/adr/005-auth-clerk.md). Modo `dev` = HS256; modo `clerk` = JWKS.
```typescript
// ✅ Delegar regras para packages/domain
import { calculatePortfolioMetrics } from '@altora/domain';
```

## Não fazer

```typescript
// ❌ Query sem tenant_id
return this.prisma.asset.findMany();

// ✅ Sempre filtrar
return this.prisma.asset.findMany({ where: { tenantId } });
```

```typescript
// ❌ Lógica de simulação no controller
const result = runSimulation(snapshot, premises);

// ✅ Orquestrar serviço what-if dedicado
const result = await this.whatIfClient.simulate(snapshotId, premises);
```

## Padrões

- Controllers finos; lógica em services
- DTOs com Zod/class-validator alinhados a `packages/domain`
- Erros tipados; nunca vazar dados de outro tenant em mensagens de erro

## Referências

- [AGENTS.md raiz](../../AGENTS.md)
- [ADR-002 Multi-tenant](../../docs/adr/002-multi-tenant-row-level-security.md)
- [ADR-003 What-If Snapshot](../../docs/adr/003-what-if-snapshot-architecture.md)
