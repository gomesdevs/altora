# Altora

Sistema operacional do patrimônio alternativo brasileiro.

## Bootstrap

```bash
pnpm install
docker compose up -d postgres redis
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Tenant demo (Silva FO): `a1111111-1111-4111-8111-111111111111`  
Auth: login em [/login](http://localhost:3000/login) (modo `AUTH_MODE=dev` emite JWT com `tenant_id`)  
API: `Authorization: Bearer <session JWT>` — `TenantGuard` **não** lê `x-tenant-id`  
Web: [/dashboard](http://localhost:3000/dashboard) via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)

### Auth (env)

Copie `.env.example` → `.env` (e para `apps/web/.env` / `apps/api/.env` — Next e Nest não leem o root automaticamente).

| Variável | Uso |
|----------|-----|
| `AUTH_MODE` | `dev` (default) ou `clerk` |
| `AUTH_DEV_SECRET` | Segredo HS256 **igual** em web e api (modo dev) |
| `CLERK_JWKS_URL` / `CLERK_ISSUER` | Verificação JWT em `AUTH_MODE=clerk` |
| `NEXT_PUBLIC_API_URL` | Base da API Nest |
| `DATABASE_URL` | Postgres (Compose em `:5433`) |

Nunca commitar `.env`.

## Documentação

- Produto: [docs/README.md](docs/README.md)
- Agentes: [AGENTS.md](AGENTS.md)
- Stack: [docs/06-stack-arquitetura.md](docs/06-stack-arquitetura.md)

## Workspaces

| Pacote / App | Função |
|--------------|--------|
| `apps/web` | Next.js |
| `apps/api` | NestJS |
| `apps/worker` | BullMQ |
| `apps/what-if` | Motor de simulação |
| `packages/domain` | Tipos e regras patrimoniais |
| `packages/db` | Schema Drizzle + migrations |
| `packages/ui` | Componentes compartilhados |
| `packages/typescript-config` | tsconfig base |
