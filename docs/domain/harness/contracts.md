# Contratos de Funções — packages/domain

Especificação das funções que `packages/domain` deverá exportar. Implementação futura deve satisfazer golden fixtures e invariantes.

Schemas: [`schemas/`](schemas/) | Fixtures: [`fixtures/`](fixtures/)

---

## Módulo `metrics`

### `calculateEffectiveYield(asset: Asset): number`

Calcula yield efetivo anualizado de um ativo com base em `monthlyIncome` e `valuation.amount`, ajustado por `vacancyRate` quando aplicável.

| | |
|---|---|
| **Pré-condição** | `asset.valuation.amount.amount > 0` |
| **Pós-condição** | Retorno em decimal (ex: 0.0456 = 4,56% a.a.) |
| **Erros** | `DomainError('INVALID_VALUATION')` se valuation ≤ 0 |
| **Fixtures** | `01-baseline-metrics` |

---

### `calculateConcentration(portfolio: Portfolio, dimension: 'class' \| 'region' \| 'issuer'): Record<string, number>`

Agrega percentual do patrimônio por dimensão. Soma ≤ 1.0 (INV-04).

| | |
|---|---|
| **Pré-condição** | `portfolio.netWorth > 0` |
| **Pós-condição** | Cada valor em [0, 1] |
| **Erros** | `DomainError('EMPTY_PORTFOLIO')` |
| **Fixtures** | `08-concentracao-geografica-sp` |

---

## Módulo `liquidity`

### `calculateStructuralLiquidity(portfolio: Portfolio, horizonDays: 30 \| 90 \| 180 \| 365): Money`

Soma valor liquidável no horizonte sem fire sale, respeitando `liquidityDays` e `lockUpDays` de cada ativo + caixa.

| | |
|---|---|
| **Pré-condição** | Portfolio com pelo menos caixa ou ativo líquido |
| **Pós-condição** | `horizonDays` maior nunca reduz liquidez (monotônico em horizonte) |
| **Erros** | `DomainError('INVALID_HORIZON')` |
| **Fixtures** | `01-baseline-metrics`, `04-stress-capital-call`, `07-liquidez-baixa-pe-heavy` |

---

## Módulo `portfolio`

### `aggregatePortfolio(assets: Asset[], cash: Money): Portfolio`

Agrega ativos em portfólio com `netWorth`, renda mensal total e metadados.

| | |
|---|---|
| **Pré-condição** | Todos assets com mesmo `tenantId` implícito |
| **Pós-condição** | `netWorth = sum(valuations) + cash` |
| **Fixtures** | `01-baseline-metrics` |

---

## Módulo `snapshot`

### `createSnapshot(portfolio: Portfolio, metadata: SnapshotMeta): Snapshot`

Cria snapshot **imutável** versionado. Deep freeze / readonly em implementação.

| | |
|---|---|
| **Pré-condição** | `portfolio` não vazio |
| **Pós-condição** | `snapshot.version` incrementa; `capturedAt` = now |
| **Erros** | `DomainError('EMPTY_PORTFOLIO')` |
| **Fixtures** | todos |

---

## Módulo `simulation`

### `projectCashFlow(snapshot: Snapshot, premises: Premises, horizonDays: number): Money`

Projeta saldo de caixa ao fim do horizonte: caixa inicial + renda − outflows (capital call, impostos).

| | |
|---|---|
| **Pré-condição** | Snapshot válido; INV-05 preservado |
| **Pós-condição** | INV-02 satisfeita |
| **Fixtures** | `01-baseline-metrics`, `02-realocacao-imovel-sp`, `03-stress-vacancia-15` |

---

### `applyStress(snapshot: Snapshot, stressType: string, params: Record<string, unknown>): Snapshot`

Retorna **novo snapshot derivado** (não altera original) com stress aplicado (ex: `fii_shock_pct`, vacância).

| | |
|---|---|
| **Pré-condição** | `stressType` reconhecido |
| **Pós-condição** | Snapshot de entrada inalterado (INV-05) |
| **Fixtures** | `03`–`06`, `10` |

---

### `simulate(snapshot: Snapshot, scenario: Scenario): SimulationResult`

Orquestra projeção completa: cashFlow (4 horizontes), yield before/after, concentração, liquidez estrutural, disclaimer.

| | |
|---|---|
| **Pré-condição** | Snapshot imutável |
| **Pós-condição** | Todos outputs mínimos de [ADR-003](../../adr/003-what-if-snapshot-architecture.md); INV-06 e INV-10 |
| **Erros** | `DomainError('INVALID_PREMISES')` |
| **Fixtures** | todos |

**Assinatura conceitual de `Scenario`:**

```typescript
{
  premises: Premises;
  variants?: Premises[];  // para sensibilidade trio (fixture 09)
}
```

---

## Módulo `confidence`

### `getConfidenceLevel(assetType: AssetType): 'high' | 'medium' | 'low'`

| AssetType | Nível |
|-----------|-------|
| `fii` | high |
| `imovel`, `cri`, `credito_tokenizado` | medium |
| `pe`, `participacao` | low |

**Fixtures:** INV-06

---

### `formatWithConfidence(value: number, assetType: AssetType): PointValue | IntervalValue`

| | |
|---|---|
| **high** | `{ value, confidence: 'high' }` |
| **medium** | `{ min: value * 0.95, max: value * 1.05, confidence: 'medium' }` |
| **low** | `{ min: value * 0.85, max: value * 1.15, confidence: 'low' }` |

Percentuais de faixa são configuráveis; valores acima são defaults do harness.

**Fixtures:** `04-stress-capital-call`, `07-liquidez-baixa-pe-heavy`

---

## Erros de domínio

| Código | Quando |
|--------|--------|
| `INVALID_VALUATION` | Valuation ≤ 0 ou ausente |
| `EMPTY_PORTFOLIO` | Sem ativos e sem caixa |
| `INVALID_HORIZON` | Horizonte não suportado |
| `INVALID_PREMISES` | Premissas conflitantes ou fora de domínio |
| `TENANT_MISMATCH` | Assets de tenants diferentes no mesmo portfólio |

---

## Ordem de implementação sugerida

1. `money` + tipos Zod (schemas)
2. `calculateEffectiveYield`, `aggregatePortfolio`
3. `calculateConcentration`, `calculateStructuralLiquidity`
4. `createSnapshot`
5. `projectCashFlow`, `applyStress`
6. `getConfidenceLevel`, `formatWithConfidence`
7. `simulate` (orquestração)
8. Golden tests contra fixtures 01–10
