# FlowStudio AI — Checkpoint do Projeto

Ultima atualizacao: 10/06/2026
Estado: Sprint 2 (Dashboard) CONCLUIDA com dados reais. Marco de
DESVINCULO SITE x SISTEMA concluido (tema por zona de rota) + feature
appointments extraida. Commit 3fd90d7 em main e ja sincronizado com origin.

---

## Contexto rapido

FlowStudio AI e uma plataforma white-label para studios de beleza. Cada
studio recebe deploy isolado (Netlify + Supabase proprios). A Sprint 0.5
fechou a fundacao white-label (switch) e DEMOLIU o admin legado. A Sprint 1
reconstruiu o core de autenticacao. A Sprint 1.5 extraiu o nucleo pluggable
(lib/core + lib/public) e criou a feature admin-shell. A Sprint 2 entregou
o dashboard com dados reais. O marco de desvinculo site x sistema isolou
tema/SEO/identidade por zona de rota (_auth / _authed / index).

---

## Estado real do codigo (validado por inspecao 10/06/2026)

### Rotas existentes (arvore real)

- src/routes/__root.tsx                       shell neutro absoluto (sem tema/SEO do site)
- src/routes/index.tsx                        landing do studio (absorve tema/SEO/OG/JSON-LD)
- src/routes/_auth.tsx                         zona de sistema (login/forgot/reset), sem guard
- src/routes/_auth/login.tsx                   tela de login (mobile-first)
- src/routes/_auth/forgot-password.tsx         solicitar reset
- src/routes/_auth/reset-password.tsx          definir nova senha
- src/routes/_authed.tsx                        guard de sessao + role + systemThemeClass
- src/routes/_authed/admin/route.tsx            monta AdminLayout (admin-shell) + Outlet
- src/routes/_authed/admin/index.tsx            DASHBOARD com dados reais (KPIs + leads)
- src/routes/_authed/admin/agendamentos.tsx     feature appointments (lista + status)
- src/routes/_authed/admin/agenda.tsx           placeholder
- src/routes/_authed/admin/clientes.tsx         placeholder
- src/routes/_authed/admin/equipe.tsx           placeholder
- src/routes/_authed/admin/financeiro.tsx       placeholder
- src/routes/_authed/admin/servicos.tsx         placeholder

### Desvinculo site x sistema (marco 3fd90d7)

- __root.tsx virou shell neutro: removidos tema/SEO/fonts/JSON-LD/styleHrefs do site.
- _auth.tsx: zona de sistema para telas de autenticacao, sem guard.
- _authed.tsx: aplica systemThemeClass + guard de sessao/role.
- index.tsx: rota '/' absorve a identidade do studio (tema/SEO/OG/JSON-LD).
- src/lib/core/system/ : dois temas de sistema (system-dark / system-light),
  classes isoladas (branding.ts + theme.css + index.ts).
- Sidebar consome a marca do studio via fachada active-studio.

Regra de ouro mantida: Sistema nunca importa de sites/. Unico import de
@/sites/ fora de sites/ vive na fachada active-studio e em index.tsx
(borda legitima do site).

### Nucleo pluggable (Sprint 1.5)

- src/lib/core/    contrato compartilhado (types: branding/identity/seo; utils: buildBrandingCss/buildSeo)
- src/lib/core/system/  temas de sistema (branding.ts, theme.css, index.ts)
- src/lib/public/  dados publicos da landing (services.ts, types.ts)

### Admin Shell (Sprint 1.5)

- src/features/admin-shell/  AdminLayout, Sidebar, SidebarItem, Topbar,
  PlaceholderScreen, config/nav-items.ts, types.ts, index.ts (barrel)

### Dashboard (Sprint 2 — CONCLUIDA, dados reais)

- src/features/dashboard/
  - server/getDashboardData.ts  server fn (Supabase) — KPIs com delta
    mes corrente vs mes anterior, range do dia, series de receita,
    servicos populares, clientes recentes, leads recentes.
  - components/  KpiGrid, RecentLeads (+ demais), ErrorState consumido da rota.
  - types.ts     DashboardData, KpiWithDelta, RevenuePoint, WeekDayPoint,
    PopularServiceItem, RecentClientItem, DashboardLeadItem + constantes.
- admin/index.tsx usa loader + ensureQueryData + useSuspenseQuery +
  errorComponent. RecentLeads renderizado so para role admin.

### Feature Appointments (marco 3fd90d7)

- src/features/appointments/
  - components/AppointmentsList.tsx
  - server/getTodayAppointments.ts, server/updateAppointmentStatus.ts
  - hooks.ts, types.ts, index.ts (barrel)
- Extraida do dashboard (substitui o antigo UpcomingAppointments.tsx, removido).

### Fundacao WhatsApp (marco 3fd90d7 — isolada, ainda nao plugada)

- src/components/icons/WhatsAppIcon.tsx
- src/lib/utils/whatsapp.ts
- Criados como fundacao; ainda NAO consumidos por nenhuma feature (ver DEBT-017).

### Auth (CABEADA)

- src/features/auth/    types, queries, hooks, components
- src/server/auth/      signIn, signOut, getSession, requestPasswordReset
- src/lib/supabase/server.ts / client.ts

Guard ativo em _authed.tsx: sem sessao -> /login ; role negada -> /login.
Telas de auth movidas para a zona _auth/ (sem guard).

### Feedback global

- src/components/feedback/  GlobalLoadingIndicator, BusyOverlay,
  TopProgressBar, useGlobalBusy, ErrorState
- Toaster (sonner) montado no __root, top-center

### White-label

- src/config/active-studio.ts  export * from '@/sites/ruah/studio' (ADR-002)
- src/sites/ruah/studio.ts     export consolidado (contrato estavel)

### Studio Ruah

- Landing publica funcional em / (agora dona da propria identidade/SEO)
- config/ (identidade, branding, content, seo, businessHours)
- Fachadas: buildBrandingCss.ts, buildSeo.ts

### Banco — Finance Lifecycle (DEBT-015)

Migration versionada: supabase/migrations/20260608_011_finance_lifecycle.sql
(idempotente, funcao transcrita FIEL de producao via pg_get_functiondef).
Conteudo: payment_methods, appointments.payment_method_id (+FK),
vinculos/colunas em finance_transactions (+indice unico parcial income/service
por appointment), agregados/denormalizados em clients,
recalc_client_aggregates, handle_appointment_lifecycle (motor de receita) +
trigger trg_appointment_lifecycle. ADR-003 finalizado.
Trigger e ausencia de duplicatas confirmados em producao. Migration
DESBLOQUEADA; aplicacao em ambiente limpo ainda pendente.

### Legado (somente referencia, nao builda)

- src/_legacy/admConfig/, src/_legacy/docs/checkpoints/, src/sites/_legacy/

---

## Sprints concluidas

- Sprint 0  — Housekeeping (CONCLUIDA)
- Sprint 0.5 — Fundacao White-Label (CONCLUIDA)
- Sprint 1  — Auth + Login (CONCLUIDA)
- Sprint 1.5 — Nucleo Pluggable + Admin Shell (CONCLUIDA)
- Sprint 2  — Dashboard com dados reais (CONCLUIDA)
- Marco     — Desvinculo Site x Sistema + feature appointments (CONCLUIDO, 3fd90d7)

---

## Ponto de retomada (RETOMAR AQUI — 10/06/2026)

### Onde paramos
- Commit 3fd90d7 em main, sincronizado com origin/main.
- Dashboard real entregue; appointments extraida; fundacao WhatsApp criada.
- TSC --noEmit VERDE.
- docs/PLANO-MASTER.txt ainda untracked (decidir commitar ou mover).

### Pendencias residuais do marco (F5/F6 do PLANO-MASTER)
- TD3: deletar lixo src/sites/ruah/styles/base.css.err e base.csse (DEBT-018).
- Validacao visual: /login, /admin, view-source de / (depende do dev rodando).

### Proximos passos (ordem sugerida)
1. Limpeza F5/F6: deletar base.css.err / base.csse; commitar ou mover
   PLANO-MASTER.txt para docs versionado.
2. DEBT-016: resolver AJUSTE*.sql em supabase/migrations/ (consolidar role
   em profiles; resgatar trg_appointments_updated_at em migration propria).
3. Aplicar migration 011 em ambiente limpo e validar Teste 1 (DEBT-015).
4. Decidir sprint seguinte: plugar fundacao WhatsApp (DEBT-017) ou
   preencher proximas rotas placeholder (agenda/clientes/equipe/
   financeiro/servicos — DEBT-014).
5. Validar deploy Netlify do estado atual em producao.
6. Decidir destino do UI Kit (DEBT-002 / DEBT-011).

---

## Zonas congeladas

- src/sites/ruah/ nao recebe alteracoes de feature (so a landing)
- src/_legacy/ somente leitura

---

## Regras permanentes em vigor

- Investigar antes de planejar; nunca chutar
- Sempre fornecer comandos PowerShell prontos para Windows
- Sempre validar typecheck + build antes de fechar etapa
- Manter os 5 documentos sincronizados
- Novos debitos registrados em docs/TECHDEBT.md ao surgirem
- ADRs sao imutaveis; decisao que muda gera novo ADR que supersede

---

Fim do documento.
