# ADR-004: Harness de Domínio

**Status:** Aceito  
**Data:** 2025-07-27

## Contexto

O motor patrimonial é a IP central da Altora ([ADR-003](./003-what-if-snapshot-architecture.md)). Cálculos de yield, liquidez estrutural, concentração e simulação what-if precisam ser **corretos, auditáveis e regressáveis** — erros silenciosos em patrimônio alternativo são inaceitáveis para family office.

Alternativas consideradas:

- **Testar só no happy path:** insuficiente; domínio financeiro tem caudas e invariantes estruturais
- **Testar estratégias de investimento:** confunde validação de motor com validação de alpha
- **Golden fixtures + invariantes metamórficas:** separa engine de strategy; padrão em backtesting quant

## Decisão

Adotar **harness de domínio como especificação versionada** antes do código:

1. **Separação engine vs strategy:** invariantes validam o motor (infraestrutura de cálculo), não se uma alocação é boa
2. **Golden fixtures versionados:** JSON em `docs/domain/harness/fixtures/` com `input`, `expected` e `tolerance`
3. **JSON Schemas como contrato:** tipos futuros em `packages/domain` devem validar contra schemas
4. **Confiança epistemológica:** outputs de PE e imóvel em intervalo; FII pode ser pontual ([04-what-if](../04-what-if.md))
5. **Fixture canônico:** portfólio fictício "Silva FO" reutilizado em todos os cenários

Ativação futura: copiar fixtures para `packages/domain/__fixtures__/`, implementar contratos em [`contracts.md`](../domain/harness/contracts.md), rodar Vitest + fast-check no CI.

## Consequências

**Positivas:**

- IP patrimonial especificado antes de código — agentes implementam contra contrato claro
- Regressão detectável em refactors do motor what-if
- Cenários what-if prioritários cobertos por fixtures nomeados
- Invariantes metamórficas capturam bugs estruturais que golden tests isolados não pegam

**Negativas:**

- Manutenção de fixtures quando regras de negócio mudam
- Valores `expected` calculados manualmente — risco de erro humano (mitigado por `calculation_notes`)
- Especificação sem código não executa até bootstrap do monorepo

## Referências

- [Harness de Domínio](../domain/harness/README.md)
- [ADR-003 — What-If Snapshot](./003-what-if-snapshot-architecture.md)
- [Glossário de Domínio](../domain/glossary.md)
