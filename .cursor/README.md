# Cursor — Configuração do Harness Altora

Configuração de ambiente, hooks e regras para agentes Cursor neste repositório.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `hooks.json` | Eventos do agente → scripts de verificação |
| `hooks/*.sh` | Scripts de proteção e validação |
| `rules/*.mdc` | Regras contextuais por glob |
| `environment.json` | Bootstrap para Cloud Agents |

Documentação completa: [docs/harness/README.md](../docs/harness/README.md)

## Hooks

### Ativos (fase pré-código)

| Evento | Script | Comportamento |
|--------|--------|---------------|
| `beforeReadFile` | `hooks/block-secrets.sh` | Bloqueia `.env*`, `*credentials*`, `*.pem`, `secrets/` |
| `beforeShellExecution` | `hooks/guard-destructive-git.sh` | Bloqueia `git push`, `git config`, `git reset --hard` |

### Preparados (ativam com monorepo)

| Evento | Script | Comportamento |
|--------|--------|---------------|
| `afterFileEdit` | `hooks/post-edit-verify.sh` | Se `package.json` existir → `eslint --fix` no arquivo |
| `stop` | `hooks/session-verify.sh` | Se monorepo existir → `pnpm typecheck && pnpm test`; senão → no-op silencioso |

### Testar hooks

1. Reinicie o Cursor ou salve `hooks.json` para recarregar
2. Verifique a aba **Hooks** nas configurações do Cursor
3. Tente ler um arquivo `.env` — deve ser bloqueado
4. Tente `git push --force origin main` — deve ser bloqueado

### Permissões

Scripts devem ser executáveis:

```bash
chmod +x .cursor/hooks/*.sh
```

## Cloud Agent — environment.json

**Status:** template — não funcional até existir `pnpm-workspace.yaml`.

Quando o monorepo for bootstrapped:

1. `install` roda após checkout (idempotente)
2. `terminals` inicia `pnpm dev` e worker
3. Secrets via [Cursor Dashboard](https://cursor.com/dashboard/cloud-agents) — nunca no repositório

Campos esperados no bootstrap:

- `DATABASE_URL` — PostgreSQL local ou remoto
- `REDIS_URL` — Redis para filas
- Credenciais de auth (Clerk/Cognito) quando configuradas

## Rules

Regras em `rules/` carregam automaticamente por glob ou `alwaysApply`:

- `multi-tenant.mdc` — `apps/api/**`, `packages/db/**`
- `domain-purity.mdc` — `packages/domain/**`
- `what-if-engine.mdc` — `apps/what-if/**`, cenários na API
- `frontend-patterns.mdc` — `apps/web/**`
- `financial-honesty.mdc` — sempre ativa

## Checklist pós-bootstrap

Quando `package.json` e `pnpm-workspace.yaml` existirem:

- [ ] Validar `environment.json` com Cloud Agent de teste
- [ ] Confirmar hooks `post-edit-verify` e `session-verify` executam
- [ ] Adicionar GitHub Actions (lint, typecheck, test, build)
- [ ] Adicionar boundary tests em `tooling/ci/`
