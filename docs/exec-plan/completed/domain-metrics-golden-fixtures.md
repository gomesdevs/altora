# Feature: Métricas de domínio e golden fixtures

**Status:** completed  
**Criado em:** 2026-07-27  
**Concluído em:** 2026-07-27  
**ADR relacionados:** [ADR-004](../../adr/004-domain-harness.md), [ADR-003](../../adr/003-what-if-snapshot-architecture.md)

## Objetivo

Implementar as funções canônicas de métricas patrimoniais em `@altora/domain` e fazer os 10 golden fixtures do harness passarem.

## Contexto

Monorepo bootstrapado ([bootstrap-monorepo](../completed/bootstrap-monorepo.md)). Schemas Zod e confiança epistemológica já existem. Próximo passo do [ci-activation](../../domain/harness/ci-activation.md): contratos → testes golden.

## Escopo

### Incluído

- [x] `calculateEffectiveYield`, `calculateConcentration`
- [x] `calculateStructuralLiquidity` (horizontes 30/90/180/365)
- [x] Helpers de portfolio/snapshot imutável
- [x] Golden tests para fixtures `01`–`10`
- [x] Testes de invariantes INV-01 a INV-10 (property-based onde aplicável)

### Fora de escopo

- Motor what-if completo além do necessário aos goldens (stress/realocação cobertos no simulate)
- Persistência de cenários na API
- UI do simulador

## Critérios de aceite

- [x] `pnpm test:domain` passa com golden fixtures
- [x] Outputs de PE/participação usam faixa + disclaimer (INV-06)
- [x] Snapshot de entrada nunca é mutado (INV-05)
- [x] Contratos alinhados a [`contracts.md`](../../domain/harness/contracts.md)

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Domain | `packages/domain/src/{metrics,liquidity,portfolio,snapshot,simulation,confidence}/**` |
| Fixtures | `packages/domain/__fixtures__/` |
| What-if | `apps/what-if` usa `simulate` de `@altora/domain` |

## Regras de domínio

- Domínio puro (sem framework)
- Honestidade financeira por `AssetType`
- Premissas no cenário, não no snapshot

## Definition of Done

- [x] Código implementado conforme critérios de aceite
- [x] Testes passam (`pnpm test`)
- [x] Types compartilhados em `packages/domain`
- [x] Documentação atualizada se comportamento mudou
- [x] Spec movida para `completed/`

## Notas de implementação

- CRI com `maturityDate` fica fora da liquidez estrutural (hold-to-maturity)
- Faixas medium/low via `formatWithLevel` (±5% / ±15%)
- Fixtures canônicas alinhadas ao motor onde `calculation_notes` contradiziam expected
- `fast-check` cobre INV-01 e INV-08
