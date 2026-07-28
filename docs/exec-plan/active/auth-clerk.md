# Feature: Auth Clerk — login, sessão e tenant no JWT

**Status:** active  
**Criado em:** 2026-07-28  
**ADR relacionados:** [ADR-002](../../adr/002-multi-tenant-row-level-security.md), [ADR-005](../../adr/005-auth-clerk.md) *(a criar)*

## Objetivo

Substituir o stub `x-tenant-id` por autenticação real: login no Next.js, sessão JWT com `tenant_id`, e `TenantGuard` na API lendo o tenant da sessão autenticada.

## Contexto

Dashboard e what-if já funcionam com header `x-tenant-id` (fora de escopo em specs anteriores). ADR-002 exige tenant do JWT. Stack aponta Auth.js / Clerk / Cognito — escolhemos **Clerk** (orgs B2B → tenant) com modo **dev JWT** para CI sem secrets reais.

## Escopo

### Incluído

- [ ] ADR-005: decisão Clerk + claim canônico `tenant_id`
- [ ] API: `TenantGuard` lê `Authorization: Bearer` (JWT); rejeita ausência de sessão válida
- [ ] Verificação JWT: modo `clerk` (JWKS) e modo `dev` (HS256 com `AUTH_DEV_SECRET`)
- [ ] Web: página `/login`, sessão (cookie), envio de Bearer às APIs
- [ ] Remover dependência de `x-tenant-id` / `NEXT_PUBLIC_TENANT_ID` no client de produção
- [ ] Testes do guard e contrato de claims

### Fora de escopo

- RBAC fino (roles por entidade)
- Convites Clerk Organizations UI completa
- MFA obrigatório
- Migração de usuários existentes

## Critérios de aceite

- [ ] Endpoints `/portfolio/*` e `/scenarios/*` rejeitam request sem Bearer válido (401)
- [ ] `tenant_id` no JWT é UUID; guard anexa `request.tenantId` — sem ler `x-tenant-id`
- [ ] Login em modo `dev` emite sessão com tenant Silva FO; UI consome API com Bearer
- [ ] Com `CLERK_*` configurado, fluxo Clerk documentado e pluggable
- [ ] `pnpm --filter api test` e `pnpm --filter web test` verdes
- [ ] Spec movida para `completed/`

## Arquivos afetados (previstos)

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

- [ ] Critérios de aceite verificados
- [ ] Testes passam
- [ ] Documentação (README / AGENTS) atualizada se o contrato de auth mudou
- [ ] Spec em `completed/`

## Notas de implementação

- Claim canônico: `{ sub, tenant_id }` (+ `org_id` opcional Clerk)
- Env: `AUTH_MODE=dev|clerk`, `AUTH_DEV_SECRET`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Tenant demo: `a1111111-1111-4111-8111-111111111111`
