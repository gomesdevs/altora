# Altora

Sistema operacional do patrimônio alternativo brasileiro.

## Bootstrap

```bash
pnpm install
docker compose up -d postgres redis
pnpm db:migrate && pnpm db:seed
pnpm dev
```

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
