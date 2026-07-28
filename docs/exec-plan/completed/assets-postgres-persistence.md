# Feature: Assets Postgres persistence (Drizzle)

**Status:** completed  
**Criado em:** 2026-07-28  
**Concluído em:** 2026-07-28  
**ADR relacionados:** [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Substituir `InMemoryAssetRepository` e `InMemoryPortfolioRepository` por repositórios Drizzle em `@altora/db`, com `tenant_id` e RLS — para que seed Silva FO e ativos criados via `POST /assets` persistam e alimentem dashboard e what-if pela mesma fonte.

## Contexto

- `@altora/db` já define tabelas `assets`, `entities`, `portfolio_cash` + RLS (`app.tenant_id`) em `migrate.ts`.
- Seed idempotente (`pnpm db:seed`) popula Silva FO; API ainda usa in-memory para portfolio e assets.
- Asset CRUD (`completed/asset-crud-wizard`) sincroniza manualmente `portfolio.assets.push` após POST — frágil e não persiste entre restarts.
- Dashboard (`GET /portfolio/consolidated`) e what-if (`POST /scenarios/simulate`) leem `PortfolioRepository` — devem ver os mesmos ativos que `GET /assets`.

## Escopo

### Incluído

- [x] `DrizzleAssetRepository` em `packages/db` — `listByTenant`, `create`, `listEntities`
- [x] `DrizzlePortfolioRepository` — `findByTenant` lê `assets` + `entities` + `portfolio_cash` do Postgres
- [x] Contexto de tenant na conexão: `SET LOCAL app.tenant_id` antes de queries patrimoniais (RLS)
- [x] `PatrimonioPersistenceModule` usa Drizzle quando `DATABASE_URL` presente; in-memory como fallback para CI sem Postgres
- [x] `POST /assets` persiste row em `assets`; removido sync manual em memória
- [x] Seed Silva FO: upsert canônico por `id` sem apagar ativos criados pelo usuário
- [x] Testes: unit in-memory; integração com Postgres quando `DATABASE_URL`; e2e verdes
- [x] Dashboard e what-if refletem ativo novo após POST (sem restart da API)

### Fora de escopo

- Persistência Drizzle de `scenarios`, `audit_logs` (continuam in-memory nesta fatia)
- PUT/DELETE de ativos
- Migração drizzle-kit versionada (manter `migrate.ts` idempotente por ora)
- Worker / jobs assíncronos
- Mudanças na UI web (já consome API)

## Critérios de aceite

- [x] Toda query/mutation em `assets` e `entities` filtra por `tenant_id` do JWT (guard + coluna + RLS)
- [x] Com Postgres: `pnpm db:migrate && pnpm db:seed` → `GET /assets` retorna 4 ativos Silva FO
- [x] `POST /assets` (imóvel ou FII) → row em `assets`; `GET /assets` e `GET /portfolio/consolidated` incluem o novo ativo
- [x] `POST /scenarios/simulate` usa snapshot com ativos atualizados (inclui POST recente)
- [x] Restart da API: ativos seed + POST ainda presentes
- [x] `pnpm db:seed` não remove ativos criados via POST (apenas upsert dos IDs canônicos)
- [x] CI sem Postgres: `pnpm test` verde com fallback in-memory
- [x] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db/src/repositories/**`, `seed.ts`, `index.ts` |
| API | `apps/api/src/patrimonio/**`, `portfolio/**`, `assets/**` |

## Regras de domínio

- `tenant_id` em toda operação (ADR-002, INV multi-tenant)
- `entityId` deve pertencer ao tenant antes de insert
- `payload` jsonb validado com `AssetSchema` na leitura
- RLS como rede de segurança — aplicação ainda passa `tenantId` explicitamente
- Audit append-only em mutação (`asset.create`) — stub in-memory OK nesta fatia

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Spec em `completed/`

## Notas de implementação

- `PatrimonioPersistenceModule.register()` importado uma vez em `AppModule` (Global)
- In-memory: `InMemoryPortfolioRepository` delega a `InMemoryAssetRepository` (fonte única)
- `withTenant()` em `@altora/db` via `set_config('app.tenant_id', …, true)`
- Env: `DATABASE_URL` habilita Postgres; omitir para CI in-memory
