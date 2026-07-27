# Glossário de Domínio — Altora

Termos canônicos do domínio patrimonial. Use estes nomes em código, specs e documentação.

---

## Tenant

Organização isolada na plataforma (family office, gestora, consultoria). Toda operação de dados pertence a um tenant.

**Exemplo:** "Silva Family Office" é um tenant com 3 entidades e 12 usuários.

**Ver também:** [06 — Stack e Arquitetura](../06-stack-arquitetura.md#multi-tenant), [ADR-002](../adr/002-multi-tenant-row-level-security.md)

---

## Entidade

Pessoa jurídica ou física dentro de um tenant que detém ou administra ativos (holding, SPE, pessoa).

**Exemplo:** "Holding Silva Ltda." é entidade que concentra participações em FIIs e imóveis.

**Ver também:** [02 — Produto SLC](../02-produto-slc.md#pilar-1--patrimônio-unificado-fundação)

---

## Ativo

Unidade patrimonial rastreável: imóvel, FII, CRI, participação societária, PE, crédito tokenizado, etc.

**Estrutura conceitual:**

```
Ativo
 ├─ tipo
 ├─ valuation (método + data + fonte)
 ├─ fluxos (aluguel, provento, juros, capital call)
 ├─ liquidez (prazo estimado de saída)
 └─ documentos / eventos
```

**Exemplo:** Apartamento em SP com aluguel mensal, vacância 0%, valuation por laudo de 2025.

**Ver também:** [02 — Produto SLC](../02-produto-slc.md#ip-da-altora)

---

## Valuation

Estimativa de valor de um ativo com método, data e fonte explícitos. Não confundir com preço de mercado.

**Exemplo:** Imóvel avaliado em R$ 2,1M por laudo (método comparativo, fonte: avaliador X, data: 2025-03).

**Ver também:** [04 — What-If](../04-what-if.md#honestidade-epistemológica)

---

## Portfólio

Agregação de ativos por entidade, classe, região ou visão consolidada do tenant, com métricas derivadas.

**Métricas típicas:** yield, concentração, liquidez estrutural, patrimônio líquido ajustado.

**Exemplo:** Portfólio consolidado do tenant com 40% real estate, 25% renda fixa privada, 20% PE.

**Ver também:** [02 — Produto SLC](../02-produto-slc.md#pilar-2--inteligência-patrimonial-cérebro)

---

## Snapshot

Cópia versionada e imutável do estado patrimonial em um instante, usada para simulações e relatórios.

**Regra:** alterar premissas de cenário nunca altera o snapshot original.

**Exemplo:** Snapshot `snap-2025-07-27-v3` captura portfólio antes de simular venda de imóvel.

**Ver também:** [ADR-003](../adr/003-what-if-snapshot-architecture.md), [04 — What-If](../04-what-if.md#fluxo-técnico)

---

## Cenário

Conjunto de premissas aplicadas sobre um snapshot para projetar impacto patrimonial (base, stress, otimista).

**Tipos prioritários:** realocação, stress de renda, stress de liquidez, stress macro, estruturação.

**Exemplo:** Cenário "Vender imóvel SP → CRIs + caixa" com premissas de tributação e prazo de liquidação.

**Ver também:** [04 — What-If](../04-what-if.md#tipos-de-cenário-prioridade)

---

## Premissa

Variável editável pelo usuário que alimenta o motor de simulação (vacância, Selic, prazo de venda, capital call).

**Exemplo:** `vacancia_percentual: 15` no cenário pessimista de stress de renda.

**Ver também:** [04 — What-If](../04-what-if.md#outputs-do-simulador)

---

## LiquidezEstrutural

Capacidade de levantar caixa em horizontes definidos (30/90/180/365 dias) sem fire sale, respeitando lock-ups e iliquidez.

**Exemplo:** "Em 90 dias, consigo levantar R$ 1,2M considerando apenas FIIs e CRIs com vencimento próximo."

**Ver também:** [04 — What-If](../04-what-if.md#o-que-importa-para-family-office)

---

## AuditLog

Registro append-only de ações na plataforma: quem fez o quê, quando, em qual tenant e entidade.

**Regra:** toda mutação patrimonial gera evento de auditoria.

**Exemplo:** "CFO criou ativo FII XYZ às 14:32, tenant Silva FO."

**Ver também:** [06 — Stack e Arquitetura](../06-stack-arquitetura.md#segurança)

---

## ConfiançaEpistemológica

Nível de confiabilidade do resultado de simulação por classe de ativo. Evita precisão falsa.

| Ativo | Nível |
|-------|-------|
| FII | Alta — dados de mercado |
| Imóvel físico | Média — depende de avaliação e vacância |
| PE | Baixa — NAV atrasado, capital calls incertos |
| Participação societária | Baixa — valuation é julgamento |

**Exemplo:** Output de cenário PE retorna intervalo (faixa) + disclaimer, não valor pontual.

**Ver também:** [04 — What-If](../04-what-if.md#honestidade-epistemológica), [Harness — INV-06](../domain/harness/invariants.md#inv-06--confiança-epistêmica)
