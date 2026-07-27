# Feature: [Nome da feature]

**Status:** active  
**Criado em:** YYYY-MM-DD  
**ADR relacionados:** [ex: ADR-002](../adr/002-multi-tenant-row-level-security.md)

## Objetivo

[Uma frase: o que esta feature entrega e para quem]

## Contexto

[Por que agora? Link para doc de produto se relevante]

## Escopo

### Incluído

- [ ] Item 1
- [ ] Item 2

### Fora de escopo

- Item que não será feito nesta iteração

## Critérios de aceite

- [ ] [Verificável] Ex: todo endpoint retorna apenas dados do tenant autenticado
- [ ] [Verificável] Ex: teste unitário cobre caminho principal e falha
- [ ] [Verificável] Ex: tipos exportados de `packages/domain`

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Domain | `packages/domain/...` |
| API | `apps/api/...` |
| Web | `apps/web/...` |
| DB | `packages/db/...` |

## Regras de domínio

[Listar regras do glossário ou ADRs que esta feature deve respeitar]

- `tenant_id` em toda operação de dados
- [outras regras]

## Definition of Done

- [ ] Código implementado conforme critérios de aceite
- [ ] Testes passam (`pnpm test` — quando monorepo existir)
- [ ] Types compartilhados em `packages/domain`
- [ ] Documentação atualizada se comportamento mudou
- [ ] Spec movida para `completed/`

## Notas de implementação

[Espaço para decisões tomadas durante o desenvolvimento]
