# Feature: What-If UI — simular cenário no browser

**Status:** completed  
**Criado em:** 2026-07-27  
**Concluído em:** 2026-07-27  
**ADR relacionados:** [ADR-003](../adr/003-what-if-snapshot-architecture.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Página `/what-if` no Next.js para o usuário definir premissas de cenário e exibir o resultado persistido pela API — sem motor de simulação no frontend.

## Contexto

`POST /scenarios/simulate` já expõe snapshot → motor → resultado com INV-05/INV-06. Falta a UI de modelagem what-if alinhada ao dashboard patrimonial.

## Escopo

### Incluído

- [x] Página `/what-if` com shadcn/ui + Tailwind
- [x] Formulário de premissas (vacância, capital call, selic, FII, liquidação, sensibilidade…) via React Hook Form + Zod (`PremisesSchema`)
- [x] `useMutation` TanStack Query → `POST /scenarios/simulate`
- [x] Exibição: caixa 30/90/180/365, yield, concentração, disclaimer (INV-06)
- [x] Testes de contrato mínimos (DTO da API, sem `simulate` no client)

### Fora de escopo

- Gráficos / sensibilidade trio na UI
- Auth real — header `x-tenant-id` stub
- Recalcular métricas no browser

## Critérios de aceite

- [x] Submit envia `premises` à API; UI não importa `simulate` de `@altora/domain`
- [x] Resultado mostra `cashFlow` nos quatro horizontes, yield antes/depois, `concentration.byClass`
- [x] Disclaimer sempre visível quando há resultado; faixa de yield quando `confidence === low`
- [x] `pnpm --filter web test` e `typecheck` verdes
- [x] Link de navegação home/dashboard → `/what-if`

## Arquivos afetados

| Área | Arquivos/pacotes |
|------|------------------|
| Web | `apps/web/src/app/what-if/**`, `src/lib/scenarios-api.ts`, `src/components/ui/**` |
| Web | Tailwind + shadcn base (`globals.css`, `tailwind.config.ts`) |

## Regras de domínio

- INV-06: disclaimer de modelagem; yield em faixa para confiança baixa
- What-if via snapshot na API — frontend só exibe resposta

## Definition of Done

- [x] Critérios de aceite verificados
- [x] Testes passam
- [x] Spec movida para `completed/`

## Notas de implementação

- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TENANT_ID`
- `PremisesSchema` valida o payload montado no submit; motor `simulate` só na API
- Componentes shadcn: Button, Input, Label, Card, Alert
