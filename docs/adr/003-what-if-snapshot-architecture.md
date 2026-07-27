# ADR-003: Arquitetura de Snapshot para What-If

**Status:** Aceito  
**Data:** 2025-07-27

## Contexto

O simulador what-if é feature hero e IP central da Altora. Precisa comparar cenários ao longo do tempo, exportar relatórios rastreáveis e respeitar liquidez, tributação e confiança epistemológica por tipo de ativo.

Alternativas consideradas:

- **Calcular no frontend:** rápido de prototipar, mas sem auditoria, sem versionamento e viola separação de responsabilidades
- **Calcular inline na API:** acoplamento e risco de timeout em portfólios grandes
- **Snapshot versionado + motor isolado:** separação clara, testável e escalável

## Decisão

Fluxo obrigatório:

```
1. API monta snapshot versionado do portfólio (imutável)
2. Envia snapshot + premissas ao motor what-if (apps/what-if)
3. Motor calcula cenários (base / stress / otimista)
4. Resultado persistido no PostgreSQL
5. Usuário compara e exporta relatório
```

Regras:

- **Snapshot é imutável** após criação; premissas vivem no cenário, não no snapshot
- **Motor é stateless:** recebe snapshot + premissas, retorna resultado
- **Regras de domínio** ficam em `packages/domain`; motor importa apenas de lá
- **Outputs incluem confiança epistemológica** por classe de ativo (intervalos para PE/imóvel)
- **Frontend nunca executa simulação** — apenas exibe resultados da API

Outputs mínimos: caixa projetado (30/90/180/365d), yield antes/depois, concentração, liquidez estrutural, comparação lado a lado (até 3 cenários).

## Consequências

**Positivas:**

- Memória institucional: cenários salvos e versionados criam lock-in saudável
- Motor testável isoladamente com golden fixtures
- Escala CPU sem bloquear API (serviço dedicado)
- Relatórios rastreáveis: "este número veio deste snapshot, desta data"

**Negativas:**

- Latência adicional na criação de snapshot
- Storage de snapshots e resultados cresce com uso
- Motor precisa de harness de domínio robusto (fase posterior)

## Referências

- [04 — What-If](../04-what-if.md)
- [Glossário: Snapshot, Cenário, Premissa](../domain/glossary.md)
- [06 — Stack e Arquitetura](../06-stack-arquitetura.md#what-if)
