# Harness de Domínio — Altora

Especificação testável do motor patrimonial: o que calcular, com quais inputs, quais outputs esperados e quais invariantes o motor nunca pode violar.

## Harness de IA vs Harness de Domínio

| | Harness de IA | Harness de Domínio |
|---|---------------|-------------------|
| **Pergunta** | Como codar? | O que calcular? |
| **Artefatos** | AGENTS.md, rules, hooks | Fixtures, schemas, invariantes, contratos |
| **Valida** | Estilo, tenant_id, arquitetura | Yield, liquidez, simulação what-if |
| **Local** | [docs/harness/](../../harness/README.md) | `docs/domain/harness/` |

## Mapa de arquivos

```
docs/domain/harness/
├── README.md              # este arquivo
├── invariants.md          # 10 invariantes metamórficas
├── contracts.md           # funções que packages/domain exportará
├── ci-activation.md       # checklist pós-bootstrap
├── schemas/               # JSON Schema Draft-07
└── fixtures/
    ├── _base/             # portfólio canônico Silva FO
    ├── _template.fixture.json
    └── 01–10 *.fixture.json
```

Decisão arquitetural: [ADR-004](../../adr/004-domain-harness.md).

## Como adicionar um cenário

1. Copiar [`fixtures/_template.fixture.json`](fixtures/_template.fixture.json)
2. Renomear para `NN-nome-do-cenario.fixture.json`
3. Preencher `input` (snapshot + premissas) — reutilizar ativos de [`_base/portfolio-silva-fo.json`](fixtures/_base/portfolio-silva-fo.json)
4. Calcular `expected` manualmente; documentar em `calculation_notes`
5. Listar `invariants` aplicáveis (ver [invariants.md](invariants.md))
6. Validar contra [`schemas/fixture.schema.json`](schemas/fixture.schema.json)

## Tipos de cenário

| Tipo | Descrição |
|------|-----------|
| `baseline` | Métricas do portfólio sem stress |
| `realocacao` | Venda/troca de ativos com impacto fiscal e liquidez |
| `stress_renda` | Vacância, inadimplência, corte de proventos |
| `stress_liquidez` | Capital call, necessidade de caixa |
| `stress_macro` | Selic, inflação, choque em FIIs |
| `sensibilidade` | Trio base / otimista / pessimista |

## Ativação pós-bootstrap

Ver [ci-activation.md](ci-activation.md). Resumo:

1. Schemas → Zod em `packages/domain`
2. Fixtures → `packages/domain/__fixtures__/`
3. Implementar [contracts.md](contracts.md)
4. `pnpm test:domain` no CI

## Métricas de sucesso

| Métrica | Meta |
|---------|------|
| Golden fixtures | 10+ cenários |
| Invariantes documentadas | 10 |
| Cenários what-if prioritários cobertos | 100% ([04-what-if](../../04-what-if.md)) |
| Fixtures passando schema | 100% |
| Regressões no motor após bootstrap | 0 escapes em CI |

## Referências

- [Glossário](../glossary.md)
- [04 — What-If](../../04-what-if.md)
- [packages/domain/AGENTS.md](../../../packages/domain/AGENTS.md)
