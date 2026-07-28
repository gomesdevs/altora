# Feature: What-If Compare UI — comparar cenários lado a lado

**Status:** completed  
**Criado em:** 2026-07-28  
**Concluído em:** 2026-07-28  
**ADR relacionados:** [ADR-003](../../adr/003-what-if-snapshot-architecture.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Permitir listar cenários what-if do tenant e comparar 2–3 resultados (caixa, yield, concentração) lado a lado — só exibindo dados da API, com sessão Bearer.

## Contexto

Simular e persistir já existem (`POST /scenarios/simulate`, `GET /scenarios/:id`, UI `/what-if`). Falta listagem + comparação multi-cenário sem recalcular no browser.

## Escopo

### Incluído

- [x] `GET /scenarios` — lista cenários do tenant autenticado (Bearer / TenantGuard)
- [x] Página `/what-if/compare` — listar, selecionar 2–3, comparar caixa/yield/concentração
- [x] Client TanStack Query com `Authorization: Bearer`
- [x] Disclaimer INV-06 visível na comparação
- [x] Testes de contrato mínimos (API list + UI sem `simulate`)

### Fora de escopo

- Diff estatístico / gráficos avançados
- Merge de premissas / re-simulação a partir da comparação
- Export PDF

## Critérios de aceite

- [x] Lista filtrada por `tenant_id` do JWT; 401 sem Bearer
- [x] UI permite no máximo 3 cenários selecionados (mínimo 2 para comparar)
- [x] Colunas lado a lado: cashFlow 30/90/180/365, yield before/after, concentration.byClass
- [x] Frontend não importa `simulate` de `@altora/domain`
- [x] `pnpm --filter api test` e `pnpm --filter web test` verdes
- [x] Spec movida para `completed/`

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| API | `apps/api/src/scenarios/**` |
| Web | `apps/web/src/app/what-if/compare/**`, `lib/scenarios-api.ts` |

## Regras de domínio

- INV-09 / ADR-002: isolamento por tenant
- ADR-005: tenant só do JWT
- What-if: resultado já persistido — UI só exibe

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Spec em `completed/`

## Notas de implementação

- Ordenar lista por `createdAt` desc
- Rota `GET /scenarios` registrada **antes** de `GET /scenarios/:id`
- Seleção limitada no client; comparação usa DTOs já retornados por `listScenarios`
