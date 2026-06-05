# FlowStudio AI - Arquitetura

Ultima atualizacao: 05/06/2026
Versao: 2.1 - alinhada ao estado real pos-Sprint 1 (auth + login cabeados)

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

Pos-Sprint 1: auth + login cabeados do zero. O que existe HOJE:

    src/
      routes/
        __root.tsx                  root layout + SSR head (publico)
        index.tsx                   landing publica do studio ativo
        login.tsx                   tela de login (publica)
        forgot-password.tsx         solicitar reset de senha (publica)
        reset-password.tsx          definir nova senha (publica)
        _authed.tsx                 LAYOUT GUARD (valida sessao no subtree)
        _authed/
          admin/
            index.tsx               dashboard stub (primeira tela protegida)
      features/
        auth/
          types.ts                  tipos do dominio auth
          queries.ts                queryOptions (sessao)
          hooks.ts                  hooks de auth
          components/
            LoginForm.tsx
            ForgotPasswordForm.tsx
            ResetPasswordForm.tsx
            login/
              LoginSplitLayout.tsx
              LoginBrandPanel.tsx
              ForgotPasswordLayout.tsx
              ResetPasswordLayout.tsx
      server/
        auth/
          getSession.ts             resolve sessao SSR
          signIn.ts                 login email/senha
          signOut.ts                logout
          requestPasswordReset.ts   dispara email de reset
      lib/
        env.ts                      validacao Zod (client + server)
        supabase/
          client.ts                 client browser (anon)
          server.ts                 client server SSR (anon + cookies)
        query/
          client.ts                 React Query client
      components/
        feedback/                   sistema de feedback global (ver secao)
          GlobalLoadingIndicator.tsx
          BusyOverlay.tsx
          TopProgressBar.tsx
          useGlobalBusy.ts
          index.ts                  barrel
      config/
        active-studio.ts            SWITCH white-label (export * puro - ADR-002)
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

    src/routes/_authed/admin/*    (telas alem do stub - Sprint 2+)
    src/features/<outros>/        (clients, services, appointments, etc)
    src/server/<outros>/          (server functions de outros dominios)
    src/components/ui/            (UI Kit - a recriar; login foi feito sem ele)
    src/lib/supabase/admin.ts     (client service role - quando necessario)

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
VITE_STUDIO_NAME estao OBSOLETOS - nao existem no env.ts.

---

## Autenticacao e Autorizacao (IMPLEMENTADA - Sprint 1)

ESTADO REAL: auth cabeada do zero na Sprint 1. Funcional, com sessao SSR
sem flash e guard de subtree.

### Componentes

- Auth provider: Supabase Auth (email/senha)
- Client SSR: src/lib/supabase/server.ts (createServerClient com anon key +
  cookies via @supabase/ssr; modulo server-only com guarda anti-bundle).
  NAO usa service role - service role (admin client) ainda nao foi criado.
- Feature: src/features/auth/ (types, queries, hooks, components).
  Nota: esta feature NAO tem barrel index.ts; consumo por path direto.
- Server functions: src/server/auth/
  - getSession.ts            resolve sessao no SSR
  - signIn.ts                login email/senha
  - signOut.ts               logout
  - requestPasswordReset.ts  dispara email de reset

### Rotas

Publicas:
  - login.tsx
  - forgot-password.tsx
  - reset-password.tsx

Protegidas:
  - _authed.tsx              LAYOUT GUARD - valida sessao e protege todo o
                             subtree. O guard vive AQUI, nao em __root nem
                             num beforeLoad espalhado por /admin/*. __root
                             permanece publico (landing).
  - _authed/admin/index.tsx  primeira tela protegida (dashboard stub)

### Roles

- admin | staff | client - vivem em profiles.role HOJE (nao em tabela
  user_roles).
- Function de RLS: current_user_role()

### Reset de senha

Fluxo completo: forgot-password (solicita) -> email -> reset-password
(define nova). Server: requestPasswordReset.ts.

---

## Feedback Global (sistema)

Modulo de sistema em src/components/feedback/ (com barrel index.ts),
construido na Sprint 1.

- Toaster (Sonner) montado no root para toasts globais
- GlobalLoadingIndicator   indicador de carregamento global
- TopProgressBar           barra de progresso de navegacao/topo
- BusyOverlay              overlay de bloqueio durante operacoes
- useGlobalBusy            hook para acionar estado busy de forma centralizada

Uso: features acionam busy/toast via este modulo em vez de gerenciar estado
de loading global localmente.

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

- studio_settings                        (Sprint 5)
- whatsapp_messages, whatsapp_settings   (Sprint 6)
- ai_messages                            (Sprint 7)
- user_roles                             (NAO - role vive em profiles hoje)

RLS habilitada nas tabelas principais. Como cada studio possui seu proprio
Supabase, as policies sao simples (autenticado + role via current_user_role()).

---

## Padroes arquiteturais

### Modelo de 2 modulos

Modulo 1 - Sistema (nucleo compartilhado):
  src/lib/, src/routes/ (estruturais), src/components/ core, auth, guards,
  feedback global, admin panels reutilizaveis, types do banco.
  REGRA: Sistema NUNCA importa de sites/.

Modulo 2 - Site (individual por studio):
  src/sites/<studio>/ - config, componentes da landing, styles, assets.
  REGRA: Sites consomem o core via fachadas
  (buildBrandingCss.ts, buildSeo.ts).

### Feature-based

Cada dominio em src/features/<domain>/:
- types.ts          tipos do dominio
- queries.ts        queryOptions do React Query
- hooks.ts          hooks customizados
- components/       UI especifica do dominio
- index.ts          barrel export (padrao alvo; auth ainda nao tem)

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
- Sem libs de UI pesadas - headless quando necessario
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

Identidade do studio NAO mora em env - mora em src/sites/<slug>/config/.
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
