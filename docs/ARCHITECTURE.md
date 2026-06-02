# FlowStudio AI — Arquitetura

Ultima atualizacao: 02/06/2026 (tarde)
Versao: 1.1 — introducao do White-Label Switch (ADR-001)

---

## Visao de produto

FlowStudio AI e uma plataforma white-label para studios de beleza, saloes
e barbearias. Cada studio recebe seu proprio deploy Netlify, seu proprio
projeto Supabase, sua propria landing personalizada e seu proprio admin,
sempre a partir do mesmo codigo-fonte base.

Nao e multi-tenant. Nao existe compartilhamento de dados entre studios.
Cada cliente e uma instancia autonoma.

---

## Stack oficial

- Frontend / SSR: TanStack React Start + TanStack Router
- Estado servidor: React Query
- Linguagem: TypeScript
- Estilo: Tailwind CSS
- Backend: Supabase (Auth + Postgres + Storage + Realtime)
- Build: Vite
- Deploy: Netlify (entry SSR)
- Icones: Lucide
- Toasts: Sonner

---

## Estrutura de pastas (alto nivel)

src/
  routes/                       TanStack Router (nucleo universal)
    index.tsx                   landing publica do studio ativo
    admin/                      painel administrativo (universal)
    login.tsx
  features/                     modulos de negocio (universal)
    auth/
    clients/
    services/
    team/
    appointments/
    calendar/
    dashboard/                  (a criar — Sprint 1)
    finance/                    (a criar — Sprint 3)
    whatsapp/                   (a criar — Sprint 5)
    settings/                   (a criar — Sprint 4)
    leads/
    ai-chat/
  server/                       server functions por dominio (universal)
  components/                   UI primitives + compostos (universal)
  lib/                          utilitarios, supabase client, helpers
  config/
    active-studio.ts            SWITCH white-label (ADR-001)
  sites/
    ruah/                       studio Ruah (isolado)
      studio.ts                 export unico consolidado
      config/                   config detalhada (identidade, hero, etc)
      components/               componentes especificos da landing Ruah
      assets/
      docs/
    _legacy/                    sites arquivados (nao buildam)

---

## White-Label Switch (ADR-001)

### Principio

O nucleo (routes/, features/, server/, components/, lib/) nunca importa
diretamente de src/sites/<slug>/. Toda consulta ao studio ativo passa por:

    import { activeStudio } from "@/config/active-studio";

### Como funciona

src/sites/ruah/studio.ts consolida toda a config do studio em um unico
export tipado. Exemplo conceitual:

    import { identity } from "./config/identity";
    import { hero } from "./config/hero";
    import { services } from "./config/services";

    export const ruahStudio = {
      slug: "ruah",
      identity,
      hero,
      services,
    } as const;

    export type Studio = typeof ruahStudio;

src/config/active-studio.ts e o switch unico:

    import { ruahStudio } from "@/sites/ruah/studio";

    export const activeStudio = ruahStudio;
    export type { Studio } from "@/sites/ruah/studio";

### Trocar de studio

Para gerar um deploy para outro studio (ex: bellavista):

1. Criar src/sites/bellavista/ espelhando a estrutura do Ruah
2. Criar src/sites/bellavista/studio.ts
3. Trocar 1 linha em src/config/active-studio.ts
4. Apontar .env para o Supabase do novo studio
5. Deploy

### Beneficios

- Nucleo permanece reutilizavel
- Studios isolados (zero risco de vazamento entre instancias)
- Trocar de cliente = trocar 1 arquivo
- Permite manter multiplos studios no mesmo monorepo sem acoplamento
- Facilita testes (mockar activeStudio e trivial)

Decisao completa: docs/adr/ADR-001-white-label-switch.md

---

## Autenticacao e Autorizacao

- Auth provider: Supabase Auth
- Sessao SSR resolvida via beforeLoad no TanStack Router
- Roles: admin, staff, client
- Permissions: sistema granular via userHasPermission
- Guards de rota: beforeLoad em todas as rotas /admin/* valida sessao
  e role
- Filtro de navegacao: AdminLayout esconde itens do menu conforme
  permissoes

---

## Modelo de dados (Supabase por studio)

Cada studio tem seu proprio Postgres. Tabelas principais:

- profiles
- user_roles
- clients
- staff
- services
- appointments
- finance_transactions       (Sprint 3)
- leads
- whatsapp_messages          (Sprint 5)
- whatsapp_settings
- ai_messages
- studio_settings            (Sprint 4)

RLS habilitada em todas as tabelas. Como cada studio possui seu proprio
Supabase, as policies sao simples (autenticado + role).

---

## Padroes arquiteturais

### Feature-based

Cada dominio em src/features/<domain>/ segue:

- types.ts          tipos do dominio
- queries.ts        queryOptions do React Query
- hooks.ts          hooks customizados
- components/       UI especifica do dominio
- index.ts          barrel export

### Server functions

Cada operacao isolada em src/server/<domain>/<action>.ts, usando
createServerFn do TanStack Start, com validator (zod) e handler tipado.

### SSR data flow

1. Rota declara loader (ou beforeLoad)
2. Loader chama server function ou queryClient.ensureQueryData
3. Componente consome via useQuery / useSuspenseQuery
4. Hidratacao automatica client-side

---

## Design System

- Mobile-first obrigatorio
- Tailwind com tokens definidos por studio (cores primarias via config)
- Componentes primitivos em src/components/ui/
- Componentes compostos em src/components/ (admin) e
  src/sites/<slug>/components/ (landing)
- Sem libs de UI pesadas — apenas headless quando necessario

---

## Deploy

### Por studio

1. Repositorio unico, branches/tags por release
2. .env.production especifico (URL Supabase + anon key do studio)
3. Build Netlify roda vite build e gera entry SSR
4. Netlify Functions servem o SSR

### Variaveis de ambiente

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY    (apenas server functions)

O studio ativo e definido em codigo (active-studio.ts), nao em env.
Isso garante type-safety e impede deploy acidental do studio errado.

---

## Principios nao-negociaveis

1. Simplicidade operacional acima de elegancia arquitetural
2. Isolamento total entre studios
3. SSR-first — toda rota critica funciona com JS desabilitado para
   conteudo essencial
4. Type-safety end-to-end (server functions tipadas, queries tipadas)
5. Mobile-first sem excecoes
6. Nucleo desacoplado de studios (regra do switch white-label)
7. Decisoes arquiteturais viram ADR em docs/adr/

---

## O que NAO fazemos (ainda)

- Multi-tenant no banco
- Microservicos
- Filas / event sourcing
- Kubernetes / orquestracao
- Internacionalizacao
- Tema dark/light toggle
- App mobile nativo

---

## Documentos relacionados

- docs/ROADMAP.md                       sprints planejados
- docs/CHECKPOINT.md                    estado atual do projeto
- docs/adr/README.md                    indice de decisoes arquiteturais
- docs/adr/ADR-001-white-label-switch.md   decisao do switch white-label

---

Fim do documento.
