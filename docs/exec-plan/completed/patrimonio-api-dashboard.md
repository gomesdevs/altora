# Feature: Patrimônio API + Dashboard

**Status:** completed  
**Criado em:** 2026-07-27  
**Concluído em:** 2026-07-27  
**ADR relacionados:** [ADR-002](../adr/002-multi-tenant-row-level-security.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Expor consolidação patrimonial do tenant via API NestJS e exibir KPIs no dashboard Next.js, usando o portfólio canônico Silva FO.

## Contexto

Domínio e golden fixtures estão prontos. Fatia vertical: dados → API multi-tenant → UI de portfólio (sem what-if no front).

## Escopo

### Incluído

- [x] Seed `@altora/db` alinhado ao portfólio Silva FO
- [x] NestJS: `TenantGuard` + `GET /portfolio/consolidated` com métricas via `@altora/domain`
- [x] Next.js: `/dashboard` com PL, yield e alocação por classe via TanStack Query
- [x] Testes da API (serviço/guard) sem exigir Postgres no CI

### Fora de escopo

- Auth real (JWT/Clerk) — header `x-tenant-id` como stub
- What-if / simulação no frontend
- shadcn completo
- Mutations de ativos

## Critérios de aceite

- [x] Seed idempotente cria tenant Silva FO com 2 entidades, 4 ativos e caixa R$200k
- [x] `GET /portfolio/consolidated` exige `x-tenant-id` e filtra só dados desse tenant
- [x] Response inclui `netWorth`, `yield`, `concentration.byClass` via `@altora/domain`
- [x] `/dashboard` consome a API via TanStack Query (sem calcular yield/concentração no client)
- [x] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| Domain | `packages/domain/src/fixtures/silva-fo.ts` |
| DB | seed + `portfolio_cash` |
| API | `apps/api/src/portfolio/**`, `tenant/tenant.guard.ts` |
| Web | `apps/web/src/app/dashboard/**`, providers Query |

## Notas de implementação

- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- API usa `InMemoryPortfolioRepository` (mesmo dataset do seed) para CI/dev sem Postgres
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TENANT_ID`, `WEB_ORIGIN`
