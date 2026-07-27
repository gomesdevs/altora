# Exec Plan — Fluxo de trabalho para features

Specs de features em desenvolvimento. Agentes e desenvolvedores devem ler o spec ativo **antes** de implementar.

## Fluxo

```
1. Copiar _template.md → active/nome-da-feature.md
2. Preencher objetivo, critérios de aceite, arquivos afetados
3. Implementar seguindo AGENTS.md e ADRs
4. Ao concluir: mover para completed/ e atualizar docs se comportamento mudou
```

## Pastas

| Pasta | Conteúdo |
|-------|----------|
| `active/` | Features em andamento (uma ou poucas por vez) |
| `completed/` | Specs concluídas (histórico e rastreabilidade) |

## Regras

- Uma spec ativa por feature significativa
- Critérios de aceite devem ser verificáveis (não "funciona bem")
- Referenciar ADRs e termos do [glossário](../domain/glossary.md)
- Se a spec ficar obsoleta, mover para `completed/` com nota de cancelamento

## Template

Use [`_template.md`](./_template.md) como ponto de partida.

## Definition of Done (global)

Ver checklist em [`AGENTS.md`](../../AGENTS.md) na raiz do repositório.
