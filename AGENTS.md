# Altora — Instruções para agentes

Sistema operacional do patrimônio alternativo brasileiro. Contexto de produto: [docs/README.md](docs/README.md).

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** NestJS + PostgreSQL + Redis + BullMQ
- **Monorepo:** pnpm workspaces + Turborepo
- **Detalhes:** [docs/06-stack-arquitetura.md](docs/06-stack-arquitetura.md)

## Regras inegociáveis

1. **Multi-tenant:** toda query e mutation filtra por `tenant_id`. Sem exceção.
2. **Domínio em `packages/domain`:** regras patrimoniais nunca em `apps/web` nem em controllers.
3. **What-If via snapshot:** snapshot versionado → motor → resultado persistido. Nunca calcular simulação no frontend.
4. **Sem precisão falsa:** PE e imóvel retornam intervalos e nível de confiança. Ver [docs/04-what-if.md](docs/04-what-if.md).
5. **Audit log:** toda mutação patrimonial gera evento append-only.

## Onde ler antes de codar

| Recurso | Quando usar |
|---------|-------------|
| [docs/exec-plan/active/](docs/exec-plan/active/) | Spec da feature em andamento |
| [docs/domain/glossary.md](docs/domain/glossary.md) | Termos canônicos (Ativo, Snapshot, Tenant…) |
| [docs/adr/](docs/adr/) | Decisões arquiteturais aceitas |
| AGENTS.md por pacote | Regras específicas do app/pacote |

### AGENTS.md por pacote

- [apps/web/AGENTS.md](apps/web/AGENTS.md) — Next.js, UI
- [apps/api/AGENTS.md](apps/api/AGENTS.md) — NestJS, RBAC, orquestração
- [apps/worker/AGENTS.md](apps/worker/AGENTS.md) — BullMQ, jobs assíncronos
- [apps/what-if/AGENTS.md](apps/what-if/AGENTS.md) — motor de simulação
- [packages/domain/AGENTS.md](packages/domain/AGENTS.md) — tipos e regras puras
- [packages/db/AGENTS.md](packages/db/AGENTS.md) — schema, migrations, RLS

## Fluxo de trabalho

1. Ler spec em `docs/exec-plan/active/` (se existir)
2. Ler glossário e ADRs relevantes
3. Implementar no pacote correto (respeitar fronteiras)
4. Atualizar documentação se comportamento mudou
5. **Commitar** cada mudança lógica concluída (ver Git abaixo)
6. Mover spec para `docs/exec-plan/completed/`

## Git — commits e push

**Agentes devem commitar; push é sempre do humano.**

| Ação | Agente | Humano |
|------|--------|--------|
| `git add` + `git commit` | Sim — após cada mudança lógica | Opcional |
| `git push` | **Nunca** | Sim — quando quiser publicar |

### Quando commitar

- Ao concluir uma unidade de trabalho (feature, fix, doc, harness, ADR)
- Um commit por mudança lógica — não acumular tudo no final da sessão
- Antes de encerrar a sessão, se houver alterações pendentes

### Mensagens de commit

Formato: `tipo(escopo): descrição imperativa`

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação, ADRs, harness |
| `chore` | Tooling, config, hooks |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Testes |

Exemplos:

```
docs(harness): add domain golden fixtures for what-if scenarios
feat(domain): implement calculateStructuralLiquidity
chore(cursor): block git push in agent hook
```

### Proibido para agentes

- `git push` (qualquer branch)
- `git push --force`
- `git config`
- `git reset --hard`
- Commitar `.env`, credenciais ou secrets

## Comandos (quando monorepo existir)

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Definition of Done

- [ ] Testes passam (`pnpm test`)
- [ ] `tenant_id` em toda operação de dados
- [ ] Tipos compartilhados via `packages/domain`
- [ ] Sem lógica de simulação no frontend
- [ ] Audit log em mutações patrimoniais
- [ ] Spec movida para `completed/` se aplicável

## Cursor Cloud

Ambiente remoto configurado em [`.cursor/environment.json`](.cursor/environment.json). Ativar quando `pnpm-workspace.yaml` existir.

Bootstrap esperado:

```bash
pnpm install
docker compose up -d postgres redis
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Secrets via Cursor Dashboard — nunca commitar `.env` ou credenciais.

## Harness

Documentação completa do harness de IA: [docs/harness/README.md](docs/harness/README.md)
