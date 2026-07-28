# Feature: Assets Postgres persistence (Drizzle)

**Status:** active  
**Criado em:** 2026-07-28  
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

- [ ] `DrizzleAssetRepository` em `packages/db` (ou `apps/api` com injeção de `Db`) — `listByTenant`, `create`, `listEntities`
- [ ] `DrizzlePortfolioRepository` — `findByTenant` lê `assets` + `entities` + `portfolio_cash` do Postgres
- [ ] Contexto de tenant na conexão: `SET LOCAL app.tenant_id` antes de queries patrimoniais (RLS)
- [ ] `AssetsModule` / `PortfolioModule` usam Drizzle quando `DATABASE_URL` presente; in-memory como fallback para CI sem Postgres
- [ ] `POST /assets` persiste row em `assets` (`payload` jsonb = `Asset` canônico); remove sync manual em memória
- [ ] Seed Silva FO: upsert canônico por `id` **sem** apagar ativos criados pelo usuário (ajustar `seed.ts`)
- [ ] Testes: unit com in-memory; integração opcional com Postgres ou mock de `Db`; e2e existentes verdes
- [ ] Dashboard e what-if refletem ativo novo após POST (sem restart da API)

### Fora de escopo

- Persistência Drizzle de `scenarios`, `audit_logs` (continuam in-memory nesta fatia)
- PUT/DELETE de ativos
- Migração drizzle-kit versionada (manter `migrate.ts` idempotente por ora)
- Worker / jobs assíncronos
- Mudanças na UI web (já consome API)

## Critérios de aceite

- [ ] Toda query/mutation em `assets` e `entities` filtra por `tenant_id` do JWT (guard + coluna + RLS)
- [ ] Com Postgres: `pnpm db:migrate && pnpm db:seed` → `GET /assets` retorna 4 ativos Silva FO
- [ ] `POST /assets` (imóvel ou FII) → row em `assets`; `GET /assets` e `GET /portfolio/consolidated` incluem o novo ativo
- [ ] `POST /scenarios/simulate` usa snapshot com ativos atualizados (inclui POST recente)
- [ ] Restart da API: ativos seed + POST ainda presentes
- [ ] `pnpm db:seed` não remove ativos criados via POST (apenas upsert dos IDs canônicos)
- [ ] CI sem Postgres: `pnpm test` verde com fallback in-memory
- [ ] `pnpm test` e `pnpm typecheck` verdes

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db/src/repositories/**`, `seed.ts`, `index.ts`, mappers `payload` ↔ `Asset` |
| API | `apps/api/src/assets/**`, `portfolio/**`, `db/` (tenant context), `tokens.ts`, módulos Nest |
| Domain | mappers/helpers se necessário (preferir `@altora/domain` + `toDomainAsset`) |

## Regras de domínio

- `tenant_id` em toda operação (ADR-002, INV multi-tenant)
- `entityId` deve pertencer ao tenant antes de insert
- `payload` jsonb validado com `AssetSchema` na leitura
- RLS como rede de segurança — aplicação ainda passa `tenantId` explicitamente
- Audit append-only em mutação (`asset.create`) — stub in-memory OK nesta fatia

## Plano de commits (atômicos, sem push)

1. `feat(db): add Drizzle asset and portfolio repositories`
2. `fix(db): seed upserts canonical assets without wiping user rows`
3. `feat(api): wire Postgres repositories with tenant RLS context`
4. `test(api): cover persistence and shared portfolio reads`
5. `docs(exec-plan): complete assets postgres persistence spec`

## Definition of Done

- [ ] Critérios de aceite verificados
- [ ] Testes passam
- [ ] Spec em `completed/`

## Notas de implementação

- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- Tabela `assets`: colunas `id`, `tenant_id`, `entity_id`, `type`, `name`, `payload` (jsonb com valuation, monthlyIncome, etc.)
- `toDomainAsset` / `AssetSchema` para round-trip payload
- Padrão RLS: wrapper `withTenant(db, tenantId, fn)` executa `SET LOCAL app.tenant_id = $1` na transação
- Remover `portfolio.assets.push` em `AssetsService.create` quando portfolio lê do mesmo repositório
- Env: `DATABASE_URL` (default dev `postgresql://altora:altora@localhost:5433/altora`)

## Smoke manual

```bash
docker compose up -d postgres
pnpm db:migrate && pnpm db:seed
pnpm --filter api dev
pnpm --filter web dev
# login → POST /assets/new → dashboard PL atualizado → what-if simula com novo ativo
```
