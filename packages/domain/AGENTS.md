# packages/domain — Instruções para agentes

Tipos e regras de domínio patrimonial. **IP central da Altora.** Código puro, sem frameworks.

## Tipos canônicos

- `Tenant`, `Entity`, `Asset`, `Valuation`, `Portfolio`
- `Snapshot`, `Scenario`, `Premise`, `SimulationResult`
- Enums: `AssetType`, `ConfidenceLevel`, `LiquidityHorizon`

Ver [glossário](../../docs/domain/glossary.md).

## Fazer

```typescript
// ✅ Função pura, testável
export function calculateStructuralLiquidity(
  portfolio: Portfolio,
  horizonDays: 30 | 90 | 180 | 365,
): Money {
  // ...
}
```

```typescript
// ✅ Schemas Zod exportados para front e back
export const AssetSchema = z.object({ ... });
export type Asset = z.infer<typeof AssetSchema>;
```

## Não fazer

```typescript
// ❌ Import de framework
import { Injectable } from '@nestjs/common';
import { useQuery } from '@tanstack/react-query';

// ❌ Acesso a banco ou HTTP
import { prisma } from '@altora/db';
```

## Regras de negócio

- Imóvel e FII coexistem no mesmo modelo patrimonial
- Liquidez estrutural respeita lock-up, vacância, capital calls
- Confiança epistemológica varia por `AssetType`
- Valuation sempre carrega método + data + fonte

## Testes

- Unitários para toda função de cálculo
- Golden fixtures: [`docs/domain/harness/fixtures/`](../../docs/domain/harness/fixtures/)
- Invariantes: [`docs/domain/harness/invariants.md`](../../docs/domain/harness/invariants.md)
- Contratos de funções: [`docs/domain/harness/contracts.md`](../../docs/domain/harness/contracts.md)
- Ativação CI: [`docs/domain/harness/ci-activation.md`](../../docs/domain/harness/ci-activation.md)

## Referências

- [Harness de Domínio](../../docs/domain/harness/README.md)
- [docs/02-produto-slc.md](../../docs/02-produto-slc.md#ip-da-altora)
- [ADR-004 Domain Harness](../../docs/adr/004-domain-harness.md)
- [ADR-001 Monorepo](../../docs/adr/001-monorepo-pnpm-turborepo.md)
