# 🏛️ FlowStudio AI — Arquitetura

> **Última atualização:** 02/06/2026
> **Versão:** 1.0
> **Mantenedor:** Willians + FlowStudio AI Architect

---

## 1. Visão geral

O **FlowStudio AI** é uma plataforma **white-label** para studios de beleza, salões e barbearias.

**NÃO** é um SaaS multi-tenant tradicional. A arquitetura é de **implantação isolada por empresa**:

```
Mesmo código-fonte base
        +
Deploy Netlify individual por studio
        +
Supabase individual por studio
        +
Config + Branding individual por studio
```

### Objetivos arquiteturais

- ✅ Simplicidade operacional
- ✅ Isolamento total de dados
- ✅ Segurança por design (cada studio = ambiente próprio)
- ✅ Facilidade de implantação
- ✅ Personalização visual por cliente
- ✅ Escalabilidade futura sem comprometer o MVP

---

## 2. Stack oficial

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework SSR | TanStack React Start | 1.168.9 |
| Roteamento | TanStack Router | 1.170.6 |
| Estado servidor | React Query | 5.59+ |
| UI Framework | React | 18.3.1 |
| Linguagem | TypeScript | 5.6+ |
| Backend / DB / Auth | Supabase (SSR) | 0.5.2 |
| Estilização | Tailwind CSS | 3.4+ |
| Animação | Framer Motion | 11.18 |
| Build | Vite | 7.3 |
| Deploy | Netlify | — |
| Ícones | Lucide React | 0.453+ |
| Toast | Sonner | 1.5+ |
| Validação | Zod | 3.25+ |

> ⚠️ **Nunca adicionar dependências fora dessa lista sem justificativa técnica forte.**

---

## 3. Zonas do projeto (regra de ouro)

O projeto possui **2 zonas distintas** com regras de manutenção próprias:

### 🔵 ZONA NÚCLEO — `src/` (exceto `sites/`)

**O que é:** Core compartilhado do FlowStudio AI. Reutilizado por todos os studios.

**Diretórios:**

```
src/
├── components/    → UI compartilhada (AdminLayout, ui/, shared/, feedback/, auth/)
├── config/        → Config global (studio.config.ts)
├── core/          → Núcleo da aplicação
├── features/      → Lógica de domínio por módulo (CRUDs, hooks, queries)
├── hooks/         → Hooks globais reutilizáveis
├── lib/           → Auth, Supabase, branding, utils, date, masks, query
├── routes/        → Roteamento TanStack (file-based)
├── server/        → Server functions SSR (por domínio)
├── styles/        → Temas globais e tokens
└── types/         → Tipos globais
```

**Quando alterar:** Sempre que evoluir funcionalidade do admin ou core.

### 🟢 ZONA STUDIO — `src/sites/<studio>/`

**O que é:** Configuração, conteúdo, branding e seções específicas de **um studio**.

**Estrutura padrão:**

```
src/sites/ruah/
├── components/    → Sections, layout (Header/Footer), floating, icons, motion
├── config/        → branding.ts, content.ts, identity.ts, businessHours.ts, seo/
├── docs/          → Documentação específica do studio
├── lib/           → Helpers do studio (hours, whatsapp)
├── styles/        → CSS específico (base, footer, gallery, hours, animations)
├── types/         → Tipos do studio
└── utils/         → Utilitários (buildBrandingCss, buildSeo, useReveal)
```

**Quando alterar:** Customização visual/conteúdo do studio. **NÃO** afeta outros studios.

### 🔒 Regras invioláveis

1. **Núcleo nunca importa de `sites/`** — só o contrário é permitido.
2. **Sites nunca alteram core diretamente** — extensões via config/props.
3. **Studio config alimenta o admin** — admin é genérico, lê `studioConfig`.
4. **Cada studio tem seu Supabase isolado** — zero cross-studio.

---

## 4. Roteamento e SSR

### Padrão file-based (TanStack Router)

```
src/routes/
├── __root.tsx         → Layout raiz (providers globais)
├── index.tsx          → Landing pública do studio (rota "/")
├── login.tsx          → Login
├── 403.tsx            → Forbidden
└── admin/
    ├── route.tsx      → Layout admin + guard de role
    ├── index.tsx      → Dashboard
    ├── appointments.tsx
    ├── calendar.tsx
    ├── clients.tsx
    ├── services.tsx
    ├── staff.tsx
    ├── finance.tsx
    ├── whatsapp.tsx
    └── settings.tsx
```

### Padrão de guard SSR

Toda rota protegida usa `beforeLoad` com checagem de permissão:

```ts
export const Route = createFileRoute('/admin/clients')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'clients.view');
  },
  component: ClientsRouteComponent,
});
```

### Padrão de loader SSR (recomendado)

Dados críticos devem ser carregados via `loader` para hidratação imediata:

```ts
loader: async ({ context }) => {
  const services = await listServices();
  return { services };
}
```

---

## 5. Sistema de autenticação

### Estrutura

```
src/lib/auth/
├── session.ts       → requireRole, requirePermission, getSession
├── types.ts         → SessionUser
├── roles.ts         → admin, staff, client + labels
├── permissions.ts   → userHasPermission(user, permission)
└── logout.ts        → logout flow
```

### Roles disponíveis

| Role | Acesso |
|------|--------|
| `admin` | Total |
| `staff` | Operacional (sem settings/team) |
| `client` | Área do cliente (futuro) |

### Permissions granulares

Exemplos: `dashboard.view`, `appointments.view`, `clients.view`, `services.view`, `team.manage`, `finance.view`, `whatsapp.view`, `settings.manage`.

**Toda nav do AdminLayout é filtrada via `userHasPermission`.**

---

## 6. Padrão Feature-Based

Cada domínio do admin segue a mesma estrutura:

```
src/features/<dominio>/
├── index.ts              → Barrel exports
├── types.ts              → Tipos do domínio
├── queries.ts            → React Query keys + fetchers
├── hooks.ts              → Hooks customizados (useXxxList, useXxxMutation)
└── components/
    ├── XxxList.tsx
    ├── XxxFormDialog.tsx
    ├── XxxFiltersBar.tsx
    └── XxxBadge.tsx
```

### Convenções

- **`queries.ts`** → exporta `xxxQueries` (objeto com `list`, `byId`, etc.) + `xxxKeys`
- **`hooks.ts`** → exporta hooks de leitura (`useXxxList`) e mutações (`useCreateXxx`)
- **Components** → usam apenas hooks da própria feature, nunca chamam Supabase direto

---

## 7. Server Functions

Lógica de escrita/leitura sensível roda em **server functions** (TanStack Start):

```
src/server/<dominio>/
├── _shared.ts                → Validações, helpers, auth checks
├── list-<dominio>.ts         → SELECT
├── create-<dominio>.ts       → INSERT
├── update-<dominio>.ts       → UPDATE
└── toggle-<dominio>-active.ts → soft-toggle
```

### Padrão

- Toda server function valida sessão + permissão
- Toda entrada validada com **Zod**
- Erros tipados retornados ao cliente

---

## 8. Supabase

### Convenções

- **Um projeto Supabase por studio** (isolamento total)
- Autenticação via `@supabase/ssr`
- Types gerados via `npm run db:types`

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (1:1 com auth.users) |
| `user_roles` | Role do usuário no studio |
| `clients` | Clientes do studio |
| `staff` | Equipe (cabeleireiros, barbeiros, etc.) |
| `services` | Serviços oferecidos |
| `appointments` | Agendamentos |
| `finance_transactions` | Movimentação financeira |
| `leads` | Leads da landing |
| `whatsapp_messages` | Mensagens WhatsApp |
| `whatsapp_settings` | Config WhatsApp |
| `ai_messages` | Histórico do chat IA |

---

## 9. Studio Config

Cada studio expõe sua configuração via `src/sites/<studio>/config/`:

| Arquivo | Conteúdo |
|---------|----------|
| `branding.ts` | Cores, fontes, logos, tema visual |
| `content.ts` | Textos institucionais, hero, about, gallery |
| `identity.ts` | Nome, slogan, telefone, endereço, redes |
| `businessHours.ts` | Horários de funcionamento |
| `seo/jsonLd.ts` | Schema.org JSON-LD |

O admin lê `@/config/studio.config` que aponta para o studio ativo (definido em build/env).

---

## 10. Deploy

- **Plataforma:** Netlify
- **Plugin:** `@netlify/vite-plugin-tanstack-start`
- **Config:** `netlify.toml` na raiz
- **Variáveis:** `.env` com keys do Supabase do studio

### Fluxo de deploy de um novo studio

1. Fork/clone do FlowStudio AI base
2. Criar `src/sites/<novo-studio>/`
3. Criar projeto Supabase próprio
4. Configurar `studio.config.ts` apontando pro novo studio
5. Deploy isolado no Netlify

---

## 11. Regras de ouro permanentes

1. ❌ **Não** introduzir multi-tenant no banco (1 Supabase = 1 studio).
2. ❌ **Não** misturar lógica entre studios.
3. ❌ **Não** importar de `sites/` no núcleo.
4. ❌ **Não** chamar Supabase diretamente em componentes — usar hooks/queries.
5. ❌ **Não** adicionar tech fora da stack oficial sem aprovação.
6. ✅ **Sempre** validar entradas com Zod.
7. ✅ **Sempre** checar permission no `beforeLoad`.
8. ✅ **Sempre** seguir o padrão feature-based.
9. ✅ **Sempre** mobile-first.
10. ✅ **Sempre** preservar o isolamento por studio.

---

**Fim do documento.**
