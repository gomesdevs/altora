# Feature: Scenarios + audit Postgres persistence (Drizzle)

**Status:** completed  
**Criado em:** 2026-07-30  
**Concluído em:** 2026-07-30  
**ADR relacionados:** [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-003](../../adr/003-what-if-via-snapshot.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Persistir `scenarios`, `simulation_results` e `audit_logs` via Drizzle em `@altora/db` (com `tenant_id` + RLS), para que simulate/compare e mutações patrimoniais sobrevivam a restart da API — mantendo fallback in-memory no CI.

## Contexto

- Tabelas e RLS já existem em `packages/db` (`schema.ts` / `migrate.ts`).
- Assets/portfolio já usam Drizzle via `PatrimonioPersistenceModule` ([assets-postgres-persistence](../completed/assets-postgres-persistence.md)).
- `InMemoryScenarioRepository` e `InMemoryAuditLogRepository` ainda alimentam `POST /scenarios/simulate`, `GET /scenarios`, compare UI e `asset.create` audit — dados somem no restart.
- Schema DB separa cenário (snapshot + premises) de `simulation_results` (resultado); o in-memory atual guarda tudo em um `StoredScenario` — mapear 1:1 ou join na leitura.

## Escopo

### Incluído

- [x] `DrizzleScenarioRepository` — `save`, `findById`, `listByTenant` com `withTenant`
- [x] Persistência: insert em `scenarios` + `simulation_results` no mesmo fluxo de `save`
- [x] `DrizzleAuditLogRepository` — `append` / `listByTenant` (append-only)
- [x] Extender `PatrimonioPersistenceModule`: wire `SCENARIO_REPOSITORY` + `AUDIT_LOG_REPOSITORY` quando `DATABASE_URL`; in-memory no CI
- [x] Remover providers in-memory hard-coded de `ScenariosModule` / `AuditModule` (consumir tokens do módulo global)
- [x] Mappers: `StoredScenario` ↔ rows Drizzle; `SimulationResult` / `Premises` / `Snapshot` via schemas Zod de `@altora/domain`
- [x] Testes unitários in-memory; integração Postgres quando `DATABASE_URL`; e2e simulate/list/compare verdes
- [x] Smoke: simulate → restart API → `GET /scenarios` e compare ainda listam o cenário; `asset.create` gera row em `audit_logs`

### Fora de escopo

- DELETE/UPDATE de cenários
- UI de audit log / export
- Persistência de snapshots como tabela própria (continuam jsonb em `scenarios.snapshot`)
- Migração drizzle-kit versionada
- RBAC por cenário

## Critérios de aceite

- [x] Toda query/mutation em `scenarios`, `simulation_results`, `audit_logs` filtra por `tenant_id` (JWT + coluna + RLS via `withTenant`)
- [x] Com Postgres: `POST /scenarios/simulate` grava rows; `GET /scenarios` e `GET /scenarios/:id` leem do DB
- [x] Compare UI (`/what-if/compare`) lista cenários persistidos após restart da API
- [x] `POST /assets` grava evento em `audit_logs` (não só in-memory)
- [x] Audit append-only: sem UPDATE/DELETE de logs na aplicação
- [x] CI sem `DATABASE_URL`: `pnpm test` verde com fallback in-memory
- [x] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db/src/repositories/scenario.repository.ts`, `audit.repository.ts`, mappers, `index.ts` |
| API | `patrimonio-persistence.module.ts`, `scenarios/**`, `audit/**` |

## Regras de domínio

- `tenant_id` em toda operação (ADR-002)
- What-if via snapshot imutável (ADR-003 / INV-05) — snapshot jsonb não é mutado após save
- Audit append-only em mutações patrimoniais
- Sem precisão falsa nos resultados persistidos (INV-06) — validar `SimulationResult` na leitura

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Spec em `completed/`

## Notas de implementação

- `save(StoredScenario)`: transaction via `withTenant` — insert `scenarios` + `simulation_results`
- `findById` / `listByTenant`: inner join; Zod parse na leitura
- `AuditModule` / `ScenariosModule` só registram services; repos vêm do `PatrimonioPersistenceModule` global
- Env: `DATABASE_URL` habilita Postgres; omitir para CI in-memory
