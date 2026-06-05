# FlowStudio AI — Checkpoint do Projeto

Ultima atualizacao: 05/06/2026 (noite)
Estado: Sprint 1.5 (Refator Nucleo Pluggable + Admin Shell) CONCLUIDA — pronto para Sprint 2

---

## Contexto rapido

FlowStudio AI e uma plataforma white-label para studios de beleza. Cada
studio recebe deploy isolado (Netlify + Supabase proprios). A Sprint 0.5
fechou a fundacao white-label (switch) e DEMOLIU o admin legado. A Sprint 1
reconstruiu o core de autenticacao do zero. A Sprint 1.5 extraiu o nucleo
pluggable (lib/core + lib/public), criou a feature admin-shell (AdminLayout,
Sidebar, Topbar) e montou a arvore de rotas /admin com telas placeholder.

---

## Estado real do codigo (validado por inspecao)

### Rotas existentes

- src/routes/__root.tsx                    root layout + SSR head + feedback global
- src/routes/index.tsx                     landing publica do Ruah
- src/routes/login.tsx                     tela de login (UI nova, mobile-first)
- src/routes/forgot-password.tsx           solicitar reset de senha
- src/routes/reset-password.tsx            definir nova senha
- src/routes/_authed.tsx                   layout route com guard de sessao + role
- src/routes/_authed/admin/route.tsx       monta AdminLayout (admin-shell) + Outlet
- src/routes/_authed/admin/index.tsx       dashboard (placeholder)
- src/routes/_authed/admin/agenda.tsx      placeholder
- src/routes/_authed/admin/agendamentos.tsx placeholder
- src/routes/_authed/admin/clientes.tsx    placeholder
- src/routes/_authed/admin/equipe.tsx      placeholder
- src/routes/_authed/admin/financeiro.tsx  placeholder
- src/routes/_authed/admin/servicos.tsx    placeholder

### Nucleo pluggable (NOVO na Sprint 1.5)

- src/lib/core/         contrato compartilhado do sistema
  - types/   branding, identity, seo (+ index)
  - utils/   buildBrandingCss, buildSeo (+ index)
- src/lib/public/       dados publicos consumidos pela landing
  - services.ts, types.ts (+ index)

Regra de ouro mantida: Sistema nunca importa de sites/. Sites consomem
lib/core via fachadas (buildBrandingCss / buildSeo em sites/ruah/utils/).

### Admin Shell (NOVO na Sprint 1.5)

- src/features/admin-shell/
  - components/  AdminLayout, Sidebar, SidebarItem, Topbar, PlaceholderScreen
  - config/      nav-items.ts (itens de navegacao do admin)
  - types.ts, index.ts (barrel)

route.tsx do /admin importa { AdminLayout } de '@/features/admin-shell',
injeta session (do route context) e studioName (VITE_STUDIO_NAME com
fallback 'FlowStudio'). AdminLayout renderiza Sidebar + Topbar + Outlet.

### Auth (CABEADA)

- src/features/auth/    types, queries, hooks, components da feature
- src/server/auth/      signIn, signOut, getSession, requestPasswordReset
- src/lib/supabase/server.ts  createServerClient + auth.*
- src/lib/supabase/client.ts  client browser (anon)

Guard ativo em _authed.tsx:
- getSession() sem sessao -> redirect('/login')
- canAccessAdmin(role) negado -> redirect('/login')
- A protecao vive no layout route _authed, cobrindo todo o subtree /admin.

### Feedback global

- src/components/feedback/  GlobalLoadingIndicator, BusyOverlay,
  TopProgressBar, useGlobalBusy
- Toaster (sonner) montado no __root, tema dark, top-center
- src/styles/app.css importado no __root

### Infra de lib

- src/lib/env.ts          validacao Zod (sem VITE_STUDIO_SLUG/NAME)
- src/lib/query/client.ts React Query client

### White-label

- src/config/active-studio.ts  export * from '@/sites/ruah/studio' (ADR-002)
- src/sites/ruah/studio.ts     export consolidado (contrato estavel)

### Studio Ruah

- Landing publica funcional em /
- Identidade, branding, content, SEO, businessHours em config/
- Fachadas: buildBrandingCss.ts, buildSeo.ts (consomem lib/core)

### Legado (somente referencia, nao builda)

- src/_legacy/admConfig/          admin antigo
- src/_legacy/docs/checkpoints/   checkpoints/roadmaps antigos
- src/sites/_legacy/              sites arquivados

---

## Sprint 0 — Housekeeping (CONCLUIDA)

- Remocao de .bak, pastas orfas, backups de styles
- Build + typecheck verdes

---

## Sprint 0.5 — Fundacao White-Label (CONCLUIDA)

- [x] docs/adr/ + ADR-001 + ADR-002 (supersede 001)
- [x] src/sites/ruah/studio.ts consolidado
- [x] src/config/active-studio.ts (export * puro)
- [x] studio.config.ts legado removido
- [x] VITE_STUDIO_SLUG/NAME removidos do env.ts
- [x] Admin legado demolido (commit f837eee) e arquivado em _legacy/
- [x] Checkpoints/roadmaps antigos arquivados
- [x] Typecheck + build verdes
- [x] Landing publica funcionando

---

## Sprint 1 — Auth + Login (CONCLUIDA)

Objetivo: Construir auth do zero + tela de login NOVA sobre os clients
Supabase existentes.

- [x] src/features/auth/ (types, queries, hooks, components)
- [x] src/server/auth/ (signIn, signOut, getSession, requestPasswordReset)
- [x] src/routes/login.tsx (UI nova, mobile-first)
- [x] beforeLoad de sessao SSR no layout route _authed
- [x] Guard base para /admin/* (role via canAccessAdmin / current_user_role())
- [x] Redirects (nao auth -> /login ; auth em /login -> /admin)
- [x] Fluxo de reset de senha (forgot-password + reset-password)
- [x] Sistema de feedback global (sonner + GlobalLoadingIndicator)
- [x] Typecheck + build verdes
- [x] Smoke test login + sessao SSR (sem flash, console limpo)

---

## Sprint 1.5 — Refator Nucleo Pluggable + Admin Shell (CONCLUIDA)

Objetivo: Extrair o nucleo compartilhado para lib/core + lib/public,
criar a feature admin-shell e montar a arvore de rotas do /admin com
telas placeholder, preparando o terreno para o dashboard (Sprint 2).

- [x] src/lib/core/ (types: branding/identity/seo; utils: buildBrandingCss/buildSeo)
- [x] src/lib/public/ (services + types) para dados da landing
- [x] src/features/admin-shell/ (AdminLayout, Sidebar, SidebarItem, Topbar,
      PlaceholderScreen, nav-items, barrel)
- [x] src/routes/_authed/admin/route.tsx monta AdminLayout + Outlet
- [x] 7 rotas placeholder sob /admin (index, agenda, agendamentos,
      clientes, equipe, financeiro, servicos)
- [x] sites/ruah migrado para consumir lib/core via fachadas
- [x] Limpeza de legado (admConfig, calendar, features CRUD antigas,
      themes CSS, UI kit antigo, sections)
- [x] Typecheck + build verdes
- [x] Merge fast-forward na main (commit 6ffff34) + push

Resultado real: nucleo desacoplado e pluggable. Admin tem casca completa
(layout + navegacao + rotas), mas as telas sao placeholders sem dados
reais (ver DEBT-014). Pendente validacao do deploy Netlify do 6ffff34.

---

## Proximos passos

1. Validar deploy Netlify do commit 6ffff34 em producao:
   - Landing publica carrega normal
   - /admin sem sessao -> redirect /login
   - Logado: AdminLayout + sidebar renderizam; rotas placeholder respondem
2. Sprint 2 — Dashboard administrativo:
   - INVESTIGAR tabelas/RLS reais do Supabase Ruah antes de codar
   - Preencher _authed/admin/index.tsx com KPIs (dia/semana/mes),
     proximos agendamentos e leads recentes
   - Atalhos para acoes frequentes
3. Decidir destino do UI Kit (DEBT-002 / DEBT-011): nasce junto da
   Sprint 2 ou vira sprint propria.

---

## Arquivos criticos do projeto (referencia rapida)

- src/routes/__root.tsx              root layout + SSR head + feedback global
- src/routes/index.tsx               landing do studio ativo
- src/routes/login.tsx               tela de login
- src/routes/_authed.tsx             guard de sessao + role
- src/routes/_authed/admin/route.tsx monta o admin-shell + Outlet
- src/features/auth/                 feature de autenticacao
- src/features/admin-shell/          casca do admin (layout + nav)
- src/server/auth/                   server fns de auth
- src/lib/core/                      nucleo compartilhado (types + fachadas)
- src/lib/public/                    dados publicos da landing
- src/components/feedback/           feedback global (loading/toaster)
- src/lib/env.ts                     validacao Zod de env
- src/lib/supabase/client.ts         client browser
- src/lib/supabase/server.ts         client server (auth.*)
- src/lib/query/client.ts            React Query client
- src/config/active-studio.ts        switch white-label (ADR-002)
- src/sites/ruah/studio.ts           export consolidado do Ruah
- src/sites/ruah/config/             identidade, branding, content, seo, horarios
- src/sites/ruah/utils/              fachadas (buildBrandingCss, buildSeo)
- docs/ARCHITECTURE.md               arquitetura oficial (v2.0)
- docs/ROADMAP.md                    sprints planejados
- docs/CHECKPOINT.md                 este documento
- docs/TECHDEBT.md                   debitos tecnicos do nucleo
- docs/TROCAR-STUDIO.md              provisionar/trocar studio
- docs/adr/                          decisoes arquiteturais

---

## Zonas congeladas

- src/sites/ruah/ nao recebe alteracoes de feature (so a landing ja existe)
- src/_legacy/ somente leitura (referencia historica)

---

## Regras permanentes em vigor

- Investigar antes de planejar; nunca chutar
- Sempre fornecer comandos PowerShell prontos para Windows
- Sempre validar typecheck + build antes de fechar etapa
- Manter os 5 documentos sincronizados
  (ARCHITECTURE, ROADMAP, CHECKPOINT, TECHDEBT, TROCAR-STUDIO)
- Novos debitos registrados em docs/TECHDEBT.md no momento em que surgem
- Tech debt/roadmap especificos de studio vivem em src/sites/<studio>/docs/
- ADRs sao imutaveis; decisao que muda gera novo ADR que supersede

---

Fim do documento.