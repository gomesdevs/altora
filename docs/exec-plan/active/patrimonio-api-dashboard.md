# Feature: Patrimônio API + Dashboard

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-002](../adr/002-multi-tenant-row-level-security.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Expor consolidação patrimonial do tenant via API NestJS e exibir KPIs no dashboard Next.js, usando o portfólio canônico Silva FO.

## Contexto

Domínio e golden fixtures estão prontos. Falta a primeira fatia vertical: dados → API multi-tenant → UI de portfólio (sem what-if no front).

## Escopo

### Incluído

- [ ] Seed `@altora/db` alinhado a `docs/domain/harness/fixtures/_base/portfolio-silva-fo.json`
- [ ] NestJS: `TenantGuard` + `GET /portfolio/consolidated` com métricas via `@altora/domain`
- [ ] Next.js: `/dashboard` com PL, yield e alocação por classe via TanStack Query
- [ ] Testes da API (serviço/guard) sem exigir Postgres no CI

### Fora de escopo

- Auth real (JWT/Clerk) — header `x-tenant-id` como stub de desenvolvimento
- What-if / simulação no frontend
- shadcn completo / design system polido
- Mutations de ativos

## Critérios de aceite

- [ ] Seed idempotente cria tenant Silva FO com 2 entidades, 4 ativos e caixa R$200k
- [ ] `GET /portfolio/consolidated` exige `x-tenant-id` e filtra só dados desse tenant
- [ ] Response inclui `netWorth`, `yield`, `concentration.byClass` calculados em `@altora/domain`
- [ ] `/dashboard` consome a API via TanStack Query (sem calcular yield/concentração no client)
- [ ] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db/src/seed*.ts`, schema/migrate se necessário |
| API | `apps/api/src/portfolio/**`, tenant guard |
| Web | `apps/web/src/app/dashboard/**`, providers Query |

## Regras de domínio

- `tenant_id` em toda operação de dados (ADR-002)
- Cálculos patrimoniais só em `@altora/domain`
- Frontend não simula cenários what-if

## Definition of Done

- [ ] Código implementado conforme critérios de aceite
- [ ] Testes passam (`pnpm test`)
- [ ] Types compartilhados em `packages/domain`
- [ ] Spec movida para `completed/`

## Notas de implementação

- Tenant de desenvolvimento com UUID estável para seed + header demos
- Repositório em memória na API para testes CI (mesmo dataset do seed)
