# 🏛️ Arquitetura — FlowStudio AI

> Documento vivo com as decisões arquiteturais (ADRs) do projeto.  
> Atualizar sempre que uma decisão estrutural for tomada.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Implantação](#2-modelo-de-implantação)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Banco de Dados](#6-banco-de-dados)
7. [SSR e Server Functions](#7-ssr-e-server-functions)
8. [Decisões Registradas (ADRs)](#8-decisões-registradas-adrs)

---

## 1. Visão Geral

**FlowStudio AI** é uma plataforma-base white-label para studios de beleza, salões e barbearias.

### ⚠️ NÃO é um SaaS multi-tenant tradicional

O projeto opera com **implantação isolada por empresa**. Cada studio possui:

- Seu próprio deploy Netlify
- Seu próprio projeto Supabase
- Seu próprio banco de dados
- Sua própria landing page
- Sua própria identidade visual
- Seus próprios usuários, serviços, equipe e configurações

**Não existe compartilhamento de dados entre empresas.**

### Objetivos do modelo atual

- Simplicidade operacional
- Isolamento total de dados
- Segurança
- Facilidade de implantação
- Personalização por cliente
- Validação rápida do produto
- Escalabilidade futura controlada

---

## 2. Modelo de Implantação

```
┌──────────────────────────────────────────────────────────┐
│                    CÓDIGO-FONTE BASE                     │
│              (mesmo repo, mesma stack)                   │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ STUDIO A │    │ STUDIO B │    │ STUDIO C │
   ├──────────┤    ├──────────┤    ├──────────┤
   │ Netlify  │    │ Netlify  │    │ Netlify  │
   │ Supabase │    │ Supabase │    │ Supabase │
   │ Config   │    │ Config   │    │ Config   │
   │ Brand    │    │ Brand    │    │ Brand    │
   └──────────┘    └──────────┘    └──────────┘
```

Cada studio é uma **instância isolada e independente**.

---

## 3. Stack Tecnológica

### Frontend

- **TanStack React Start** — Framework SSR full-stack
- **TanStack Router** — Roteamento type-safe
- **React 18** — UI Library
- **TypeScript** — Linguagem
- **Tailwind CSS** — Estilização
- **Lucide React** — Ícones
- **Sonner** — Toast notifications

### Estado e Dados

- **React Query (TanStack Query)** — Cache de estado servidor
- **Zod** — Validação de schemas

### Backend

- **Supabase** — Postgres + Auth + Storage + Realtime
- **Supabase SSR** — Integração com SSR (cookies)

### Build e Deploy

- **Vite 5** — Build tool
- **Netlify** — Hospedagem (1 site por studio)

### Restrições

- ❌ Não usar microserviços
- ❌ Não usar Kubernetes
- ❌ Não usar event sourcing / CQRS
- ❌ Não adicionar novas libs sem justificativa técnica forte
- ✅ Sempre priorizar simplicidade e manutenibilidade

---

## 4. Estrutura de Pastas

> Estrutura alvo (será montada incrementalmente nos próximos blocos)

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Primitivos visuais (botão, input, etc)
│   ├── landing/          # Componentes da landing pública
│   └── admin/            # Componentes da área administrativa
├── config/               # Configurações
│   └── studio.config.ts  # Config específica do studio
├── lib/                  # Bibliotecas e utilitários
│   ├── env.ts            # Validação de variáveis de ambiente
│   ├── supabase/         # Clients Supabase (browser + server)
│   └── utils/            # Funções utilitárias
├── routes/               # Rotas TanStack Router
│   ├── __root.tsx        # Layout raiz
│   ├── index.tsx         # Landing pública (/)
│   ├── admin/            # Área administrativa
│   └── conta/            # Área do cliente
├── server/               # Server functions
│   ├── auth/             # Autenticação
│   ├── clients/          # CRUD de clientes
│   └── ...
├── types/                # Tipos TypeScript
│   ├── database.ts       # Tipos gerados do Supabase
│   └── studio.ts         # Tipos do studio
└── styles/               # Estilos globais
    └── globals.css
```

---

## 5. Autenticação e Autorização

### Provider

- **Supabase Auth** — JWT via cookies HTTP-only (SSR-safe)

### Roles

| Role | Descrição |
|---|---|
| `admin` | Dono(a) do studio. Acesso total. |
| `staff` | Equipe (profissionais). Acesso operacional. |
| `client` | Cliente final. Acesso a área pessoal. |

### Modelo de Permissões

- Armazenado em `user_roles` (relação `user_id` → `role`)
- Validação SSR via server functions
- Guards de rota antes de hidratação

---

## 6. Banco de Dados

### Tabelas Principais

| Tabela | Propósito |
|---|---|
| `profiles` | Dados estendidos dos usuários |
| `user_roles` | Mapeamento usuário → role |
| `clients` | Cadastro de clientes do studio |
| `staff` | Equipe do studio |
| `services` | Catálogo de serviços oferecidos |
| `appointments` | Agendamentos |
| `finance_transactions` | Movimentações financeiras |
| `leads` | Leads captados pela landing |
| `whatsapp_messages` | Histórico de mensagens WhatsApp |
| `whatsapp_settings` | Configurações da integração WhatsApp |
| `ai_messages` | Histórico de conversas com IA |

### Princípios

- **RLS (Row Level Security) ativo** em todas as tabelas
- **Cada studio = banco isolado**, portanto não há `tenant_id`
- **Tipos gerados automaticamente** via `supabase gen types`

---

## 7. SSR e Server Functions

### Princípio

Renderização inicial no servidor para:
- Performance percebida
- SEO da landing
- Hidratação progressiva

### Padrão Supabase SSR

- `createServerClient` → server-side (cookies + sessão)
- `createBrowserClient` → client-side (após hidratação)
- **Nunca** expor `service_role` no browser

### Server Functions

- Operações sensíveis sempre em server functions
- Validação Zod em entrada
- Tipagem ponta-a-ponta

---

## 8. Decisões Registradas (ADRs)

### ADR-001 — Modelo de implantação isolada por studio
- **Data**: 21/05/2026
- **Status**: Aceito
- **Contexto**: MVP precisa validar rápido sem complexidade multi-tenant.
- **Decisão**: 1 deploy + 1 Supabase por studio.
- **Consequência**: Implantação manual por cliente, mas isolamento total e simplicidade.

### ADR-002 — TanStack React Start como framework SSR
- **Data**: 21/05/2026
- **Status**: Aceito
- **Contexto**: Necessidade de SSR type-safe com bom DX.
- **Decisão**: TanStack Start em vez de Next.js/Remix.
- **Consequência**: Stack mais nova, comunidade menor, mas alinhada com TanStack Router e Query.

### ADR-003 — Vite 5 (não Vite 7) no MVP
- **Data**: 21/05/2026
- **Status**: Aceito (revisar em 6 meses)
- **Contexto**: TanStack Start latest pede Vite 7+, mas Vite 5 é estável e compatível em runtime.
- **Decisão**: Manter Vite 5 com `legacy-peer-deps`. Upgrade futuro planejado.
- **Consequência**: Warning cosmético no `npm ls`, sem impacto runtime.

### ADR-004 — Supabase Auth (não Clerk/Auth.js)
- **Data**: 21/05/2026
- **Status**: Aceito
- **Contexto**: Já estamos usando Supabase como backend.
- **Decisão**: Auth via Supabase Auth + cookies SSR.
- **Consequência**: Menos integrações, custo zero adicional, RLS integrado.

---

> Adicionar novos ADRs sempre que uma decisão estrutural for tomada.
