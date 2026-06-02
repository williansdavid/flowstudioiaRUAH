# 🗺️ FlowStudio AI — Roadmap do Admin

> **Última atualização:** 02/06/2026
> **Foco atual:** Evoluir o core admin universal
> **Estratégia:** Sprints curtos (1-3 dias cada) com critérios claros de aceitação

---

## 🎯 Visão geral

| Sprint | Tema | Status | Duração estimada |
|--------|------|--------|-------------------|
| **0** | Housekeeping do núcleo | ⏳ Próximo | 0,5 dia |
| **1** | Dashboard funcional | 🔜 | 2 dias |
| **2** | Appointments — fechar CRUD | 🔜 | 2 dias |
| **3** | Finance — módulo completo | 🔜 | 3 dias |
| **4** | Settings — config do studio | 🔜 | 2 dias |
| **5** | WhatsApp integration | 🔜 | 3 dias |
| **6** | AI Chat admin | 🔜 | 2 dias |
| **7** | Leads | 🔜 | 1,5 dia |
| **8** | Polish & hardening | 🔜 | 2 dias |

**Total estimado:** ~18 dias úteis

---

## 🧹 SPRINT 0 — Housekeeping do núcleo

**Objetivo:** Limpar débito técnico antes de evoluir.

### Tarefas

- [ ] Remover `src/features/appointments/index.ts.bak`
- [ ] Remover `src/server/appointments/_shared.ts.bak`
- [ ] Avaliar e remover `src/data/` (pasta órfã vazia)
- [ ] Remover `src/styles/_backup-20260526-122845/`
- [ ] Remover `tailwind.config.ts.bak-20260526-141139`
- [ ] Validar `npm run typecheck` após limpeza
- [ ] Validar `npm run build` após limpeza
- [ ] Commit: `chore: housekeeping core (remove backups e dead code)`

### Aceitação

✅ Zero arquivos `.bak` no núcleo
✅ Build verde
✅ Typecheck verde

---

## 📊 SPRINT 1 — Dashboard funcional

**Objetivo:** Substituir placeholder por dashboard real com KPIs.

### Tarefas

- [ ] Criar `src/features/dashboard/`
  - [ ] `types.ts` — KPI types
  - [ ] `queries.ts` — `dashboardQueries.summary`
  - [ ] `hooks.ts` — `useDashboardSummary`
  - [ ] `components/KpiCard.tsx`
  - [ ] `components/TodayAppointmentsList.tsx`
  - [ ] `components/RevenueChart.tsx` (simples, sem libs novas)
- [ ] Criar `src/server/dashboard/get-summary.ts`
  - [ ] Agendamentos do dia
  - [ ] Receita do mês
  - [ ] Novos clientes (mês)
  - [ ] Taxa de ocupação
- [ ] Atualizar `src/routes/admin/index.tsx` com loader + UI real

### Aceitação

✅ Dashboard mostra dados reais do Supabase
✅ KPIs com loading states (skeleton)
✅ Mobile-first responsivo
✅ SSR via `loader`

---

## 📅 SPRINT 2 — Appointments completo

**Objetivo:** Fechar o CRUD de agendamentos (faltam update, cancel, reschedule, delete).

### Tarefas

- [ ] `src/server/appointments/update-appointment.ts`
- [ ] `src/server/appointments/cancel-appointment.ts`
- [ ] `src/server/appointments/reschedule-appointment.ts`
- [ ] `src/server/appointments/delete-appointment.ts`
- [ ] Adicionar mutations em `features/appointments/hooks.ts`
- [ ] Atualizar `AppointmentFormDialog.tsx` com modo edição
- [ ] Adicionar ações em `AppointmentList.tsx` (editar, cancelar, remarcar)
- [ ] Integrar ações no `CalendarSlot.tsx` (clique no card)
- [ ] Confirmação via dialog antes de cancelar/remover

### Aceitação

✅ É possível editar agendamento
✅ É possível cancelar (status → cancelled)
✅ É possível remarcar (drag-and-drop ou dialog)
✅ É possível excluir (com confirmação)
✅ Calendário reflete mudanças em tempo real

---

## 💰 SPRINT 3 — Finance

**Objetivo:** Criar módulo financeiro completo (não existe hoje).

### Tarefas

- [ ] Criar `src/features/finance/`
  - [ ] `types.ts` — Transaction, TransactionType, Category
  - [ ] `queries.ts`
  - [ ] `hooks.ts`
  - [ ] `components/TransactionList.tsx`
  - [ ] `components/TransactionFormDialog.tsx`
  - [ ] `components/FinanceFiltersBar.tsx`
  - [ ] `components/FinanceSummaryCards.tsx`
- [ ] Criar `src/server/finance/`
  - [ ] `list-transactions.ts`
  - [ ] `create-transaction.ts`
  - [ ] `update-transaction.ts`
  - [ ] `delete-transaction.ts`
  - [ ] `get-summary.ts`
- [ ] Atualizar `src/routes/admin/finance.tsx`
- [ ] Integração automática: appointment concluído → transação receita

### Aceitação

✅ Cadastro de receitas/despesas manuais
✅ Categorias customizáveis
✅ Filtro por período (mês, ano, custom)
✅ Resumo: total receitas, despesas, lucro
✅ Geração automática a partir de appointments

---

## ⚙️ SPRINT 4 — Settings

**Objetivo:** Permitir editar config do studio direto no admin.

### Tarefas

- [ ] Definir o que é editável **em runtime** vs **build time**
- [ ] Criar tabela `studio_settings` (chave-valor JSON) ou colunas dedicadas
- [ ] Criar `src/features/settings/`
  - [ ] Form de identidade (nome, telefone, endereço)
  - [ ] Form de horários de funcionamento
  - [ ] Form de WhatsApp/Instagram
  - [ ] Form de branding básico (cores primárias)
- [ ] Criar `src/server/settings/`
  - [ ] `get-settings.ts`
  - [ ] `update-settings.ts`
- [ ] Atualizar `src/routes/admin/settings.tsx`

### Aceitação

✅ Admin altera horários sem deploy
✅ Admin altera contatos sem deploy
✅ Landing reflete mudanças após refresh
✅ Apenas role `admin` pode editar

---

## 💬 SPRINT 5 — WhatsApp Integration

**Objetivo:** Histórico + envio de mensagens.

### Tarefas

- [ ] Definir provider (Twilio, Z-API, Evolution API — **decidir**)
- [ ] Criar `src/features/whatsapp/`
  - [ ] `components/ConversationList.tsx`
  - [ ] `components/MessageThread.tsx`
  - [ ] `components/MessageInput.tsx`
- [ ] Criar `src/server/whatsapp/`
  - [ ] `list-conversations.ts`
  - [ ] `send-message.ts`
  - [ ] `webhook-receive.ts` (endpoint público)
- [ ] Tabelas: `whatsapp_messages`, `whatsapp_settings`
- [ ] Real-time via Supabase Realtime (opcional MVP)

### Aceitação

✅ Listar conversas
✅ Enviar mensagem manual
✅ Receber via webhook
✅ Settings: número conectado, status

---

## 🤖 SPRINT 6 — AI Chat Admin

**Objetivo:** Painel pra ver/configurar o chat IA da landing.

### Tarefas

- [ ] Listar histórico de conversas IA (`ai_messages`)
- [ ] Configurar prompt do studio
- [ ] Configurar respostas automáticas
- [ ] Métricas: conversas/dia, conversão lead

### Aceitação

✅ Histórico navegável
✅ Prompt editável
✅ Métricas básicas

---

## 🎯 SPRINT 7 — Leads

**Objetivo:** Gestão de leads vindos da landing.

### Tarefas

- [ ] Criar `src/features/leads/components/`
- [ ] Server functions: list, update-status, convert-to-client
- [ ] Pipeline: novo → contatado → agendado → convertido
- [ ] Filtros por origem (landing, WhatsApp, IA chat)

### Aceitação

✅ Visualizar pipeline
✅ Converter lead em client
✅ Histórico de interações

---

## ✨ SPRINT 8 — Polish & Hardening

**Objetivo:** Refinar antes de declarar admin v1 "pronto".

### Tarefas

- [ ] Auditar todos os loading states
- [ ] Auditar empty states
- [ ] Auditar error boundaries
- [ ] Auditar acessibilidade (a11y básico)
- [ ] Auditar mobile (drawer, formulários, tabelas)
- [ ] Performance: lazy load de rotas pesadas
- [ ] Logs estruturados (server functions)
- [ ] Documentação inline (JSDoc onde necessário)
- [ ] Atualizar ARCHITECTURE.md e CHECKPOINT.md

### Aceitação

✅ Lighthouse Admin ≥ 90
✅ Zero erros no console
✅ Mobile 100% navegável
✅ Docs atualizadas

---

## 🚫 Fora de escopo (por enquanto)

- Multi-tenant no banco
- Microserviços
- Filas / event sourcing
- App mobile nativo
- Internacionalização (apenas pt-BR)
- Tema dark/light toggle (apenas tema premium definido por studio)

---

## 📌 Notas de execução

- Cada sprint encerra com **commit padrão** (`feat:`, `chore:`, `fix:`)
- Atualizar `CHECKPOINT.md` ao fim de cada sprint
- Validar `typecheck` + `build` antes de fechar sprint
- Nenhuma alteração em `src/sites/ruah/` durante essas sprints (zona congelada)

---

**Fim do documento.**
