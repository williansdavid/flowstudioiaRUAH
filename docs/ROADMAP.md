# FlowStudio AI — Roadmap

Ultima atualizacao: 05/06/2026 (noite)
Estrategia: Sprints curtas, foco em fundacao antes de features novas.

---

## Visao geral das sprints

- Sprint 0     Housekeeping                                 CONCLUIDA
- Sprint 0.5   Fundacao White-Label (switch + demolicao)    CONCLUIDA
- Sprint 1     Auth + Login (core do zero)                  CONCLUIDA
- Sprint 1.5   Refator Nucleo Pluggable + Admin Shell       CONCLUIDA
- Sprint 2     Dashboard administrativo                     PLANEJADA (proxima)
- Sprint 3     Appointments — CRUD completo                 PLANEJADA
- Sprint 4     Modulo Financeiro                            PLANEJADA
- Sprint 5     Settings (configuracoes do studio)           PLANEJADA
- Sprint 6     Integracao WhatsApp                          PLANEJADA
- Sprint 7     Chat IA real                                 PLANEJADA
- Sprint 8     Hardening + observabilidade                  PLANEJADA
- Sprint 9     Segundo studio (validacao white-label)       PLANEJADA

---

## Sprint 0 — Housekeeping (CONCLUIDA)

- Remocao de .bak, pastas orfas, backups de styles
- Build + typecheck verdes
- Commit oficial aplicado

---

## Sprint 0.5 — Fundacao White-Label (CONCLUIDA)

Objetivo: Estabelecer o switch unico de studio ativo e desacoplar o nucleo
de src/sites/ruah/. Demolir admin legado.

Entregas:

- [x] docs/adr/ + ADR-001
- [x] CHECKPOINT, ARCHITECTURE, ROADMAP, TECHDEBT
- [x] src/sites/_legacy/ (placeholder)
- [x] Consolidar tech debt legado
- [x] Arquivar checkpoints/ em src/_legacy/docs/checkpoints/
- [x] Mover src/admin/ antigo para src/_legacy/admConfig/
- [x] src/sites/ruah/studio.ts (export consolidado)
- [x] src/config/active-studio.ts (switch export * puro)
- [x] Remover studio.config.ts legado
- [x] Remover VITE_STUDIO_SLUG / VITE_STUDIO_NAME do env.ts
- [x] Demolicao do admin legado (commit f837eee)
- [x] ADR-002 (switch simplificado, supersedes ADR-001)
- [x] Typecheck + build verdes
- [x] Landing publica funcionando

Resultado real: nucleo reduzido a __root.tsx + index.tsx + lib/. Auth nao
cabeada (so sobraram os clients Supabase). Admin sera reconstruido do zero.

---

## Sprint 1 — Auth + Login (core do zero) (CONCLUIDA)

Objetivo: Construir a fundacao de autenticacao e a tela de login NOVA.
O admin foi demolido — nao ha login existente para reaproveitar.

Escopo planejado:

- src/features/auth/ (types, queries, hooks, components)
- src/server/auth/ (server functions: signIn, signOut, getSession)
- src/routes/login.tsx (tela nova, mobile-first, loading/error states)
- beforeLoad de sessao SSR no TanStack Router
- Guard de rota base para /admin/* (valida sessao + role via
  current_user_role())
- Redirect: nao autenticado -> /login ; autenticado em /login -> /admin
- Tratamento de erro de credencial (Sonner)

Criterios de saida:

- Login funcional com email/senha contra Supabase Auth
- Sessao persistida e resolvida em SSR (sem flash)
- Guard bloqueia /admin/* sem sessao
- Typecheck + build verdes; console limpo

Resultado real: auth cabeada do zero. Entregue conforme escopo, com dois
extras alem do planejado:
- Fluxo de reset de senha (forgot-password + reset-password +
  requestPasswordReset no server)
- Sistema de feedback global (sonner Toaster + GlobalLoadingIndicator +
  BusyOverlay + TopProgressBar + useGlobalBusy)
O guard de sessao ficou no layout route _authed.tsx (cobre o subtree
/admin), nao no __root — o root permanece publico para a landing.
Smoke test OK (login + sessao SSR sem flash, console limpo).

---

## Sprint 1.5 — Refator Nucleo Pluggable + Admin Shell (CONCLUIDA)

Objetivo: Extrair o nucleo compartilhado (types + fachadas) para lib/core,
isolar dados publicos da landing em lib/public, criar a feature admin-shell
(casca do admin) e montar a arvore de rotas /admin com placeholders.

Entregas:

- [x] src/lib/core/ — types (branding, identity, seo) + utils
      (buildBrandingCss, buildSeo) + barrels
- [x] src/lib/public/ — services + types (dados consumidos pela landing)
- [x] src/features/admin-shell/ — AdminLayout, Sidebar, SidebarItem,
      Topbar, PlaceholderScreen, nav-items, barrel
- [x] src/routes/_authed/admin/route.tsx monta AdminLayout + Outlet
- [x] 7 rotas placeholder: index, agenda, agendamentos, clientes,
      equipe, financeiro, servicos
- [x] sites/ruah migrado para consumir lib/core via fachadas
- [x] Limpeza de legado (admConfig, calendar, features CRUD antigas,
      themes CSS, UI kit antigo, sections, .exe acidental)
- [x] Typecheck + build verdes
- [x] Merge fast-forward na main (commit 6ffff34) + push

Resultado real: nucleo desacoplado e pluggable; admin com casca completa
(layout + navegacao + rotas), porem com telas placeholder sem dados
(DEBT-014). Parte do escopo originalmente previsto para a Sprint 2
(AdminLayout + navegacao por role) foi antecipada aqui. Pendente validar
o deploy Netlify do 6ffff34.

---

## Sprint 2 — Dashboard administrativo

Objetivo: Preencher o dashboard (_authed/admin/index.tsx) com metricas
operacionais reais. A casca do admin (AdminLayout + Sidebar + Topbar +
navegacao) JA foi entregue na Sprint 1.5.

Escopo:

- INVESTIGAR tabelas/RLS reais do Supabase Ruah antes de codar
- Cards de KPI (agendamentos do dia, semana, mes)
- Lista de proximos agendamentos
- Lista de leads recentes
- Atalhos para acoes frequentes
- Definir destino do UI Kit (DEBT-002 / DEBT-011): nasce aqui ou vira
  sprint propria

Fora de escopo (ja feito na 1.5): AdminLayout, navegacao, rotas placeholder.

Dependencias: Sprint 1.5 concluida + validacao do deploy

---

## Sprint 3 — Appointments completos

Objetivo: CRUD de agendamentos + calendar.

Escopo:

- Recriar feature appointments (create/list/update/cancel/reschedule/delete)
- Recriar calendar (DayView, WeekView, NowLine, slots)
- Soft delete + audit log simples
- Preencher rotas placeholder agenda/agendamentos

Dependencias: Sprint 2 concluida

---

## Sprint 4 — Modulo Financeiro

Objetivo: Controle financeiro basico por studio.

Escopo:

- CRUD de finance_transactions (receitas/despesas)
- Categorias (transaction_category)
- Vinculo appointment -> transaction (receita ao concluir)
- Relatorios simples (mes atual/anterior) + export CSV
- Preencher rota placeholder financeiro

Dependencias: Sprint 3 concluida

---

## Sprint 5 — Settings do studio

Objetivo: Painel de configuracoes editaveis pelo admin.

Escopo:

- Tabela studio_settings (a criar)
- Horarios, contato, redes sociais, upload de logo
- UI de troca de tema em runtime (presets) — resolve DEBT-003

Nota: Settings vivem no banco do studio, NAO sobrescrevem active-studio.ts
(fonte de identidade base white-label). Settings sao overrides dinamicos.

Dependencias: Sprint 2 concluida

---

## Sprint 6 — Integracao WhatsApp

Objetivo: Receber e responder via WhatsApp Business API.

Escopo:

- Tabelas whatsapp_messages e whatsapp_settings
- Webhook de recebimento + envio + templates
- Inbox no admin + vinculo mensagem->cliente->appointment

Dependencias: Sprint 4 concluida + ADR de provider (Meta/Z-API/Twilio)

---

## Sprint 7 — Chat IA real

Objetivo: Substituir placeholder de chat IA por integracao real.

Escopo:

- Provider LLM definido (ADR)
- Contexto do studio no prompt (servicos, equipe, horarios)
- Captura de leads + agendamento via chat
- Persistencia em ai_messages

Dependencias: Sprint 6 concluida

---

## Sprint 8 — Hardening + observabilidade

Escopo:

- Logging estruturado, error tracking (Sentry ou alternativa)
- Metricas (Netlify Analytics + custom)
- Rate limiting nas server functions criticas
- Backup automatizado do Supabase + runbook

Dependencias: Sprint 7 concluida

---

## Sprint 9 — Segundo studio (validacao white-label)

Objetivo: Provar o switch criando o segundo studio do zero.

Escopo:

- src/sites/<novo>/ + studio.ts
- Trocar active-studio.ts
- Supabase + Netlify novos
- Documentar tempo de provisionamento e ajustes no nucleo

Dependencias: Sprint 5 concluida

---

## Regras de execucao do roadmap

- Uma sprint por vez; nao iniciar a proxima sem fechar a anterior
- Sempre validar typecheck + build antes de fechar
- Sempre atualizar CHECKPOINT.md ao fechar uma sprint
- Sempre atualizar TECHDEBT.md quando novo debito for identificado
- Sempre criar ADR para decisoes que afetam o nucleo
- Mudancas no roadmap devem ser explicitas e datadas neste documento

---

## Historico de mudancas do roadmap

- 05/06/2026 (noite) — Inserida Sprint 1.5 (Refator Nucleo Pluggable +
  Admin Shell) marcada CONCLUIDA: lib/core, lib/public, feature admin-shell
  (AdminLayout/Sidebar/Topbar), route.tsx do /admin e 7 rotas placeholder.
  Commit 6ffff34 (merge fast-forward na main). AdminLayout + navegacao,
  antes previstos na Sprint 2, foram antecipados. Sprint 2 reescopo: foco
  exclusivo em dados/KPIs do dashboard.
- 05/06/2026 (tarde) — Sprint 1 marcada CONCLUIDA. Entregue conforme escopo
  + dois extras: fluxo de reset de senha e sistema de feedback global
  (sonner + GlobalLoadingIndicator). Guard de sessao implementado no layout
  route _authed.tsx (nao no __root). Smoke test OK.
- 05/06/2026 — Sprint 0.5 marcada CONCLUIDA (switch export * puro, admin
  demolido, ADR-002 criado supersedindo ADR-001). Renumeracao: antiga
  Sprint 1 (Dashboard) virou Sprint 2; inserida Sprint 1 = Auth + Login do
  zero. Demais sprints deslocadas +1.
- 02/06/2026 (tarde) — Consolidacao do tech debt em docs/TECHDEBT.md.
- 02/06/2026 — Criacao inicial. Sprint 0.5 introduzida entre 0 e 1.

---

Fim do documento.