# ADR-001: Monorepo com pnpm e Turborepo

**Status:** Aceito  
**Data:** 2025-07-27

## Contexto

A Altora terá frontend (Next.js), API (NestJS), workers (BullMQ) e motor what-if compartilhando tipos de domínio (`Asset`, `Portfolio`, `Scenario`, `Tenant`). Mudanças no modelo patrimonial precisam propagar de forma coordenada entre front e back.

Alternativas consideradas:

- **Multi-repo:** deploy independente, mas tipos duplicados e drift entre contratos
- **Monorepo sem ferramenta:** workspaces manuais, builds lentos e sem cache
- **Microserviços no dia 1:** complexidade prematura (ver doc 06)

## Decisão

Adotar **monorepo desde o dia 1** com **pnpm workspaces + Turborepo**.

Estrutura:

```
altora/
├── apps/
│   ├── web/          # Next.js
│   ├── api/          # NestJS
│   ├── worker/       # BullMQ
│   └── what-if/      # motor de simulação
├── packages/
│   ├── domain/       # tipos + regras de domínio
│   ├── db/           # schema + migrations
│   ├── ui/           # componentes compartilhados
│   └── config/       # eslint, tsconfig
└── tooling/
    └── ci/
```

## Consequências

**Positivas:**

- Tipos e schemas Zod/OpenAPI compartilhados entre apps
- Deploy coordenado quando regras de portfólio mudam
- Cache de build via Turborepo
- Um único lugar para ADRs, harness e documentação

**Negativas:**

- Curva de configuração inicial (turbo.json, workspaces)
- CI precisa orquestrar builds por pacote afetado

**Quando reavaliar:** time grande com equipes independentes, ou serviço com ciclo de release muito diferente — só quando doer.

## Referências

- [06 — Stack e Arquitetura](../06-stack-arquitetura.md#monorepo)
