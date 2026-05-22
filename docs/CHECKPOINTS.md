# 📍 Checkpoints — FlowStudio AI

> Histórico de marcos técnicos do projeto.  
> Cada checkpoint representa um estado estável e validado da plataforma.

---

## Índice

- [CHECKPOINT 05 — Admin Layout Operacional](#checkpoint-05--admin-layout-operacional) — 22/05/2026
- [CHECKPOINT 04 — Saneamento de Tipos & Modelo de Role Única](#checkpoint-04--saneamento-de-tipos--modelo-de-role-única) — 22/05/2026
- [CHECKPOINT 03 — Auth SSR Operacional](#checkpoint-03--auth-ssr-operacional) — 21/05/2026
- [CHECKPOINT 02 — Schema Supabase Operacional](#checkpoint-02--schema-supabase-operacional) — 21/05/2026
- [CHECKPOINT 01 — Fundação](#checkpoint-01--fundação) — 21/05/2026

---

## CHECKPOINT 05 — Admin Layout Operacional

**Data**: 22/05/2026  
**Status**: ✅ Shell administrativo SSR navegável com sidebar responsiva, permissões e logout funcional  
**Responsável**: Willians  
**Próximo marco**: Guards por rota sensível + CRUD Services

---

### 🎯 Objetivo deste checkpoint

Entregar o **shell visual e estrutural da área administrativa** do FlowStudio AI, com layout mobile-first, navegação filtrada por permissão, identidade visual do studio, perfil do usuário logado e logout integrado ao Supabase Auth — tudo rodando sob SSR do TanStack React Start.

---

### ✅ Entregas

#### Camada de permissões consolidada

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth/permissions.ts` | Catálogo de permissões + `userHasPermission(user, permission)` |
| `src/lib/auth/types.ts` | `SessionUser` aceitando `null` em campos opcionais |

- ✅ Permissões granulares por feature (`dashboard.view`, `appointments.view`, `finance.view`, `whatsapp.view`, etc.)
- ✅ Mapeamento `AppRole → Permission[]` centralizado
- ✅ Helper `userHasPermission` consumido pelo layout para filtrar navegação

#### `AdminLayout` reescrito do zero

- ✅ **Sidebar desktop fixa** (≥768px) com logo, navegação e card de perfil
- ✅ **Header mobile + drawer** (<768px) com overlay, ESC para fechar e fechamento automático ao navegar
- ✅ **Navegação filtrada por permissão** — staff não vê Financeiro/WhatsApp
- ✅ **Active state correto** — `exact` em `/admin` para evitar match falso
- ✅ **Avatar com iniciais defensivas** — funciona mesmo com `fullName/email` nulos
- ✅ **Card de perfil** com nome + label PT-BR da role (`getRoleLabel`)
- ✅ **Logout funcional** — server function + `toast.success` + `router.invalidate()` + redirect
- ✅ **Identidade visual do studio** — logo consumindo `studio.config.ts`

#### Toaster global

- ✅ `<Toaster />` (Sonner) montado em `__root.tsx`
- ✅ Feedback visual de logout funcionando

#### Rota `/admin` enxuta

- ✅ `src/routes/admin/route.tsx` apenas com `beforeLoad` (guard) + `<AdminLayout>` envolvendo `<Outlet />`
- ✅ Toda lógica visual delegada para `src/components/layout/AdminLayout.tsx`

#### Validação TypeScript

```powershell
PS C:\FlowStudio AI> npx tsc --noEmit
PS C:\FlowStudio AI>   # ✅ Zero erros
```

#### Validação visual (localhost:3000/admin)

```
✅ Logo do studio renderizando
✅ Sidebar com 6 itens (admin)
✅ Dashboard ativo (fundo preto, texto branco)
✅ Avatar "WI" + nome "Willians" + role "ADMINISTRADOR"
✅ Botão Sair em vermelho
✅ <Outlet /> renderizando children da rota filha
```

---

### 🏗️ Arquitetura do shell administrativo

```
src/
├── components/
│   └── layout/
│       └── AdminLayout.tsx        ← Shell visual (sidebar + drawer + outlet)
├── lib/
│   └── auth/
│       ├── session.ts             ← getSession / requireSession
│       ├── permissions.ts         ← userHasPermission + catálogo
│       ├── roles.ts               ← getRoleLabel
│       └── types.ts               ← SessionUser
└── routes/
    ├── __root.tsx                 ← <Toaster /> global
    └── admin/
        ├── route.tsx              ← beforeLoad + <AdminLayout>
        └── index.tsx              ← dashboard placeholder
```

---

### ⚠️ Decisões arquiteturais firmadas

1. **Layout em `components/layout`, não em `routes/`** — reutilizável e desacoplado do roteador
2. **Permissões via helper único (`userHasPermission`)** — UI nunca checa role direto, sempre permissão
3. **Catálogo de permissões como string literal** (`'finance.view'`) — type-safe sem enum verboso
4. **Drawer mobile com `useEffect` para fechar ao navegar** — UX consistente
5. **Sidebar não rola junto com o conteúdo** — perfil sempre visível no rodapé
6. **Logout via server function + `router.invalidate()`** — sessão SSR invalidada corretamente
7. **Toaster global no `__root.tsx`** — disponível em qualquer rota sem prop drilling

---

### 🐛 Problemas resolvidos durante o checkpoint

#### Nomes de função/permissão divergentes da API real

- **Sintoma**: `canAccess is not exported` + permissões inexistentes
- **Causa raiz**: Geração inicial assumiu API antiga; helper real é `userHasPermission` e permissões usam notação `feature.action`
- **Solução adotada**: Alinhar imports e strings ao contrato real de `permissions.ts`
- **Status**: ✅ Resolvido

#### Campos `null` em `SessionUser` quebrando composição de UI

- **Sintoma**: `Type 'string | null' is not assignable to type 'string'` em iniciais e atributos HTML
- **Causa raiz**: `email`, `fullName`, `avatarUrl` agora são `string | null` (alinhado ao schema)
- **Solução adotada**: Iniciais defensivas + fallbacks (`user.fullName ?? user.email ?? 'Usuário'`)
- **Status**: ✅ Resolvido

#### Active state falso em `/admin`

- **Sintoma**: Item "Dashboard" ficava ativo em qualquer subrota `/admin/*`
- **Causa raiz**: `startsWith` matchava todas as filhas
- **Solução adotada**: Flag `exact` no item raiz + comparação estrita quando ativa
- **Status**: ✅ Resolvido

---

### 📊 Estado validado da aplicação

```
✅ npx tsc --noEmit              → 0 erros
✅ npm run dev                   → SSR ativo
✅ GET /admin                    → HTTP 200 com layout completo
✅ Sidebar admin                 → 6 itens visíveis
✅ Active state                  → Dashboard destacado
✅ Logout                        → toast + redirect /login
✅ Identidade visual             → logo do studio carregando
⚠️ Guards por subrota            → pendente (próximo bloco)
⚠️ Telas internas                → ainda placeholders
```

---

### 🔖 Tech debt atualizado

| ID | Item | Prioridade | Bloco previsto |
|---|---|---|---|
| TD-01 | Conflito Vite 7 ↔ TanStack Start (legacy-peer-deps) | Baixa | Pós-MVP |
| TD-02 | Functions de role transition (`promote_to_*`) | Média | BLOCO 7 |
| TD-03 | Tabelas WhatsApp + AI (removidas no reset) | Média | BLOCO 8 |
| TD-04 | Seed data para desenvolvimento local | Baixa | BLOCO 7 |
| TD-05 | Gerar `types.ts` real via `supabase gen types` | Alta | BLOCO 6 |
| TD-06 | Trocar `AppRole` manual pelo tipo gerado em `session.ts` | Alta | BLOCO 6 |
| TD-07 | Configurar `defaultNotFoundComponent` no router | Baixa | BLOCO 6 |
| TD-08 | Investigar `user_roles` em `types.ts` (resíduo legado?) | Média | BLOCO 6 |
| TD-09 | Limpar `env.ts` — remover `VITE_STUDIO_*` migradas | Média | BLOCO 6 |
| **TD-10** | **Testes E2E de permissão (staff não acessa `/admin/finance` via URL)** | **Alta** | **BLOCO 6** |
| **TD-11** | **Skeleton/Loading states padronizados para telas admin** | **Média** | **BLOCO 7** |

---

### 🎯 Próximos blocos (roadmap atualizado)

```
[BLOCO 6] → Guards por rota sensível  ⏳ (PRÓXIMO)
   ├── Helper requirePermission(user, permission)
   ├── beforeLoad em /admin/finance
   ├── beforeLoad em /admin/whatsapp
   ├── beforeLoad em /admin/services (write)
   ├── Página /403 (sem permissão)
   ├── defaultNotFoundComponent (TD-07)
   ├── Gerar types.ts real (TD-05/TD-06)
   └── Validação: staff bloqueado via URL direta

[BLOCO 7] → CRUD Services + Staff
[BLOCO 8] → CRUD Clients + Appointments
[BLOCO 9] → Landing pública + WhatsApp + AI
[BLOCO 10] → Finance + Leads
[BLOCO 11] → White-label config + Deploy Netlify padronizado
```

---

### 📝 Notas finais

O **shell administrativo** está operacional e visualmente coerente com a proposta premium do FlowStudio AI. A separação entre **layout reutilizável** (`components/layout`) e **rota** (`routes/admin/route.tsx`) garante manutenibilidade e abre caminho para shells alternativos (área do cliente, landing) sem retrabalho.

A partir daqui, o foco migra de **estrutura visual** para **proteção real de dados**: guards SSR por rota sensível, blindando o painel mesmo contra acesso direto via URL — última camada faltante antes de começar os CRUDs de domínio.

Pronto para iniciar o **BLOCO 6 — Guards por rota sensível**.

---

## CHECKPOINT 04 — Saneamento de Tipos & Modelo de Role Única

**Data**: 22/05/2026  
**Status**: ✅ Zero erros TypeScript, sessão alinhada ao schema real do banco  
**Responsável**: Willians  
**Próximo marco**: Auth SSR End-to-End (Login real + Guards exercitados)

---

### 🎯 Objetivo deste checkpoint

Realinhar a camada de tipagem da aplicação ao **schema real do Supabase**, eliminando resíduos do modelo legado de "múltiplas roles por usuário" e consolidando o paradigma de **role única por profile**, em conformidade com o enum `user_role` do banco.

---

### ✅ Entregas

#### Alinhamento `session.ts` ↔ schema real

- ✅ `SessionUser` reescrito com os campos reais da tabela `profiles`:
  - `id`, `email`, `fullName`, `phone`, `avatarUrl`, `role`, `isActive`
- ✅ `role` agora é **única** (`AppRole | null`), não array
- ✅ Bloqueio automático de usuário com `is_active = false` direto no `getSession()`
- ✅ Confirmação via Postgres: enum `user_role` = `{admin, staff, client}` ✅ bate com `AppRole`

#### Helpers de role centralizados

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth/session.ts` | `getSession`, `requireSession`, `hasRole`, `hasAnyRole`, `isAdmin`, `isStaff`, `isClient` |
| `src/lib/auth/roles.ts` | `getRoleLabel(role)` — mapa `AppRole → label PT-BR` |

#### Limpeza arquitetural

- ✅ Arquivo legado `src/lib/auth/role-helpers.ts` removido (era do modelo antigo de array de roles)
- ✅ Imports duplicados em `AdminLayout.tsx` resolvidos
- ✅ `AdminLayout.tsx` agora consome `user.role` direto, sem `getPrimaryRole()`
- ✅ Decisão deliberada: desativação de usuário tem efeito imediato (1 query SSR vs aguardar expiração JWT)

#### Validação TypeScript

```powershell
PS C:\FlowStudio AI> npx tsc --noEmit
PS C:\FlowStudio AI>   # ✅ Zero erros
```

---

### 🏗️ Modelo de role consolidado

```
profiles (Supabase)
├── id           uuid (FK auth.users)
├── email        text
├── full_name    text
├── phone        text
├── avatar_url   text
├── role         user_role  ← enum: admin | staff | client
├── is_active    boolean
├── created_at   timestamptz
└── updated_at   timestamptz

           ↓ mapeado por src/lib/auth/session.ts

SessionUser (app)
├── id          string
├── email       string | null
├── fullName    string | null
├── phone       string | null
├── avatarUrl   string | null
├── role        AppRole | null
└── isActive    boolean
```

---

### ⚠️ Decisões arquiteturais firmadas

1. **Role única por usuário** — alinhado ao schema; modelo de array de roles abandonado
2. **`is_active` checado no `getSession()`** — desativação imediata, sem esperar token expirar
3. **Helpers de role centralizados em `roles.ts`** — UI consome label, lógica fica em `session.ts`
4. **`AppRole` declarado manualmente** — ainda não usando tipo gerado do Supabase (TD-05/TD-06 mantidos)
5. **`role-helpers.ts` deletado** — eliminação de código morto do paradigma antigo

---

### 🐛 Problemas resolvidos durante o checkpoint

#### Erro de sintaxe em `session.ts:107`

- **Sintoma**: `TS1005: ')' expected.`
- **Causa raiz**: Arquivo herdado do modelo antigo com sintaxe incompleta
- **Solução adotada**: Reescrita completa do `session.ts` alinhada ao schema real
- **Status**: ✅ Resolvido

#### `Property 'roles' does not exist on type 'SessionUser'`

- **Sintoma**: `AdminLayout.tsx` consumia `user.roles` (array)
- **Causa raiz**: Código gerado assumindo modelo `user_roles` (tabela separada) que não existe no schema atual
- **Solução adotada**: Substituir por `user.role` (singular, vindo direto da `profiles`)
- **Status**: ✅ Resolvido

#### Duplicate identifier `getRoleLabel`

- **Sintoma**: Dois imports do mesmo símbolo — um de `role-helpers` (legado), outro de `roles` (novo)
- **Causa raiz**: Migração parcial deixou imports duplicados
- **Solução adotada**: Remover import legado + deletar arquivo `role-helpers.ts`
- **Status**: ✅ Resolvido

#### `Argument of type 'AppRole | null' is not assignable to parameter of type 'AppRole'`

- **Sintoma**: `getRoleLabel(user.role)` recusado pelo TS
- **Causa raiz**: Assinatura antiga do helper não aceitava `null`
- **Solução adotada**: `getRoleLabel(role: AppRole | null)` retorna `'Sem permissão'` quando null
- **Status**: ✅ Resolvido

---

### 📊 Estado validado da aplicação

```
✅ npx tsc --noEmit          → 0 erros
✅ Schema enum user_role     → {admin, staff, client}
✅ SessionUser tipado        → bate 100% com profiles
✅ AdminLayout consumindo    → user.role + getRoleLabel
✅ Código legado removido    → role-helpers.ts
⚠️ types.ts ainda placeholder → TD-05 pendente
⚠️ user_roles em types.ts    → resíduo a investigar
```

---

### 📝 Notas finais

A **fase de saneamento de tipagem** foi concluída com sucesso. A aplicação agora reflete fielmente o schema real do banco, eliminando dívidas técnicas herdadas de templates e iterações anteriores. O modelo de **role única** está consolidado em todas as camadas (banco → server function → componente UI).

---

## CHECKPOINT 03 — Auth SSR Operacional

**Data**: 21/05/2026  
**Status**: ✅ SSR funcional, Supabase clients integrados, sessão preparada  
**Responsável**: Willians  
**Próximo marco**: Guards de Rota SSR + Página de Login mobile-first

---

### 🎯 Objetivo deste checkpoint

Estabelecer a **camada de autenticação SSR** do FlowStudio AI usando TanStack React Start + Supabase SSR, com clients isolados (browser vs server), tipagem de variáveis de ambiente e server functions de sessão prontas para alimentar guards de rota.

---

### ✅ Entregas

#### Camada de ambiente tipado

- ✅ `src/lib/env.ts` — variáveis validadas e tipadas
- ✅ Separação de envs públicas (`VITE_*`) vs privadas
- ✅ Erro explícito em runtime se variável obrigatória faltar
- ✅ `.env.local` configurado com Supabase URL + anon key do studio

#### Supabase Clients (isolamento browser/server)

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/supabase/client.ts` | Client do **browser** (singleton, `createBrowserClient`) |
| `src/lib/supabase/server.ts` | Client do **servidor** (cookies via `getWebRequest`, `createServerClient`) |
| `src/lib/supabase/types.ts` | Placeholder de tipos (será gerado no próximo bloco) |

#### Server Functions de sessão

- ✅ `getSessionUser` — server function que lê `auth.getUser()` + `user_roles` + `profiles`
- ✅ Retorna `SessionUser | null` tipado (id, email, fullName, roles)
- ✅ Alias semântico `getSession` para uso em loaders
- ✅ Helpers de role: `hasRole`, `isAdmin`, `isStaff`

#### Guards de rota (estrutura pronta)

Funções já implementadas em `src/lib/auth/guards.ts`, aguardando consumo nas rotas do BLOCO 4:

- `requireAuth()` — exige sessão, redireciona pra `/auth/login`
- `requireRole(role)` — exige role específica
- `requireAdmin()` — atalho pra admin
- `requireStaff()` — atalho pra staff (admin também passa)

#### Router entry alinhado com TanStack Start ≥ 1.168

- ✅ `src/router.tsx` exporta **`getRouter()`** (contrato novo do framework)
- ✅ `QueryClient` instanciado por request (SSR-safe)
- ✅ Context do router preparado pra receber `user` nos próximos blocos

---

### 🏗️ Arquitetura da camada de Auth

```
┌─────────────────────────────────────────────┐
│ BROWSER                                     │
│   src/lib/supabase/client.ts                │
│   └─ createBrowserClient (singleton)        │
└─────────────────────────────────────────────┘
                  ↕ cookies HTTP-only
┌─────────────────────────────────────────────┐
│ SERVIDOR (SSR)                              │
│   src/lib/supabase/server.ts                │
│   └─ createServerClient(getWebRequest)      │
│                  ↓                          │
│   src/lib/auth/session.ts                   │
│   └─ getSessionUser (server function)       │
│                  ↓                          │
│   src/lib/auth/guards.ts                    │
│   └─ requireAuth/Role/Admin/Staff           │
└─────────────────────────────────────────────┘
```

---

### ⚠️ Decisões arquiteturais firmadas

1. **Browser e Server clients separados** — nunca compartilhar instância entre contextos
2. **Cookies via TanStack Start** — `getWebRequest()` + `parseCookieHeader/serializeCookieHeader`
3. **Server functions ao invés de loaders diretos** — encapsulam regra de auth e são reutilizáveis
4. **`AppRole` declarado manualmente em `session.ts`** — temporário até gerar tipos do Supabase (BLOCO 4)
5. **`getRouter()` como contrato** — alinhado com `@tanstack/react-start@1.168.9`
6. **Sem AuthContext React global** — sessão flui via context do router (SSR-first)

---

### 🐛 Problemas resolvidos durante o checkpoint

#### Conflito de versão Vite ↔ TanStack Start

- **Sintoma**: `npm install` falhando com peer dependency conflict
- **Causa raiz**: TanStack Start 1.168 ainda não suportava Vite 7 oficialmente
- **Solução adotada**: `--legacy-peer-deps` no install (registrado como TD-01)
- **Status**: ✅ Resolvido (workaround)

#### `types.ts` vazio quebrando imports do `session.ts`

- **Sintoma**: TypeScript não encontrava `Database["public"]["Enums"]["app_role"]`
- **Causa raiz**: `types.ts` é placeholder (será gerado no próximo bloco), mas `session.ts` já tentava consumir
- **Solução adotada**: Declarar `AppRole` manualmente em `session.ts` com comentário `TODO Bloco 4`
- **Status**: ✅ Resolvido (com melhoria planejada)

#### `TypeError: entries.routerEntry.getRouter is not a function`

- **Sintoma**: SSR retornando HTTP 500 ao acessar `/`
- **Causa raiz**: `router.tsx` exportava `createRouter()`, mas `@tanstack/react-start@1.168` exige `getRouter()`
- **Solução adotada**: Renomear factory `createRouter` → `getRouter` + atualizar declaration merging
- **Status**: ✅ Resolvido

#### Cache do Vite + `routeTree.gen.ts` desatualizado

- **Sintoma**: Erros fantasmas após refatoração
- **Solução adotada**: Pipeline de limpeza: `rm -rf node_modules/.vite && rm src/routeTree.gen.ts && npm run dev`
- **Status**: ✅ Resolvido (procedimento documentado)

---

### 📊 Estado validado da aplicação

```
✅ npm run dev → sem erros
✅ GET http://localhost:3000/ → HTTP 200
✅ Página renderizada (header, nav, footer)
✅ SSR ativo (HTML completo no first paint)
✅ Vite HMR funcional
⚠️ notFoundComponent não configurado (cosmético, BLOCO 4)
```

---

### 📝 Notas finais

A camada de Auth SSR está **estruturalmente pronta**, mas ainda não exercitada por um fluxo real de login. O BLOCO 4 vai validar end-to-end, sincronizar tipos e polir UX.

Importante: o **schema do banco continua sendo a fonte de verdade**. A camada de app apenas consome com segurança (RLS no banco + guards no SSR).

---

## CHECKPOINT 02 — Schema Supabase Operacional

**Data**: 21/05/2026  
**Status**: ✅ Banco de dados estruturado, seguro e validado  
**Responsável**: Willians  
**Próximo marco**: Auth SSR (Supabase Clients + Server Functions + Guards)

---

### 🎯 Objetivo deste checkpoint

Substituir o schema inicial (criado por templates anteriores do Supabase) por uma **arquitetura de banco coesa, tipada, isolada e segura**, alinhada ao modelo de negócio do FlowStudio AI (1 Supabase por studio, sem multi-tenancy).

---

### ✅ Entregas

#### Reset destrutivo controlado

- ✅ Drop completo do schema `public` anterior (tabelas, enums, functions, triggers)
- ✅ Remoção do enum órfão `app_role` (resíduo de template Supabase)
- ✅ Limpeza de `auth.users` (usuário de teste pré-existente)
- ✅ Validação pós-reset: 0 tabelas, 0 enums, 0 functions, 0 users

#### Migrations idempotentes (9 arquivos)

| # | Arquivo | Conteúdo |
|---|---|---|
| 001 | `001_enums.sql` | 6 enums tipados (`user_role`, `appointment_status`, etc) |
| 002 | `002_profiles.sql` | Tabela `profiles` + RLS + policies |
| 003 | `003_clients.sql` | Tabela `clients` + RLS + policies |
| 004 | `004_staff.sql` | Tabela `staff` + RLS + policies |
| 005 | `005_services.sql` | Tabela `services` + RLS + policies |
| 006 | `006_appointments.sql` | Tabela `appointments` + RLS + policies |
| 007 | `007_finance.sql` | Tabela `finance_transactions` + RLS + policies |
| 008 | `008_leads.sql` | Tabela `leads` + RLS + policies |
| 009 | `009_triggers.sql` | Function `handle_new_user` + trigger automático |

> 📌 Tabelas `whatsapp_messages`, `whatsapp_settings` e `ai_messages` **foram removidas** do schema inicial — serão reintroduzidas no BLOCO 9 com modelagem própria.

#### Enums consolidados

```sql
user_role            → 'admin' | 'staff' | 'client'
appointment_status   → 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
transaction_type     → 'income' | 'expense'
transaction_category → categorias financeiras tipadas
lead_source          → 'whatsapp' | 'instagram' | 'landing' | 'manual' | 'other'
lead_status          → 'new' | 'contacted' | 'converted' | 'lost'
```

#### Row Level Security (RLS)

- ✅ RLS habilitado em todas as tabelas de domínio
- ✅ Policies de leitura/escrita segmentadas por role:
  - `admin`: acesso total ao studio
  - `staff`: acesso operacional limitado
  - `client`: acesso apenas aos próprios dados
- ✅ Função helper `current_user_role()` para evitar recursão em policies

#### Automações de banco

- ✅ Function `handle_new_user()` (SECURITY DEFINER):
  - Lê `raw_user_meta_data` do `auth.users`
  - Cria `profile` automaticamente
  - Cria registro em `clients` ou `staff` conforme role
- ✅ Trigger `on_auth_user_created` em `auth.users` (AFTER INSERT)
- ✅ Function `set_updated_at()` para timestamps automáticos
- ✅ Function `current_user_role()` para policies sem recursão

#### Usuário admin operacional

- ✅ Usuário `williansdavid@gmail.com` criado via Dashboard
- ✅ Email auto-confirmado
- ✅ Profile criado automaticamente pelo trigger
- ✅ Promovido para `admin` via UPDATE
- ✅ Registro órfão em `clients` removido
- ✅ Validação final: `role=admin`, `is_active=true`, sem inconsistências

---

### 🏗️ Modelo de dados final

```
auth.users (Supabase)
    ↓ (1:1 via trigger)
profiles (id, email, full_name, phone, role, is_active)
    ↓
    ├─→ clients      (se role='client')
    ├─→ staff        (se role='staff')
    └─→ admin        (sem tabela extra)

services ──┐
staff ─────┼──→ appointments ──→ finance_transactions
clients ───┘

leads (captação independente)
```

---

### ⚠️ Decisões arquiteturais firmadas

1. **1 profile por usuário do auth** — relacionamento 1:1 via `profiles.id = auth.users.id`
2. **Separação client/staff em tabelas próprias** — atributos específicos de cada perfil
3. **Admin sem tabela extra** — apenas `role='admin'` no profile
4. **RLS como primeira linha de defesa** — toda query passa por policy
5. **Trigger automático** — zero chance de criar user sem profile
6. **Enums tipados** — sem strings livres em campos de estado
7. **Migrations idempotentes** — uso de `if not exists` / `create or replace`
8. **Sem soft delete genérico** — apenas `is_active` onde faz sentido de negócio

---

### 🐛 Problemas resolvidos durante o checkpoint

#### Schema legado conflitando com novas migrations

- **Sintoma**: Erro `42P07: relation "profiles" already exists` ao rodar migration 002
- **Causa raiz**: Template/quickstart anterior do Supabase já havia criado `profiles` e o enum `app_role`
- **Solução adotada**: Reset destrutivo completo do schema `public` + recriação a partir das 9 migrations limpas
- **Status**: ✅ Resolvido

#### Enum órfão `app_role`

- **Sintoma**: Conflito de nomenclatura com nosso enum `user_role`
- **Causa raiz**: Resíduo de setup anterior do Supabase
- **Solução adotada**: `drop type if exists public.app_role cascade` no reset
- **Status**: ✅ Resolvido

#### Erro de sintaxe em PL/pgSQL após paste

- **Sintoma**: `42601: syntax error at end of input` na function `handle_new_user`
- **Causa raiz**: Quebras de linha perdidas no paste, fazendo `--` comentário cobrir o `begin/end` do bloco
- **Solução adotada**: Reescrita preservando quebras de linha + boas práticas de formatação PL/pgSQL
- **Status**: ✅ Resolvido

#### Registro órfão em `clients` após promoção de admin

- **Sintoma**: Trigger criou registro em `clients` antes do usuário ser promovido a admin
- **Causa raiz**: Trigger usa role default `client` quando `raw_user_meta_data` não traz role explícita
- **Solução adotada**: `DELETE` manual do registro órfão pós-promoção
- **Tech debt**: Criar functions `promote_to_admin(id)` / `promote_to_staff(id)` / `demote_to_client(id)` no próximo bloco
- **Status**: ✅ Resolvido (com melhoria planejada)

---

### 📊 Estado validado do banco

```sql
-- Query de validação final executada:
select p.email, p.full_name, p.role, p.is_active, ...

-- Resultado:
[
  {
    "email": "williansdavid@gmail.com",
    "full_name": "Willians",
    "role": "admin",
    "is_active": true,
    "has_client": false,
    "has_staff": false
  }
]
```

✅ Sem inconsistências. Banco pronto para o app consumir.

---

### 📝 Notas finais

Schema do Supabase agora é a **fonte de verdade do domínio**. Toda regra de negócio crítica (RLS, automações, integridade referencial) está no banco, não no app.

Isso garante:

- ✅ **Segurança por padrão** — RLS bloqueia acesso indevido mesmo se o app falhar
- ✅ **Consistência** — trigger garante que não existe user sem profile
- ✅ **Portabilidade** — replicar o schema em um novo studio é rodar 9 SQLs
- ✅ **Tipagem forte** — enums protegem contra valores inválidos

---

## CHECKPOINT 01 — Fundação

**Data**: 21/05/2026  
**Status**: ✅ Stack inicial operacional  
**Responsável**: Willians  
**Próximo marco**: Schema Supabase Operacional

---

### 🎯 Objetivo deste checkpoint

Bootstrap inicial do projeto FlowStudio AI com a stack oficial: TanStack React Start (SSR), Supabase, TypeScript, Tailwind, Vite e Netlify como target de deploy.

---

### ✅ Entregas

- ✅ Projeto Vite + TanStack React Start instalado
- ✅ TypeScript configurado
- ✅ Tailwind CSS funcional
- ✅ Estrutura de pastas inicial em `src/`
- ✅ Supabase project criado para o studio piloto
- ✅ `.env.local` com URL + anon key
- ✅ `npm run dev` operacional

---

### 📝 Notas finais

Fundação técnica estabelecida. A partir daqui, todo desenvolvimento ocorre com a stack oficial congelada e a arquitetura **deploy isolado por studio** como princípio norteador.
