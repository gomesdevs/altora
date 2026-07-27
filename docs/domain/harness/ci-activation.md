# Ativação do Harness de Domínio no CI

Checklist para quando o monorepo (`package.json`, `pnpm-workspace.yaml`) existir.

## Pré-requisitos

- [ ] Bootstrap do monorepo ([ADR-001](../../adr/001-monorepo-pnpm-turborepo.md))
- [ ] `packages/domain` criado
- [ ] Vitest configurado no monorepo
- [ ] (Opcional) `fast-check` para invariantes property-based

## Passo 1 — Schemas → Zod

Copiar definições de [`schemas/`](schemas/) para `packages/domain/src/schemas/`:

```
packages/domain/src/schemas/
├── money.ts
├── asset.ts
├── snapshot.ts
├── premises.ts
└── simulation-result.ts
```

Gerar tipos com `z.infer<typeof Schema>` — fonte única para front e back.

## Passo 2 — Fixtures → código

```bash
cp -r docs/domain/harness/fixtures/_base packages/domain/__fixtures__/base
cp docs/domain/harness/fixtures/*.fixture.json packages/domain/__fixtures__/
```

Manter `docs/domain/harness/fixtures/` como **fonte canônica**; cópia no package é para execução de testes.

## Passo 3 — Implementar contratos

Seguir ordem em [`contracts.md`](contracts.md):

1. Métricas (`calculateEffectiveYield`, `calculateConcentration`)
2. Liquidez (`calculateStructuralLiquidity`)
3. Portfolio e snapshot
4. Simulação (`projectCashFlow`, `applyStress`, `simulate`)
5. Confiança epistemológica

## Passo 4 — Testes

```
packages/domain/src/
├── metrics/
├── liquidity/
├── portfolio/
├── snapshot/
├── simulation/
└── __tests__/
    ├── golden.test.ts       # 10 fixtures → expected
    ├── invariants.test.ts   # INV-01 a INV-10
    └── fixtures/            # cópia dos JSON
```

### Golden tests

```typescript
import fixtures from '../__fixtures__';

for (const fixture of fixtures) {
  it(`golden: ${fixture.id}`, () => {
    const result = simulate(fixture.input.snapshot, { premises: fixture.input.premises });
    expectWithinTolerance(result, fixture.expected, fixture.tolerance);
  });
}
```

### Invariant tests

```typescript
// fast-check para INV-01, INV-03, INV-08
// assertions diretas para INV-04, INV-05, INV-10
```

## Passo 5 — Motor what-if

`apps/what-if` importa apenas `simulate` de `@altora/domain`:

```typescript
import { simulate } from '@altora/domain';
export function runSimulation(input: SimulationInput) {
  return simulate(input.snapshot, input.scenario);
}
```

Teste de integração: `apps/what-if/__tests__/engine.harness.test.ts` reutiliza mesmos fixtures.

## Passo 6 — CI GitHub Actions

```yaml
- name: Validate fixtures against schema
  run: pnpm validate:fixtures

- name: Domain harness
  run: pnpm test:domain
```

### Scripts em `package.json` raiz (futuro)

```json
{
  "scripts": {
    "test:domain": "turbo run test --filter=@altora/domain",
    "validate:fixtures": "node tooling/ci/validate-fixtures.mjs"
  }
}
```

`validate-fixtures.mjs` usa `ajv` para validar todos `*.fixture.json` contra `fixture.schema.json`.

## Passo 7 — Gate de PR

PR que altera `packages/domain` ou `apps/what-if` **deve**:

- [ ] Passar `pnpm test:domain`
- [ ] Passar `pnpm validate:fixtures`
- [ ] Atualizar `expected` em fixtures se regra de negócio mudou (com `calculation_notes`)
- [ ] Não alterar snapshot canônico sem bump de `version`

## Métricas pós-ativação

| Métrica | Meta |
|---------|------|
| Golden fixtures passando | 10/10 |
| Invariantes property-based | 3+ (INV-01, INV-03, INV-08) |
| Regressões escapando CI | 0 |
| Tempo `test:domain` | < 5s |

## Referências

- [Harness de Domínio — README](README.md)
- [Invariantes](invariants.md)
- [Contratos](contracts.md)
- [Harness de IA](../../harness/README.md)
