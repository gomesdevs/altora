# apps/what-if — Instruções para agentes

Motor de simulação patrimonial. CPU-intensivo, stateless, isolado da API.

## Fluxo obrigatório

```
snapshot (imutável) + premissas → motor → resultado com confiança epistemológica
```

Ver [ADR-003](../../docs/adr/003-what-if-snapshot-architecture.md).

## Responsabilidades

- Receber snapshot versionado + premissas do cenário
- Calcular projeções: caixa (30/90/180/365d), yield, concentração, liquidez estrutural
- Retornar base / stress / otimista quando aplicável
- Anexar nível de confiança por classe de ativo

## Fazer

```typescript
// ✅ Função pura importada de domain
import { projectCashFlow, applyStress } from '@altora/domain';

export function simulate(input: SimulationInput): SimulationResult {
  // motor orquestra; regras estão em domain
}
```

```typescript
// ✅ Output com confiança para PE
return {
  yield: { min: 0.04, max: 0.09, confidence: 'low' },
  disclaimer: 'Cenário hipotético. NAV PE com defasagem.',
};
```

## Não fazer

- Alterar o snapshot de entrada
- Retornar valor pontual para ativos de confiança baixa (PE, participação societária)
- Importar NestJS, Prisma ou React
- Persistir diretamente no banco (API persiste o resultado)

## Outputs mínimos

- Caixa projetado por horizonte
- Yield efetivo antes/depois
- Concentração por classe, região, emissor
- Liquidez estrutural
- Metadados de confiança e premissas usadas

## Golden fixtures obrigatórios

Antes de merge em `apps/what-if`, todos os cenários em [`docs/domain/harness/fixtures/`](../../docs/domain/harness/fixtures/) devem passar:

- `01-baseline-metrics` até `10-inadimplencia-inquilino`
- Invariantes INV-01 a INV-10 ([invariants.md](../../docs/domain/harness/invariants.md))

## Referências

- [Harness de Domínio](../../docs/domain/harness/README.md)
- [docs/04-what-if.md](../../docs/04-what-if.md)
- [ADR-003 What-If Snapshot](../../docs/adr/003-what-if-snapshot-architecture.md)
- [Glossário: Snapshot, Cenário, ConfiançaEpistemológica](../../docs/domain/glossary.md)
- [packages/domain/AGENTS.md](../../packages/domain/AGENTS.md)
