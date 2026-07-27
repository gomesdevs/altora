# 05 — Páginas do SaaS

## Público (não autenticado)

| Página | Função |
|--------|--------|
| **Landing** | Proposta de valor, CTA para demo/cadastro |
| **Login** | Entrada na plataforma |
| **Cadastro** | Criação de conta / convite |
| **Recuperar senha** | Reset de credenciais |
| **Termos / Privacidade** | LGPD e compliance legal |

---

## App — Navegação principal

| Página | Função |
|--------|--------|
| **Home / Dashboard** | Visão patrimonial consolidada, KPIs, alertas, timeline |
| **Portfólio** | Lista de ativos com filtros (tipo, região, liquidez, entidade) |
| **Ativo [detalhe]** | Ficha completa — dados, documentos, performance, histórico |
| **Entidades** | Holdings, SPEs, famílias — estrutura multi-entidade |
| **Entidade [detalhe]** | Ativos, sócios e documentos de uma entidade |
| **What-If** | Hub de simulações — criar, comparar, versionar |
| **What-If [cenário]** | Editor com premissas, impacto e comparação |
| **Oportunidades** | Pipeline privado de co-investimentos |
| **Oportunidade [detalhe]** | Fit patrimonial, data room, decisão |
| **Relatórios** | Biblioteca de relatórios e templates |
| **Relatório [preview]** | Visualização e export PDF/Excel |
| **Documentos** | Repositório central por ativo/entidade |
| **Alertas** | Vencimentos, concentração, capital calls |
| **Colaboradores** | Usuários, permissões, convites |
| **Auditoria** | Log de ações na plataforma |
| **Configurações** | Perfil, entidade, política, integrações, billing |

---

## Modais e fluxos

| Modal / Fluxo | Função |
|---------------|--------|
| **Novo ativo** | Wizard por tipo (imóvel, FII, CRI, PE, etc.) |
| **Importar dados** | Planilha, PDF ou integração |
| **Conectar integração** | Open Finance, B3, corretora |
| **Novo cenário what-if** | Escolha do tipo de simulação |
| **Gerar relatório** | Template, período, escopo |
| **Convidar usuário** | Role e permissões |
| **Aprovação pendente** | Workflow de decisão |
| **Onboarding** | Setup guiado do primeiro patrimônio |

---

## Visão por persona

| Persona | Home | Acesso extra |
|---------|------|--------------|
| **Titular / patriarca** | Patrimônio total da família | Tudo |
| **CFO / controller** | Fluxos, vencimentos, operacional | Relatórios, documentos |
| **Consultor / MFO** | Multi-cliente — lista de famílias | Multi-tenant, white-label |
| **Contador** | Export fiscal, posição em data-base | Relatórios fiscais |
| **Advogado** | Estruturas societárias, contratos | Documentos, entidades |
| **Sucessor / filho** | Visão consolidada simplificada | Sem docs sensíveis |

---

## Estrutura de navegação

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Home  Portfólio  What-If  Oportunidades  Relatórios  [🔔] [User]  │
└─────────────────────────────────────────────────────────────┘

Sidebar (contextual):
  Portfólio  → Ativos | Entidades | Documentos
  What-If    → Meus cenários | Novo cenário
  Relatórios → Gerar | Histórico | Templates
  Admin      → Colaboradores | Auditoria | Integrações | Configurações
```

---

## Páginas hero (mais tempo do usuário)

| # | Página | Por quê |
|---|--------|---------|
| 1 | **Home / Dashboard** | Primeira impressão, retorno diário |
| 2 | **Portfólio** | Navegação no patrimônio |
| 3 | **What-If** | Diferencial competitivo |
| 4 | **Ativo [detalhe]** | Profundidade por ativo |
| 5 | **Relatórios** | Valor percebido para stakeholders |

---

## Inventário

| Tipo | Qtd |
|------|----:|
| Público | 5 |
| Core app | 14 |
| Modais / fluxos | 8 |
| Onboarding | 1 |
| **Total** | **~28 telas** |

---

## Mapeamento página → módulo

| Página | Módulo principal |
|--------|------------------|
| Dashboard | Dashboard + Portfólio |
| Portfólio / Ativo | Portfólio Unificado |
| Entidades | Portfólio + Governança |
| What-If | Simulador What-If |
| Oportunidades | Oportunidades e Matching |
| Relatórios | Compliance e Relatórios |
| Colaboradores / Auditoria | Governança |
| Configurações / Integrações | Administração + Integrações |
