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
API: `GET /portfolio/consolidated` com header `x-tenant-id`  
Web: [/dashboard](http://localhost:3000/dashboard) via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)

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
