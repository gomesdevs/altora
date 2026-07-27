# Feature: What-If API — simular cenário

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-003](../adr/003-what-if-snapshot-architecture.md), [ADR-002](../adr/002-multi-tenant-row-level-security.md)

## Objetivo

Expor `POST /scenarios/simulate` que monta snapshot imutável do portfólio, executa `simulate` em `@altora/domain` e persiste o resultado — respeitando INV-05 e INV-06.

## Contexto

Motor de domínio e consolidação patrimonial já existem. Próximo passo da fatia what-if: orquestração na API (ADR-003), sem cálculo no frontend.

## Escopo

### Incluído

- [ ] Schema/persistência de cenário + resultado (`tenant_id`)
- [ ] `POST /scenarios/simulate` com `TenantGuard`
- [ ] Snapshot via `createSnapshot` + `simulate` do domínio
- [ ] Asserts INV-05 (snapshot intacto) e INV-06 (faixa/disclaimer quando confidence low)
- [ ] Testes e2e mínimos (HTTP)

### Fora de escopo

- UI do simulador
- Fila assíncrona / `apps/what-if` como processo separado
- Comparação lado a lado de N cenários
- Auth JWT

## Critérios de aceite

- [ ] Body aceita `premises` (Zod/`PremisesSchema`); monta snapshot do portfólio do tenant
- [ ] Resultado inclui `cashFlow`, `yield`, `concentration`, `structuralLiquidity`, `disclaimer`
- [ ] Snapshot de entrada não é mutado após `simulate` (INV-05)
- [ ] Quando `confidence === 'low'`, `yield.after` é intervalo com `confidence: 'low'` (INV-06)
- [ ] Resultado persistido e recuperável por id no mesmo tenant
- [ ] `pnpm test` verde

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| DB | `packages/db` schema/migrate (cenários) |
| API | `apps/api/src/scenarios/**` |
| Domain | reutiliza `simulate`, `createSnapshot` |

## Regras de domínio

- Snapshot imutável; premissas no cenário
- Cálculo só em `@altora/domain`
- Multi-tenant: `tenant_id` em toda persistência

## Definition of Done

- [ ] Critérios de aceite atendidos
- [ ] Testes passam
- [ ] Spec movida para `completed/`

## Notas de implementação

- Repositório em memória na API para CI (espelha seed Silva FO)
- Tabelas Drizzle para Postgres quando `db:migrate` rodar
