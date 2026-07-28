# apps/web — Instruções para agentes

Next.js App Router. Camada de apresentação — **sem regras de domínio patrimonial**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui
- TanStack Query (server state) + TanStack Table (tabelas)
- React Hook Form + Zod (forms)
- Recharts ou Visx (gráficos)

## Fazer

- Consumir API via TanStack Query com cache por tenant
- Validar forms com schemas Zod importados de `packages/domain`
- Usar componentes de `packages/ui` quando existirem
- Respeitar RBAC na UI (ocultar ações, não só desabilitar)
- Enviar `Authorization: Bearer` (sessão JWT) — nunca `x-tenant-id`

## Não fazer

```typescript
// ❌ Regra de yield ou concentração no componente
const yield = asset.rent / asset.value;

// ✅ Chamar API que usa packages/domain
const { data } = useQuery({ queryKey: ['portfolio', tenantId], ... });
```

```typescript
// ❌ Fetch direto em componente
useEffect(() => { fetch('/api/assets')... }, []);

// ✅ TanStack Query com hook dedicado
const { data } = useAssets(tenantId);
```

```typescript
// ❌ Calcular cenário what-if no browser
const projected = simulateScenario(portfolio, assumptions);

// ✅ Exibir resultado da API (motor what-if no backend)
const { data: scenario } = useScenario(scenarioId);
```

## Referências

- [AGENTS.md raiz](../../AGENTS.md)
- [docs/05-paginas-saas.md](../../docs/05-paginas-saas.md)
