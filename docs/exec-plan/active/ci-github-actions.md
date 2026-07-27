# Feature: CI GitHub Actions

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-004](../adr/004-domain-harness.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Ativar pipeline CI que valida lint, tipos, testes (incluindo domínio), fixtures JSON Schema e fronteiras de pacote a cada push/PR.

## Contexto

Monorepo e harness de domínio estão bootstrapados. [ci-activation](../domain/harness/ci-activation.md) exige `pnpm test:domain` e `pnpm validate:fixtures` no gate de PR. Sem Actions, regressões escapam.

## Escopo

### Incluído

- [ ] Workflow GitHub Actions: `lint` → `typecheck` → `test` → `test:domain` → `validate:fixtures` → `test:boundaries` → `build`
- [ ] `pnpm validate:fixtures` com **ajv** contra schemas em `docs/domain/harness/schemas/`
- [ ] Boundary tests em `tooling/ci/` (domain sem Nest/React; web sem `@altora/db`)
- [ ] Scripts raiz e dependências necessárias

### Fora de escopo

- Deploy / release automation
- ESLint dedicado (lint atual = typecheck via turbo)
- Cache remoto Turborepo
- Matrix multi-OS

## Critérios de aceite

- [ ] `.github/workflows/ci.yml` roda no `push`/`pull_request` para `main`
- [ ] `pnpm validate:fixtures` valida fixtures `01`–`10` com ajv (falha se schema inválido)
- [ ] `pnpm test:boundaries` falha se `packages/domain` importar Nest/React/Prisma ou `apps/web` importar `@altora/db`
- [ ] Jobs locais equivalentes passam: lint, typecheck, test, test:domain, validate:fixtures, test:boundaries, build
- [ ] Spec movida para `completed/`

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

- [ ] Código implementado conforme critérios de aceite
- [ ] Testes passam (`pnpm test`)
- [ ] Documentação atualizada se comportamento mudou
- [ ] Spec movida para `completed/`

## Notas de implementação

- Ignorar `_template.fixture.json` na validação ajv (esqueleto incompleto)
- Node 22 + pnpm via `packageManager` do root
