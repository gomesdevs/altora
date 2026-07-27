# Feature: Bootstrap do monorepo

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-001](../../adr/001-monorepo-pnpm-turborepo.md), [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-004](../../adr/004-domain-harness.md)

## Objetivo

Criar a estrutura executável do monorepo (pnpm + Turborepo) para que `pnpm install`, `pnpm typecheck` e `pnpm test` funcionem, desbloqueando implementação de domínio e apps.

## Contexto

Harness e docs de produto estão prontos; apps/packages existem só como `AGENTS.md`. [ADR-001](../../adr/001-monorepo-pnpm-turborepo.md) já decidiu a estrutura. Cloud Agent e hooks esperam `pnpm-workspace.yaml`.

## Escopo

### Incluído

- [ ] Raiz: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.npmrc`
- [ ] `docker-compose.yml` com Postgres e Redis
- [ ] `packages/typescript-config`, `packages/domain`, `packages/db`, `packages/ui`
- [ ] Schemas Zod canônicos em `@altora/domain` (a partir do harness)
- [ ] Stubs tipados de `apps/web`, `apps/api`, `apps/worker`, `apps/what-if`
- [ ] Scripts raiz: `dev`, `lint`, `typecheck`, `test`, `build`, `db:migrate`, `db:seed`

### Fora de escopo

- Autenticação / RBAC completo
- Motor what-if com golden fixtures (próxima feature)
- UI de produto / shadcn
- Migrations reais de produção e seed rico

## Critérios de aceite

- [ ] `pnpm install` conclui sem erro
- [ ] `pnpm typecheck` passa em todos os workspaces
- [ ] `pnpm test` executa testes de `@altora/domain`
- [ ] Todo schema de tabela patrimonial em `packages/db` inclui `tenantId`
- [ ] Tipos canônicos exportados de `@altora/domain` (Money, Asset, Snapshot, Premises, SimulationResult)
- [ ] `docker compose config` válido para postgres e redis

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Raiz | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `docker-compose.yml` |
| Domain | `packages/domain/**` |
| DB | `packages/db/**` |
| UI | `packages/ui/**` |
| Apps | `apps/{web,api,worker,what-if}/**` |
| Config | `packages/typescript-config/**` |

## Regras de domínio

- `tenant_id` em toda operação de dados
- Domínio puro: sem Nest/React/Prisma em `packages/domain`
- Confiança epistemológica tipada para outputs de simulação

## Definition of Done

- [ ] Código implementado conforme critérios de aceite
- [ ] Testes passam (`pnpm test`)
- [ ] Types compartilhados em `packages/domain`
- [ ] Documentação atualizada se comportamento mudou
- [ ] Spec movida para `completed/`

## Notas de implementação

- ORM inicial: Drizzle (type-safe, RLS explícito)
- Apps começam como stubs tipados; Next/Nest completos evoluem nas próximas specs
