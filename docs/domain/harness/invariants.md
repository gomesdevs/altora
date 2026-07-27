# Invariantes Metamórficas — Harness de Domínio

Relações que o **motor patrimonial** deve satisfazer independentemente do cenário. Testam infraestrutura de cálculo, não qualidade de investimento.

Ver [ADR-004](../../adr/004-domain-harness.md).

---

## INV-01 — Monotonicidade de custo

**Enunciado:** Para qualquer cenário, aumentar taxas, impostos ou custos de transação nunca melhora o patrimônio líquido ou yield líquido resultante.

**Fixtures:** `02-realocacao-imovel-sp`

**Teste property-based (futuro):**

```typescript
// feeMultiplier em [1, 2, 3] → netWorth não aumenta
fc.assert(
  fc.property(fc.double({ min: 1, max: 3 }), (feeMultiplier) => {
    const base = simulate(snapshot, { tax_rate_capital_gains: 0.15 });
    const stressed = simulate(snapshot, { tax_rate_capital_gains: 0.15 * feeMultiplier });
    return stressed.netWorth.amount <= base.netWorth.amount + tolerance;
  })
);
```

---

## INV-02 — Conservação de caixa

**Enunciado:** A variação de caixa projetada em um horizonte deve igualar entradas de renda menos saídas explícitas (capital calls, impostos, custos) no mesmo período.

**Fixtures:** `01-baseline-metrics`, `03-stress-vacancia-15`, `04-stress-capital-call`, `10-inadimplencia-inquilino`

**Teste:**

```typescript
const inflows = sumMonthlyIncome(snapshot, horizonDays);
const outflows = sumOutflows(premises, horizonDays);
expect(cashFlow[horizon] - snapshot.cash.amount).toBeCloseTo(inflows - outflows, tolerance);
```

---

## INV-03 — Liquidez monotônica

**Enunciado:** Aumentar `lockUpDays` ou `liquidityDays` de um ativo nunca aumenta a liquidez estrutural em horizontes menores que o prazo de lock-up.

**Fixtures:** `04-stress-capital-call`, `07-liquidez-baixa-pe-heavy`

**Teste property-based:**

```typescript
// PE lockUp 365d vs 90d → structuralLiquidity.30d menor ou igual
```

---

## INV-04 — Concentração bounded

**Enunciado:** Percentuais de concentração por dimensão (classe, região, emissor) somam no máximo 100% (1.0) e cada fatia é não-negativa.

**Fixtures:** `01-baseline-metrics`, `08-concentracao-geografica-sp`, todos

**Teste:**

```typescript
for (const dim of ['byClass', 'byRegion', 'byIssuer']) {
  const values = Object.values(result.concentration[dim] ?? {});
  expect(values.every(v => v >= 0 && v <= 1)).toBe(true);
  expect(sum(values)).toBeLessThanOrEqual(1.0 + tolerance.relative);
}
```

---

## INV-05 — Snapshot imutável

**Enunciado:** Alterar premissas de cenário não altera `snapshot.id`, `snapshot.version` nem a lista de `assets` do snapshot original.

**Fixtures:** todos

**Teste:**

```typescript
const snapBefore = deepClone(snapshot);
simulate(snapshot, premisesA);
simulate(snapshot, premisesB);
expect(snapshot).toEqual(snapBefore);
```

---

## INV-06 — Confiança epistêmica

**Enunciado:** Ativos `pe` e `participacao` produzem `yield.after` como intervalo `{ min, max, confidence: 'low' }`. Ativos `imovel` produzem `confidence: 'medium'` ou intervalo. Ativos `fii` podem retornar valor pontual com `confidence: 'high'`.

**Fixtures:** `04-stress-capital-call`, `07-liquidez-baixa-pe-heavy`, `06-stress-fii-queda-20`

**Schema:** [`simulation-result.schema.json`](schemas/simulation-result.schema.json)

---

## INV-07 — Ordem de sensibilidade

**Enunciado:** Quando cenário inclui trio pessimista / base / otimista, vale: `yield_pessimista <= yield_base <= yield_otimista` e `netWorth_pessimista <= netWorth_base <= netWorth_otimista`.

**Fixtures:** `09-sensibilidade-trio`

**Teste:**

```typescript
const [pess, base, opt] = expectedVariants;
expect(pess.yield.after.min).toBeLessThanOrEqual(base.yield.after);
expect(base.yield.after).toBeLessThanOrEqual(opt.yield.after.max);
```

---

## INV-08 — Vacância monotônica

**Enunciado:** Aumentar `vacancia_percentual` nunca aumenta yield efetivo nem renda mensal projetada.

**Fixtures:** `03-stress-vacancia-15`, `10-inadimplencia-inquilino`

**Teste property-based:**

```typescript
fc.assert(
  fc.property(fc.integer({ min: 0, max: 50 }), (vacancy) => {
    const r = simulate(snapshot, { vacancia_percentual: vacancy });
    const r0 = simulate(snapshot, { vacancia_percentual: 0 });
    return effectiveYield(r) <= effectiveYield(r0) + tolerance;
  })
);
```

---

## INV-09 — Isolamento de tenant

**Enunciado:** Simulação com snapshot de `tenantA` não incorpora ativos, caixa ou premissas de `tenantB`.

**Fixtures:** `01-baseline-metrics` (tenant-silva-fo-001) — teste futuro com segundo tenant fixture

**Teste:**

```typescript
const resultA = simulate(snapshotTenantA, premises);
expect(resultA).not.toContainAssetIdsFrom(snapshotTenantB);
```

---

## INV-10 — Disclaimer obrigatório

**Enunciado:** Todo `SimulationResult` de cenário what-if inclui `disclaimer` não vazio com linguagem de modelagem hipotética (não recomendação).

**Fixtures:** todos

**Teste:**

```typescript
expect(result.disclaimer.length).toBeGreaterThan(10);
expect(result.disclaimer.toLowerCase()).toMatch(/hipotétic|modelagem|não constitui recomendação/);
```

---

## Mapa invariante → fixture

| Invariante | Fixtures que cobrem |
|------------|---------------------|
| INV-01 | 02 |
| INV-02 | 01, 03, 04, 10 |
| INV-03 | 04, 07 |
| INV-04 | 01, 08, todos |
| INV-05 | todos |
| INV-06 | 02, 04, 06, 07 |
| INV-07 | 09 |
| INV-08 | 03, 10 |
| INV-09 | (fixture futuro tenant-b) |
| INV-10 | todos |
