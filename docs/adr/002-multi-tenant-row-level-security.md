# ADR-002: Multi-tenant com Row-Level Security

**Status:** Aceito  
**Data:** 2025-07-27

## Contexto

A Altora é SaaS B2B: family offices, gestoras e consultores compartilham a mesma infraestrutura mas nunca podem ver dados de outro cliente. Vazamento cross-tenant é risco existencial (patrimônio, LGPD, confiança).

Alternativas consideradas:

- **Isolamento só na API:** depende de disciplina humana/agente; um `WHERE` esquecido vaza dados
- **Database por tenant:** isolamento forte, mas custo operacional alto no início
- **tenant_id + RLS + checagem na API:** defesa em profundidade

## Decisão

Implementar multi-tenant com **três camadas**:

1. **Schema:** todo registro patrimonial tem `tenant_id` (NOT NULL, indexado)
2. **API:** guards NestJS validam tenant do JWT antes de qualquer operação; repositories sempre filtram por `tenant_id`
3. **PostgreSQL:** Row-Level Security (RLS) como rede de segurança no banco

Hierarquia de dados:

```
Tenant
 └── Entidades (holding, SPE, pessoa)
      └── Ativos, Documentos, Cenários
 └── Usuários + roles
 └── Audit log
```

Regras adicionais:

- Colaborador externo só vê escopo liberado (RBAC por entidade/ativo)
- Campos sensíveis (CPF, documentos) com criptografia em coluna
- Audit log append-only por tenant

## Consequências

**Positivas:**

- Defesa em profundidade: API + banco
- Agentes de IA têm regra mecânica verificável (`tenant_id` em toda query)
- Escalável para centenas de tenants na mesma instância

**Negativas:**

- Toda migration e query exige disciplina de `tenant_id`
- Testes precisam de fixtures multi-tenant
- RLS adiciona complexidade em migrations e debugging

## Referências

- [06 — Stack e Arquitetura](../06-stack-arquitetura.md#multi-tenant)
- [Glossário: Tenant](../domain/glossary.md#tenant)
