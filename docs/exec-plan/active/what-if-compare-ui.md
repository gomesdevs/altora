# Feature: What-If Compare UI — comparar cenários lado a lado

**Status:** active  
**Criado em:** 2026-07-28  
**ADR relacionados:** [ADR-003](../../adr/003-what-if-snapshot-architecture.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Permitir listar cenários what-if do tenant e comparar 2–3 resultados (caixa, yield, concentração) lado a lado — só exibindo dados da API, com sessão Bearer.

## Contexto

Simular e persistir já existem (`POST /scenarios/simulate`, `GET /scenarios/:id`, UI `/what-if`). Falta listagem + comparação multi-cenário sem recalcular no browser.

## Escopo

### Incluído

- [ ] `GET /scenarios` — lista cenários do tenant autenticado (Bearer / TenantGuard)
- [ ] Página `/what-if/compare` — listar, selecionar 2–3, comparar caixa/yield/concentração
- [ ] Client TanStack Query com `Authorization: Bearer`
- [ ] Disclaimer INV-06 visível na comparação
- [ ] Testes de contrato mínimos (API list + UI sem `simulate`)

### Fora de escopo

- Diff estatístico / gráficos avançados
- Merge de premissas / re-simulação a partir da comparação
- Export PDF

## Critérios de aceite

- [ ] Lista filtrada por `tenant_id` do JWT; 401 sem Bearer
- [ ] UI permite no máximo 3 cenários selecionados (mínimo 2 para comparar)
- [ ] Colunas lado a lado: cashFlow 30/90/180/365, yield before/after, concentration.byClass
- [ ] Frontend não importa `simulate` de `@altora/domain`
- [ ] `pnpm --filter api test` e `pnpm --filter web test` verdes
- [ ] Spec movida para `completed/`

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| API | `apps/api/src/scenarios/**` |
| Web | `apps/web/src/app/what-if/compare/**`, `lib/scenarios-api.ts` |

## Regras de domínio

- INV-09 / ADR-002: isolamento por tenant
- ADR-005: tenant só do JWT
- What-if: resultado já persistido — UI só exibe

## Definition of Done

- [ ] Critérios de aceite verificados
- [ ] Testes passam
- [ ] Spec em `completed/`

## Notas de implementação

- Ordenar lista por `createdAt` desc
- Rota `GET /scenarios` registrada **antes** de `GET /scenarios/:id`
