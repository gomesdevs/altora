# Feature: Scenarios + audit Postgres persistence (Drizzle)

**Status:** active  
**Criado em:** 2026-07-30  
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

- [ ] `DrizzleScenarioRepository` — `save`, `findById`, `listByTenant` com `withTenant`
- [ ] Persistência: insert em `scenarios` + `simulation_results` no mesmo fluxo de `save`
- [ ] `DrizzleAuditLogRepository` — `append` / `listByTenant` (append-only)
- [ ] Extender `PatrimonioPersistenceModule`: wire `SCENARIO_REPOSITORY` + `AUDIT_LOG_REPOSITORY` quando `DATABASE_URL`; in-memory no CI
- [ ] Remover providers in-memory hard-coded de `ScenariosModule` / `AuditModule` (consumir tokens do módulo global)
- [ ] Mappers: `StoredScenario` ↔ rows Drizzle; `SimulationResult` / `Premises` / `Snapshot` via schemas Zod de `@altora/domain`
- [ ] Testes unitários in-memory; integração Postgres quando `DATABASE_URL`; e2e simulate/list/compare verdes
- [ ] Smoke: simulate → restart API → `GET /scenarios` e compare ainda listam o cenário; `asset.create` gera row em `audit_logs`

### Fora de escopo

- DELETE/UPDATE de cenários
- UI de audit log / export
- Persistência de snapshots como tabela própria (continuam jsonb em `scenarios.snapshot`)
- Migração drizzle-kit versionada
- RBAC por cenário

## Critérios de aceite

- [ ] Toda query/mutation em `scenarios`, `simulation_results`, `audit_logs` filtra por `tenant_id` (JWT + coluna + RLS via `withTenant`)
- [ ] Com Postgres: `POST /scenarios/simulate` grava rows; `GET /scenarios` e `GET /scenarios/:id` leem do DB
- [ ] Compare UI (`/what-if/compare`) lista cenários persistidos após restart da API
- [ ] `POST /assets` grava evento em `audit_logs` (não só in-memory)
- [ ] Audit append-only: sem UPDATE/DELETE de logs na aplicação
- [ ] CI sem `DATABASE_URL`: `pnpm test` verde com fallback in-memory
- [ ] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db/src/repositories/scenario.repository.ts`, `audit.repository.ts`, mappers, `index.ts` |
| API | `patrimonio-persistence.module.ts`, `scenarios/**`, `audit/**`, tokens |
| Web | sem mudança (já consome API) |

## Regras de domínio

- `tenant_id` em toda operação (ADR-002)
- What-if via snapshot imutável (ADR-003 / INV-05) — snapshot jsonb não é mutado após save
- Audit append-only em mutações patrimoniais
- Sem precisão falsa nos resultados persistidos (INV-06) — validar `SimulationResult` na leitura

## Plano de commits (atômicos, sem push)

1. `feat(db): add Drizzle scenario and audit repositories`
2. `feat(api): wire scenario and audit Postgres with in-memory fallback`
3. `test(api): cover scenario/audit persistence across restart`
4. `docs(exec-plan): complete scenarios audit postgres spec`

## Definition of Done

- [ ] Critérios de aceite verificados
- [ ] Testes passam
- [ ] Spec em `completed/`

## Notas de implementação

- Reutilizar `withTenant` de `@altora/db`
- `save(StoredScenario)`: transaction — insert `scenarios` + insert `simulation_results` ligado por `scenario_id`
- `findById` / `listByTenant`: join ou duas queries; montar `StoredScenario` completo
- `AuditModule` deixa de providenciar `InMemoryAuditLogRepository` quando Postgres ativo — só `AuditService` + token injetado
- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- Env: `DATABASE_URL` (mesmo padrão assets)

## Smoke manual

```bash
docker compose up -d postgres
pnpm db:migrate && pnpm db:seed
pnpm --filter api dev
# POST /scenarios/simulate → reiniciar API → GET /scenarios ainda lista
# POST /assets → SELECT * FROM audit_logs WHERE action = 'asset.create'
# /what-if/compare lista cenários persistidos
```
