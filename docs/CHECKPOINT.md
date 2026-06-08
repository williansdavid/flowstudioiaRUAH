# FlowStudio AI — Checkpoint do Projeto

Ultima atualizacao: 08/06/2026 (fim do dia)
Estado: Sprint 1.5 CONCLUIDA. Finance lifecycle (DEBT-015) resgatado e
DESBLOQUEADO para aplicar (trigger + duplicatas confirmados em prod).
ADR-003 finalizado. Sprint 2 (dashboard) INICIADA — WIP commitado.

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

### Nucleo pluggable (Sprint 1.5)

- src/lib/core/         contrato compartilhado do sistema
  - types/   branding, identity, seo (+ index)
  - utils/   buildBrandingCss, buildSeo (+ index)
- src/lib/public/       dados publicos consumidos pela landing
  - services.ts, types.ts (+ index)

Regra de ouro mantida: Sistema nunca importa de sites/. Sites consomem
lib/core via fachadas (buildBrandingCss / buildSeo em sites/ruah/utils/).

### Admin Shell (Sprint 1.5)

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

### Banco — Finance Lifecycle (resgatado 08/06/2026, DEBT-015)

Schema que vivia so em producao, agora versionado em
supabase/migrations/20260608_011_finance_lifecycle.sql (idempotente):

- payment_methods (code/description/is_installment/icon/is_active/sort_order)
- appointments.payment_method_id (+ FK -> payment_methods)
- finance_transactions: appointment_id, staff_id, payment_method_id,
  occurred_at (+ FKs) + indice unico parcial income/service por appointment
- clients: total_appointments, total_spent, last_visit_at +
  denormalizados full_name, phone, email
- recalc_client_aggregates(uuid)
- handle_appointment_lifecycle() — MOTOR DE RECEITA (transcrita fiel de
  producao). Guard de payment_method em completed; cria/atualiza/deleta
  finance_transactions income/service conforme o ciclo do appointment;
  recalcula agregados do cliente.
- trigger AFTER INSERT OR UPDATE em appointments.

Decisao registrada em docs/adr/ADR-003-finance-lifecycle.md (finalizado).
DESBLOQUEADO em 08/06/2026: trigger confirmado (trg_appointment_lifecycle
via pg_trigger) e duplicatas income/service = 0 (query agregada). Migration
pronta para aplicar em ambiente limpo.

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

## 08/06/2026 — Finance Lifecycle (resgate de schema, fora de sprint)

- Auditoria revelou o motor de receita vivendo so em producao (fora do git).
- Criada migration idempotente 20260608_011_finance_lifecycle.sql
  resgatando: payment_methods, appointments.payment_method_id (+FK),
  vinculos/colunas em finance_transactions, agregados/denormalizados em
  clients, recalc_client_aggregates, handle_appointment_lifecycle
  (transcrita FIEL de producao via pg_get_functiondef) e trigger.
- Reforco de idempotencia: indice unico parcial income/service por
  appointment (alem do not exists do trigger).
- Decisao registrada em docs/adr/ADR-003-finance-lifecycle.md.
- Teste 1 (conclusao -> receita) validado em producao.
- Novos debitos: DEBT-015 (resgatado), DEBT-016 (AJUSTE*.sql + duplicatas).
- Pendencias antes de aplicar em prod: confirmar nome real do trigger e
  checar duplicatas income/service.

---

## Ponto de retomada (RETOMAR AQUI — 09/06/2026)

### Onde paramos
- Finance lifecycle resgatado, ADR-003 finalizado, migration 011 commitada.
- Trigger e duplicatas CONFIRMADOS em prod -> migration desbloqueada.
- Sprint 2 (dashboard) iniciada: src/features/dashboard/ + ErrorState +
  admin/index.tsx em WIP (commitado, ainda sem dados reais).

### Proximos passos (ordem)
1. DEBT-016 — limpeza de schema fora do git:
   - mover/deletar os AJUSTE*.sql soltos
   - consolidar role em profiles (avaliar user_roles planejada)
   - resgatar trigger trg_appointments_updated_at em migration propria
2. Aplicar migration 011 em ambiente limpo (ja desbloqueada) e validar
   Teste 1 (conclusao -> receita) no ambiente novo.
3. Continuar Sprint 2 — Dashboard:
   - INVESTIGAR tabelas/RLS reais do Supabase Ruah antes de codar
   - completar _authed/admin/index.tsx com KPIs (dia/semana/mes),
     proximos agendamentos e leads recentes + atalhos
4. Validar deploy Netlify do commit 6ffff34 em producao:
   - landing carrega; /admin sem sessao -> /login; logado renderiza shell
5. Decidir destino do UI Kit (DEBT-002 / DEBT-011).

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
- supabase/migrations/20260608_011_finance_lifecycle.sql  motor de receita
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

