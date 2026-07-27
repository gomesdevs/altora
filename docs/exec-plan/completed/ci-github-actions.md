# Feature: CI GitHub Actions

**Status:** completed  
**Criado em:** 2026-07-27  
**Concluído em:** 2026-07-27  
**ADR relacionados:** [ADR-004](../adr/004-domain-harness.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Ativar pipeline CI que valida lint, tipos, testes (incluindo domínio), fixtures JSON Schema e fronteiras de pacote a cada push/PR.

## Contexto

Monorepo e harness de domínio estão bootstrapados. [ci-activation](../domain/harness/ci-activation.md) exige `pnpm test:domain` e `pnpm validate:fixtures` no gate de PR.

## Escopo

### Incluído

- [x] Workflow GitHub Actions: `lint` → `typecheck` → `test` → `test:domain` → `validate:fixtures` → `test:boundaries` → `build`
- [x] `pnpm validate:fixtures` com **ajv** contra schemas em `docs/domain/harness/schemas/`
- [x] Boundary tests em `tooling/ci/` (domain sem Nest/React; web sem `@altora/db`)
- [x] Scripts raiz e dependências necessárias

### Fora de escopo

- Deploy / release automation
- ESLint dedicado (lint atual = typecheck via turbo)
- Cache remoto Turborepo
- Matrix multi-OS

## Critérios de aceite

- [x] `.github/workflows/ci.yml` roda no `push`/`pull_request` para `main`
- [x] `pnpm validate:fixtures` valida fixtures `01`–`10` com ajv (falha se schema inválido)
- [x] `pnpm test:boundaries` falha se `packages/domain` importar Nest/React/Prisma ou `apps/web` importar `@altora/db`
- [x] Jobs locais equivalentes passam: lint, typecheck, test, test:domain, validate:fixtures, test:boundaries, build
- [x] Spec movida para `completed/`

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| CI | `.github/workflows/ci.yml` |
| Tooling | `tooling/ci/validate-fixtures.mjs`, `tooling/ci/check-boundaries.mjs` |
| Raiz | `package.json`, `pnpm-lock.yaml` |
| Docs | `docs/domain/harness/ci-activation.md` |

## Regras de domínio

- Domínio puro: sem frameworks em `packages/domain`
- Frontend sem acesso direto a DB
- Fixtures canônicas válidas contra JSON Schema

## Definition of Done

- [x] Código implementado conforme critérios de aceite
- [x] Testes passam (`pnpm test`)
- [x] Documentação atualizada se comportamento mudou
- [x] Spec movida para `completed/`

## Notas de implementação

- `_template.fixture.json` ignorado na validação ajv
- Schemas registrados no ajv pelo filename; `$id` removido em runtime para resolver `$ref` relativos
- Node 22 + pnpm 11.9.0
