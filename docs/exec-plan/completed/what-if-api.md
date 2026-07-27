# Feature: What-If API — simular cenário

**Status:** completed  
**Criado em:** 2026-07-27  
**Concluído em:** 2026-07-27  
**ADR relacionados:** [ADR-003](../adr/003-what-if-snapshot-architecture.md), [ADR-002](../adr/002-multi-tenant-row-level-security.md)

## Objetivo

Expor `POST /scenarios/simulate` que monta snapshot imutável do portfólio, executa `simulate` em `@altora/domain` e persiste o resultado — respeitando INV-05 e INV-06.

## Escopo

### Incluído

- [x] Schema/persistência de cenário + resultado (`tenant_id`)
- [x] `POST /scenarios/simulate` com `TenantGuard`
- [x] Snapshot via `createSnapshot` + `simulate` do domínio
- [x] Asserts INV-05 / INV-06
- [x] Testes e2e mínimos (HTTP) + `GET /scenarios/:id`

## Critérios de aceite

- [x] Body aceita `premises`; monta snapshot do portfólio do tenant
- [x] Resultado inclui outputs do motor + disclaimer
- [x] INV-05 e INV-06 verificados na orquestração
- [x] Resultado persistido e recuperável por id no mesmo tenant
- [x] `pnpm test` verde

## Notas de implementação

- `InMemoryScenarioRepository` para CI; tabelas Drizzle `scenarios` / `simulation_results` para Postgres
- Controllers usam `@Inject` explícito (Vitest sem `emitDecoratorMetadata`)
