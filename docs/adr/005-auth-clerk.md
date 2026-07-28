# ADR-005: Auth com Clerk e tenant no JWT

**Status:** Aceito  
**Data:** 2026-07-28

## Contexto

Endpoints patrimoniais usavam o header stub `x-tenant-id`. ADR-002 exige que o tenant venha do JWT autenticado. Alternativas da stack: Auth.js, Clerk, Cognito.

| Opção | Prós | Contras |
|-------|------|---------|
| **Clerk** | Orgs B2B → tenant, sessões Next.js, MFA, convites | Vendor lock-in, custo |
| **Auth.js** | Open source, controlável | Mais glue code (orgs, MFA, SSO) |
| **Cognito** | AWS-native | DX e orgs multi-tenant mais pesados |

## Decisão

Adotar **Clerk** como IdP de produção:

1. **Organização Clerk** (ou `publicMetadata.tenant_id`) mapeia para `tenant_id` Altora (UUID)
2. Sessão Next.js via Clerk; API NestJS recebe `Authorization: Bearer <session JWT>`
3. `TenantGuard` valida o JWT e anexa `request.tenantId` — **não** lê `x-tenant-id`
4. Modo **`AUTH_MODE=dev`**: JWT HS256 local (`AUTH_DEV_SECRET`) com claim `tenant_id` para CI e onboarding sem secrets Clerk

### Claim canônico

```json
{
  "sub": "user_…",
  "tenant_id": "a1111111-1111-4111-8111-111111111111"
}
```

`org_id` Clerk pode coexistir; o tenant operacional da Altora é sempre `tenant_id` (UUID).

## Consequências

- Client web deixa de enviar tenant em claro
- Testes e2e usam Bearer assinado no modo `dev`
- Produção exige `CLERK_SECRET_KEY` + mapeamento org → tenant
- Header `x-tenant-id` fica deprecated (ignorado pelo guard)

## Referências

- [ADR-002 Multi-tenant](./002-multi-tenant-row-level-security.md)
- [Spec auth-clerk](../exec-plan/active/auth-clerk.md)
- [docs/06-stack-arquitetura.md](../06-stack-arquitetura.md)
