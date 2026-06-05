# FlowStudio AI — Arquitetura

Ultima atualizacao: 05/06/2026
Versao: 2.0 — alinhada ao estado real pos-demolicao do admin legado (ADR-002)

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
- Linguagem: TypeScript (estrito, noUncheckedIndexedAccess: true)
- Estilo: Tailwind CSS
- Backend: Supabase (Auth + Postgres + RLS)
- Build: Vite
- Deploy: Netlify (entry SSR)
- Icones: Lucide
- Toasts: Sonner
- Validacao: Zod
- Animacao: framer-motion
- Validacao env: Zod em src/lib/env.ts (client schema + server schema lazy)

---

## Estado real do codigo (05/06/2026)

ATENCAO: o admin legado foi DEMOLIDO na Sprint 0.5. O que existe HOJE:

    src/
      routes/
        __root.tsx                  root layout + SSR head
        index.tsx                   landing publica do studio ativo
      lib/
        env.ts                      validacao Zod (client + server)
        supabase/
          client.ts                 client browser (anon)
          server.ts                 client server (auth.* / service role)
        query/
          client.ts                 React Query client
      config/
        active-studio.ts            SWITCH white-label (export * puro — ADR-002)
      sites/
        ruah/
          studio.ts                 export unico consolidado
          config/                   identity, branding, content, businessHours, seo
          components/               componentes da landing Ruah
          styles/                   CSS proprio
          assets/                   logo, imagens
          utils/                    buildBrandingCss.ts, buildSeo.ts (fachadas)
        _legacy/                    sites arquivados (nao buildam)
      _legacy/
        admConfig/                  admin antigo (somente referencia historica)
        docs/checkpoints/           checkpoints/roadmaps antigos arquivados

NAO EXISTE AINDA (a construir):

    src/routes/login.tsx          (Sprint 1 — proxima)
    src/routes/admin/             (Sprint 1+)
    src/features/                 (auth, clients, services, etc — a recriar)
    src/server/                   (server functions — a recriar)
    src/components/ui/            (UI Kit — a recriar)

---

## White-Label Switch (ADR-002)

### Principio

O nucleo nunca importa diretamente de src/sites/<slug>/. Toda consulta ao
studio ativo passa por:

    import { ... } from "@/config/active-studio";

### Como funciona

src/sites/ruah/studio.ts consolida toda a config do studio e exporta o
contrato estavel. src/config/active-studio.ts e um re-export puro:

    // src/config/active-studio.ts
    export * from '@/sites/ruah/studio'

### Contrato estavel exportado por todo studio.ts

- branding, content, identity   dados crus
- brandingCss                   CSS vars geradas do branding
- themeClass                    classe de tema do <html>
- seo                           SEO resolvido (ResolvedSeo)
- buildLocalBusinessJsonLd      builder de JSON-LD (funcao pura)
- styleHrefs                    hrefs dos CSS na ordem de aplicacao

### Trocar de studio

1. Criar src/sites/<novo>/ espelhando a estrutura do Ruah
2. Criar src/sites/<novo>/studio.ts (mesmo contrato)
3. Trocar 1 linha em src/config/active-studio.ts
4. Apontar .env para o Supabase do novo studio
5. Deploy

Processo completo: docs/TROCAR-STUDIO.md
Decisao: docs/adr/ADR-002-switch-simplificado.md

### Por que NAO ha validacao cruzada via env

Decisao do ADR-002: identidade de studio vive SO em src/sites/<slug>/config/,
nunca em .env. O .env contem apenas infra/secrets. Com identidade fora do env,
o mismatch que uma validacao cruzada cacaria nao existe. VITE_STUDIO_SLUG e
VITE_STUDIO_NAME estao OBSOLETOS — nao existem no env.ts.

---

## Autenticacao e Autorizacao (A CONSTRUIR — Sprint 1)

ESTADO REAL: auth NAO esta cabeada. Sobrou apenas:

- src/lib/supabase/client.ts    client browser
- src/lib/supabase/server.ts    client server (unico lugar com auth.*)

NAO existe ainda: rota de login, guard de sessao, beforeLoad, telas admin.

### Plano (Sprint 1)

- Auth provider: Supabase Auth (email/senha)
- Sessao SSR resolvida via beforeLoad no TanStack Router
- Roles: admin | staff | client (vivem em profiles.role HOJE, nao em
  tabela user_roles)
- Function de RLS: current_user_role()
- Guards de rota: beforeLoad nas rotas /admin/* valida sessao e role
- Tela de login nova: src/routes/login.tsx + feature src/features/auth/

---

## Modelo de dados (Supabase por studio)

Cada studio tem seu proprio Postgres.

### Tabelas EXISTENTES

- profiles            (id, email, role, full_name, phone, avatar_url, is_active)
- clients             (vinculado opcionalmente a profile_id)
- staff               (vinculado a profile_id)
- services
- appointments        (client_id, staff_id, service_id, status enum)
- finance_transactions (type income/expense + category enum)
- leads               (status + source enums)

### View EXISTENTE

- clients_view        (consolida cliente + profile)

### Enums

- appointment_status, lead_source, lead_status,
  transaction_category, transaction_type, user_role (admin|staff|client)

### Function

- current_user_role()   usar em RLS

### Tabelas PLANEJADAS (NAO existem ainda)

- whatsapp_messages, whatsapp_settings   (Sprint 5)
- ai_messages                            (Sprint 6)
- studio_settings                        (Sprint 4)
- user_roles                             (NAO — role vive em profiles hoje)

RLS habilitada nas tabelas principais. Como cada studio possui seu proprio
Supabase, as policies sao simples (autenticado + role via current_user_role()).

---

## Padroes arquiteturais

### Modelo de 2 modulos

Modulo 1 — Sistema (nucleo compartilhado):
  src/lib/, src/routes/ (estruturais), src/components/ core, auth, guards,
  admin panels reutilizaveis, types do banco.
  REGRA: Sistema NUNCA importa de sites/.

Modulo 2 — Site (individual por studio):
  src/sites/<studio>/ — config, componentes da landing, styles, assets.
  REGRA: Sites consomem o core via fachadas
  (buildBrandingCss.ts, buildSeo.ts).

### Feature-based (ao recriar features)

Cada dominio em src/features/<domain>/:
- types.ts          tipos do dominio
- queries.ts        queryOptions do React Query
- hooks.ts          hooks customizados
- components/       UI especifica do dominio
- index.ts          barrel export

### Server functions

Cada operacao em src/server/<domain>/<action>.ts, usando createServerFn do
TanStack Start, com validator (zod) e handler tipado.

### SSR data flow

1. Rota declara loader (ou beforeLoad)
2. Loader chama server function ou queryClient.ensureQueryData
3. Componente consome via useQuery / useSuspenseQuery
4. Hidratacao automatica client-side

---

## Design System

- Mobile-first obrigatorio (sem excecoes)
- Tailwind com tokens por studio (cores via brandingCss)
- Primitivos em src/components/ui/ (a recriar)
- Compostos admin em src/components/, landing em src/sites/<slug>/components/
- Sem libs de UI pesadas — headless quando necessario
- Estados obrigatorios em telas de dados: loading / error / empty

---

## Deploy

### Por studio

1. Repositorio unico, branches/tags por release
2. .env especifico (Supabase URL + anon key do studio)
3. Build Netlify roda vite build e gera entry SSR
4. Netlify Functions servem o SSR

### Variaveis de ambiente (apenas infra/secrets)

CLIENT (build time, entram no bundle):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_APP_URL

SERVER (runtime):
- SUPABASE_SERVICE_ROLE_KEY
- NODE_ENV
- EVOLUTION_API_* / OPENAI_API_KEY / AI_MODEL / RATE_LIMIT_* (opcionais)

Identidade do studio NAO mora em env — mora em src/sites/<slug>/config/.
VITE_STUDIO_SLUG / VITE_STUDIO_NAME estao OBSOLETOS.

---

## Principios nao-negociaveis

1. Simplicidade operacional acima de elegancia arquitetural
2. Isolamento total entre studios (1 studio = 1 deploy + 1 Supabase)
3. SSR-first
4. Type-safety end-to-end (server functions tipadas, queries tipadas)
5. Mobile-first sem excecoes
6. Nucleo desacoplado de studios (Sistema nunca importa de sites/)
7. Decisoes arquiteturais viram ADR em docs/adr/

---

## O que NAO fazemos

- Multi-tenant no banco
- Microservicos
- Filas / event sourcing / CQRS
- Kubernetes / orquestracao
- Internacionalizacao
- App mobile nativo
- Tabela user_roles (role vive em profiles)

---

## Documentos relacionados

- docs/ROADMAP.md                            sprints planejados
- docs/CHECKPOINT.md                         estado atual do projeto
- docs/TECHDEBT.md                           debitos tecnicos do nucleo
- docs/TROCAR-STUDIO.md                      provisionar/trocar studio
- docs/adr/README.md                         indice de ADRs
- docs/adr/ADR-001-white-label-switch.md     (descontinuado)
- docs/adr/ADR-002-switch-simplificado.md    decisao vigente do switch

---

Fim do documento.
