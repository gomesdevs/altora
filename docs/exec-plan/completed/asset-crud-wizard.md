# Feature: Asset CRUD + wizard (imóvel + FII)

**Status:** completed  
**Criado em:** 2026-07-28  
**Concluído em:** 2026-07-28  
**ADR relacionados:** [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Cadastrar ativos patrimoniais (imóvel e FII mínimo) via API multi-tenant e wizard Next.js — com validação Zod e audit log em mutações.

## Contexto

Portfólio Silva FO existe via seed/in-memory. Falta fluxo de criação de ativos alinhado a auth JWT e trilha de auditoria (stub).

## Escopo

### Incluído

- [x] Schemas `CreateAssetInput` (imovel | fii) em `@altora/domain`
- [x] `GET /assets`, `POST /assets`, `GET /assets/entities` — TenantGuard + Bearer
- [x] Repositório in-memory + sync com portfolio demo
- [x] Audit log stub append-only em `POST /assets`
- [x] Wizard `/assets/new` (React Hook Form + Zod)
- [x] Testes API + contrato web

### Fora de escopo

- PUT/DELETE ativos
- CRI, PE, participação no wizard
- Persistência Postgres real (CI usa in-memory)
- RBAC por entidade

## Critérios de aceite

- [x] `tenant_id` do JWT; 401 sem Bearer
- [x] POST valida body com Zod; rejeita tipos fora imovel/fii
- [x] GET lista só ativos do tenant
- [x] Mutação gera evento audit (`asset.create`)
- [x] Wizard envia Bearer; não calcula métricas no browser
- [x] `pnpm test` verde; spec em `completed/`

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Domain | `packages/domain/src/schemas/asset-create.ts` |
| API | `apps/api/src/assets/**`, `audit/**` |
| Web | `apps/web/src/app/assets/new/**`, `lib/assets-api.ts` |

## Regras de domínio

- `tenant_id` em toda operação (ADR-002)
- `entityId` deve pertencer ao tenant
- Audit append-only em mutação patrimonial

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Spec em `completed/`

## Notas de implementação

- Actor = `sub` do JWT (ADR-005)
- Novos ativos refletem em `InMemoryPortfolioRepository` do tenant demo
