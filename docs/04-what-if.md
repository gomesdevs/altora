# 04 — Simulador What-If

## Por que é feature hero

O what-if não é módulo secundário. É provavelmente o recurso com maior potencial de virar **identidade da Altora**.

### Psicologia do family office

O que parece narcisismo costuma ser:

- **Aversão extrema à perda** — preservar pesa mais que maximizar
- **Responsabilidade multi-geracional** — "não posso estragar o que construíram"
- **Medo de decisões irreversíveis** — imóvel, PE e participação não têm botão "desfazer"
- **Desconfiança de narrativas otimistas** — todo mundo já ouviu pitch demais

> *"Antes de eu me comprometer, me mostra o que acontece se der errado."*

---

## What-if fraco vs what-if decisório

| What-if fraco | What-if forte (Altora) |
|---------------|------------------------|
| "E se eu colocar +10% em FII?" | "E se eu liquidar o imóvel em SP, pagar ganho de capital, e realocar em CRIs + caixa?" |
| Só muda alocação % | Muda ativos reais, com liquidez, prazo e tributação |
| Um cenário por vez | Compara 2–3 cenários lado a lado |
| Assume tudo líquido | Respeita lock-up, vacância, capital calls, vencimentos |
| Gráfico bonito | Resposta: caixa, yield, risco, concentração |

### O que importa para family office

1. **Liquidez** — consigo honrar compromissos?
2. **Concentração** — estou mais exposto a um risco?
3. **Renda** — meu fluxo mensal/trimestral cai ou sobe?
4. **Cauda** — no cenário ruim, quanto perco?
5. **Irreversibilidade** — essa decisão me prende por quanto tempo?

---

## Tipos de cenário (prioridade)

### 1. Realocação patrimonial

- Vender imóvel físico → impacto fiscal + tempo de liquidação + destino do caixa
- Trocar exposição geográfica

### 2. Stress de renda

- Vacância sobe
- Inadimplência de inquilino
- Corte de proventos de FII
- Atraso em CRI

### 3. Stress de liquidez

- Capital call inesperado
- Necessidade de caixa familiar
- "Quanto consigo levantar em 30/90/180 dias sem fire sale?"

### 4. Stress macro

- Selic +2 p.p.
- Inflação acima do esperado
- Queda de 20% em FIIs

### 5. Estruturação

- Tokenizar vs. vender integral
- Co-investimento vs. manter caixa
- SPE nova vs. estrutura existente

---

## Fluxo técnico

```
1. Nest monta snapshot do portfólio atual (versionado)
2. Envia snapshot + premissas ao motor de simulação
3. Motor calcula cenários (base / stress / otimista)
4. Resultado salvo no Postgres
5. Usuário compara e exporta relatório
```

### Outputs do simulador

- Caixa projetado (30/90/180/365 dias)
- Yield efetivo antes/depois
- Concentração por classe, região, emissor
- Liquidez estrutural
- Comparação lado a lado (até 3 cenários)
- Sensibilidade: base, otimista, pessimista

---

## Honestidade epistemológica

| Ativo | Confiabilidade do cenário |
|-------|--------------------------|
| FII | Alta — dados de mercado |
| Imóvel físico | Média — depende de avaliação e vacância |
| PE | Baixa — NAV atrasado, capital calls incertos |
| Participação societária | Baixa — valuation é julgamento |

**Não vender precisão falsa.** Vender intervalos e sensibilidade:

> *"No cenário base, yield cai 0,8 p.p. No pessimista (-20% valuation + vacância 15%), cai 2,1 p.p."*

---

## Momento de venda (demo)

1. Cliente importa patrimônio (mesmo parcialmente)
2. Pergunta: *"Tem alguma decisão pendente?"*
3. Monta cenário em 2 minutos
4. Mostra impacto em caixa, yield, concentração e stress
5. Exporta relatório "Cenário A vs. Cenário B" para o conselho

O cliente pensa: *"Isso é o que eu pago alguém para fazer antes de cada decisão grande."*

---

## Lock-in

Cenários salvos, versionados e comparados ao longo dos anos criam:

- Hábito — toda decisão grande passa pela plataforma
- Memória institucional — "por que tomamos essa decisão em 2024?"
- Custo de troca — histórico de simulações não migra fácil

---

## Risco regulatório

Simulação pode ser interpretada como recomendação de investimento.

**Mitigação:**

- Linguagem: "ferramenta de modelagem", não "recomendação"
- Usuário define premissas
- Disclaimer: cenários hipotéticos
- White-label para consultores: ferramenta **deles**, não da Altora

Muito menos arriscado que marketplace ou emissão de token.

---

## Posicionamento sugerido

**Slogan operacional para family office:**

> *"Decida sabendo o que pode dar errado."*

**Identidade do produto:**

> *"O sistema onde patrimônio alternativo é modelado antes de ser movido."*

---

## Pontuação das features what-if

| Feature | Score |
|---------|------:|
| Cenário de realocação | 980 |
| Impacto multidimensional | 960 |
| Cenário de stress de liquidez | 930 |
| Comparação lado a lado | 870 |
| Premissas editáveis | 840 |
| Cenário de stress de renda | 840 |
| Export de cenário | 810 |
| Sensibilidade | 800 |
| Salvar e versionar | 760 |
| Cenário macro | 710 |
| Cenário de estruturação | 580 |

**Média do módulo: 824** — segundo módulo mais crítico do produto.
