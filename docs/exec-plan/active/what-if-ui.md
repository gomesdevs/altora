# Feature: What-If UI — simular cenário no browser

**Status:** active  
**Criado em:** 2026-07-27  
**ADR relacionados:** [ADR-003](../adr/003-what-if-snapshot-architecture.md), [ADR-001](../adr/001-monorepo-pnpm-turborepo.md)

## Objetivo

Página `/what-if` no Next.js para o usuário definir premissas de cenário e exibir o resultado persistido pela API — sem motor de simulação no frontend.

## Contexto

`POST /scenarios/simulate` já expõe snapshot → motor → resultado com INV-05/INV-06. Falta a UI de modelagem what-if alinhada ao dashboard patrimonial.

## Escopo

### Incluído

- [ ] Página `/what-if` com shadcn/ui + Tailwind
- [ ] Formulário de premissas (vacância, capital call, selic, FII, liquidação, sensibilidade…) via React Hook Form + Zod (`PremisesSchema`)
- [ ] `useMutation` TanStack Query → `POST /scenarios/simulate`
- [ ] Exibição: caixa 30/90/180/365, yield, concentração, disclaimer (INV-06)
- [ ] Testes de contrato mínimos (DTO da API, sem `simulate` no client)

### Fora de escopo

- Gráficos / sensibilidade trio na UI
- Auth real — header `x-tenant-id` stub
- Recalcular métricas no browser

## Critérios de aceite

- [ ] Submit envia `premises` à API; UI não importa `simulate` de `@altora/domain`
- [ ] Resultado mostra `cashFlow` nos quatro horizontes, yield antes/depois, `concentration.byClass`
- [ ] Disclaimer sempre visível quando há resultado; faixa de yield quando `confidence === low`
- [ ] `pnpm --filter web test` e `typecheck` verdes
- [ ] Link de navegação home/dashboard → `/what-if`

## Arquivos afetados (previstos)

| Área | Arquivos/pacotes |
|------|------------------|
| Web | `apps/web/src/app/what-if/**`, `src/lib/scenarios-api.ts`, `src/components/ui/**` |
| Web | Tailwind + shadcn base (`globals.css`, `tailwind.config.ts`) |

## Regras de domínio

- INV-06: disclaimer de modelagem; yield em faixa para confiança baixa
- What-if via snapshot na API — frontend só exibe resposta

## Definition of Done

- [ ] Critérios de aceite verificados
- [ ] Testes passam
- [ ] Spec movida para `completed/`

## Notas de implementação

- Tenant demo: `a1111111-1111-4111-8111-111111111111`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TENANT_ID`
