# Feature: Métricas de domínio e golden fixtures

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-004](../../adr/004-domain-harness.md), [ADR-003](../../adr/003-what-if-snapshot-architecture.md)

## Objetivo

Implementar as funções canônicas de métricas patrimoniais em `@altora/domain` e fazer os 10 golden fixtures do harness passarem.

## Contexto

Monorepo bootstrapado ([bootstrap-monorepo](../completed/bootstrap-monorepo.md)). Schemas Zod e confiança epistemológica já existem. Próximo passo do [ci-activation](../../domain/harness/ci-activation.md): contratos → testes golden.

## Escopo

### Incluído

- [ ] `calculateEffectiveYield`, `calculateConcentration`
- [ ] `calculateStructuralLiquidity` (horizontes 30/90/180/365)
- [ ] Helpers de portfolio/snapshot imutável
- [ ] Golden tests para fixtures `01`–`10`
- [ ] Testes de invariantes INV-01 a INV-10 (pelo menos assertions diretas)

### Fora de escopo

- Motor what-if completo (stress/realocação) — pode começar aqui, mas cenários complexos podem ser spec seguinte
- Persistência de cenários na API
- UI do simulador

## Critérios de aceite

- [ ] `pnpm test:domain` passa com golden fixtures
- [ ] Outputs de PE/participação usam faixa + disclaimer (INV-06)
- [ ] Snapshot de entrada nunca é mutado (INV sobre imutabilidade)
- [ ] Contratos alinhados a [`contracts.md`](../../domain/harness/contracts.md)

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Domain | `packages/domain/src/{metrics,liquidity,portfolio,simulation}/**` |
| Fixtures | `packages/domain/__fixtures__/` (cópia dos JSON canônicos) |
| What-if | `apps/what-if` passa a usar `simulate` real quando existir |

## Regras de domínio

- Domínio puro (sem framework)
- Honestidade financeira por `AssetType`
- Premissas no cenário, não no snapshot

## Definition of Done

- [ ] Código implementado conforme critérios de aceite
- [ ] Testes passam (`pnpm test`)
- [ ] Types compartilhados em `packages/domain`
- [ ] Documentação atualizada se comportamento mudou
- [ ] Spec movida para `completed/`

## Notas de implementação

Seguir ordem em [`contracts.md`](../../domain/harness/contracts.md) e tolerâncias das fixtures.
