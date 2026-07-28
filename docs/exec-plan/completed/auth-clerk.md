# Feature: Auth Clerk — login, sessão e tenant no JWT

**Status:** completed  
**Criado em:** 2026-07-28  
**Concluído em:** 2026-07-28  
**ADR relacionados:** [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-005](../../adr/005-auth-clerk.md)

## Objetivo

Substituir o stub `x-tenant-id` por autenticação real: login no Next.js, sessão JWT com `tenant_id`, e `TenantGuard` na API lendo o tenant da sessão autenticada.

## Contexto

Dashboard e what-if já funcionavam com header `x-tenant-id`. ADR-002 exige tenant do JWT. Stack aponta Auth.js / Clerk / Cognito — escolhemos **Clerk** (orgs B2B → tenant) com modo **dev JWT** para CI sem secrets reais.

## Escopo

### Incluído

- [x] ADR-005: decisão Clerk + claim canônico `tenant_id`
- [x] API: `TenantGuard` lê `Authorization: Bearer` (JWT); rejeita ausência de sessão válida
- [x] Verificação JWT: modo `clerk` (JWKS) e modo `dev` (HS256 com `AUTH_DEV_SECRET`)
- [x] Web: página `/login`, sessão (cookie + token), envio de Bearer às APIs
- [x] Remover dependência de `x-tenant-id` / `NEXT_PUBLIC_TENANT_ID` no client de produção
- [x] Testes do guard e contrato de claims

### Fora de escopo

- RBAC fino (roles por entidade)
- Convites Clerk Organizations UI completa / `@clerk/nextjs` UI
- MFA obrigatório
- Migração de usuários existentes

## Critérios de aceite

- [x] Endpoints `/portfolio/*` e `/scenarios/*` rejeitam request sem Bearer válido (401)
- [x] `tenant_id` no JWT é UUID; guard anexa `request.tenantId` — sem ler `x-tenant-id`
- [x] Login em modo `dev` emite sessão com tenant Silva FO; UI consome API com Bearer
- [x] Com `CLERK_*` configurado, fluxo Clerk documentado e pluggable (`AUTH_MODE=clerk` + JWKS)
- [x] `pnpm --filter api test` e `pnpm --filter web test` verdes
- [x] Spec movida para `completed/`

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| Docs | `docs/adr/005-auth-clerk.md`, esta spec |
| API | `apps/api/src/auth/**`, `tenant/tenant.guard.ts`, `main.ts` |
| Web | `apps/web/src/app/login/**`, `middleware.ts`, `lib/auth/**`, clients API |

## Regras de domínio

- `tenant_id` em toda operação (INV-09 / ADR-002)
- Nunca confiar em tenant enviado pelo client fora do JWT assinado
- Mensagens de erro sem vazar dados cross-tenant

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Documentação (README / AGENTS) atualizada
- [x] Spec em `completed/`

## Notas de implementação

- Claim canônico: `{ sub, tenant_id }` (+ `org_id` opcional Clerk)
- Env: `AUTH_MODE=dev|clerk`, `AUTH_DEV_SECRET` (mesmo valor web↔api), `CLERK_JWKS_URL` / `CLERK_ISSUER`
- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- UI Clerk completa fica para quando houver `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` no ambiente
