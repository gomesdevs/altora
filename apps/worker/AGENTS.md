# apps/worker — Instruções para agentes

BullMQ + Redis. Trabalho assíncrono: importações, relatórios PDF, sync de cotações, parse de documentos.

## Responsabilidades

- Processar jobs da fila sem bloquear a API
- Importar CSV/PDF, gerar relatórios, sincronizar B3/cotações
- Extrair campos de documentos via pipeline IA

## Fazer

- Jobs **idempotentes** (reprocessar não duplica dados)
- Receber `tenant_id` no payload do job
- Delegar regras de negócio para `packages/domain`
- Registrar progresso e erros para retry com backoff
- Gerar audit log via API ou serviço compartilhado

## Não fazer

```typescript
// ❌ Duplicar cálculo de métricas patrimoniais
function computeYield(asset) { ... }

// ✅ Usar packages/domain
import { computeYield } from '@altora/domain';
```

```typescript
// ❌ Job sem tenant_id
await queue.add('import', { fileUrl });

// ✅ Sempre escopar
await queue.add('import', { tenantId, fileUrl, userId });
```

## Padrões

- Um processor por tipo de job
- Timeout e dead-letter queue para falhas persistentes
- Não manter estado pesado em memória — persistir no Postgres

## Referências

- [AGENTS.md raiz](../../AGENTS.md)
- [docs/06-stack-arquitetura.md](../../docs/06-stack-arquitetura.md#workers)
