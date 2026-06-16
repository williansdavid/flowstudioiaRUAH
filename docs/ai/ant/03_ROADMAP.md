
================================================================
ARQUIVO: docs/ai/03_ROADMAP.txt
================================================================

FLOWSTUDIO AI - ROADMAP

Atualizado em: 12/06/2026
Studio de referência: ruah

Legenda:

[x] feito e validado
[~] em andamento
[ ] aberto
[!] bloqueado

================================================================
FASE 0 - FUNDAÇÃO
================================================================

Status: [x] confirmada

[x] 0.1 Arquitetura isolada por studio
[x] 0.2 Stack travada definida
[x] 0.3 Validação de env via Zod
[x] 0.4 Config do studio em src/sites/<studio>/config
[x] 0.5 Fachadas buildBrandingCss e buildSeo

================================================================
FASE 1 - NÚCLEO / AUTH / LAYOUT
================================================================

Status: [x] confirmada

[x] 1.1 Auth SSR
[x] 1.2 Guards de rota por role
[x] 1.3 Clients Supabase anon e service role
[x] 1.4 Layout base e navegação

================================================================
FASE 2 - CRUDS BASE
================================================================

Status: [~] em andamento

[~] 2.1 CRUD services
[~] 2.2 CRUD clients
[~] 2.3 CRUD staff
[~] 2.4 CRUD/admin profiles
[~] 2.5 Revisão de RLS das tabelas acima

Observação:
appointments já foi revisado e travado.
services, clients, staff e profiles ainda possuem pendências de revisão.

================================================================
FASE 3 - APPOINTMENTS BÁSICO
================================================================

Status: [x] confirmada em 12/06/2026

[x] 3.1 CRUD de appointments
    Inclui:
    - createAppointment
    - updateAppointment
    - deleteAppointment
    - updateAppointmentStatus
    - hooks React Query

[x] 3.2 Listagem/calendário admin
    Inclui:
    - AppointmentsList
    - DayCalendar
    - StaffColumn
    - TimeAxis
    - AppointmentBlock
    - staffColor
    - rota agendamentos.tsx

[x] 3.3 Filtros por dia/staff/status
    Estado atual:
    - getDayAppointments filtra por dia no server
    - range UTC-3
    - exclui cancelled
    - particiona por staff no client
    - seletor de status na UI ainda é TD-06

[x] 3.4 RLS de appointments
    7 policies em produção.
    Validado em 12/06/2026.

================================================================
FASE 4 - DISPONIBILIDADE + AGENDAMENTO INTELIGENTE
================================================================

Status: [~] em andamento

Pré-requisitos:

[x] PR.1 services.duration_minutes existe e é INT NOT NULL
[x] PR.2 staff.working_hours vazio, schema definido e livre para criar
[x] PR.3 appointment_status mapeado
    Ocupa:
    - pending
    - confirmed
    - completed

    Não ocupa:
    - cancelled
    - no_show

Entregáveis:

[x] 4.1 DDL staff_time_off + índice + RLS
    Aplicado e validado em produção em 12/06/2026.
    Existem 5 policies.

[x] 4.2 Schema Zod de working_hours
    Grade recorrente + breaks/almoço.

[x] 4.3 UI staff configurar grade recorrente + almoço
    Smoketest validado em 12/06/2026.
    Telas criadas.

[ ] 4.4 UI staff/admin gerenciar folgas/bloqueios
    Tabela usada:
    - staff_time_off

[x] 4.5 Server function de cálculo de slots
    Entregue:
    - getAvailableSlots.ts
    - hook useAvailableSlots

[ ] 4.6 UI agendamento - Janela 1
    Fluxo:
    - cliente
    - serviço
    - profissional
    - avançar

[~] 4.7 UI agendamento - Janela 2
    Estado atual:
    - SlotsStep.tsx existe
    - integração no AppointmentFormModal ainda pendente de confirmação

[ ] 4.8 Override admin
    Regra:
    admin/staff podem agendar fora do horário.
    cliente não pode.

[ ] 4.9 Revalidação anti-overbooking no INSERT
    Deve ser server-side.
    Não confiar somente no client.

[ ] 4.10 Tratamento de fuso
    Usar timestamptz.
    Conversão deve ocorrer no server fn.

[ ] 4.11 Estados loading/error/empty na grade
    Obrigatório para a UI de slots.

Observação:
Contagem atual corrigida:
4 itens concluídos de 11:
- 4.1
- 4.2
- 4.3
- 4.5

================================================================
FASE 5 - PORTAL DO CLIENTE
================================================================

Status: [!] bloqueada

[!] 5.1 Cliente agenda sozinho
    Depende da Fase 4.
    Cliente não possui override.
    Cliente só consome slots válidos.

[ ] 5.2 Histórico de agendamentos do cliente

[ ] 5.3 Cancelamento pelo cliente
    Regras ainda a definir.

================================================================
FASE 6 - FINANCE / LEADS / DASHBOARDS
================================================================

Status: [ ] aberta

[ ] 6.1 Dashboard finance_transactions
[ ] 6.2 Dashboard leads
[ ] 6.3 Relatórios e filtros por período

================================================================
FASE 7 - WHATSAPP + IA
================================================================

Status: [ ] aberta futuro

[ ] 7.1 DDL whatsapp_settings
[ ] 7.2 DDL whatsapp_messages
[ ] 7.3 DDL ai_messages
[ ] 7.4 Integração envio/recebimento
[ ] 7.5 Camada de IA sobre mensagens

================================================================
TECHDEBTS
================================================================

[x] TD-01 Disponibilidade
    Promovida e especificada na Fase 4.

[ ] TD-02 Criar user_roles dedicada
    Hoje role vive em profiles.

[ ] TD-03 Backfill de full_name em staff
    Hoje pode estar null.

[ ] TD-04 Anti-overbooking no insert
    Mapeado no item 4.9.

[ ] TD-05 Trigger set_updated_at em staff_time_off
    Coluna updated_at existe, mas não atualiza sozinha.

[ ] TD-06 Seletor de status na agenda
    getDayAppointments hoje exclui cancelled fixo.
    Falta UI para ver cancelled/no_show quando necessário.

================================================================
RESUMO DE PROGRESSO
================================================================

Fase 0: 100%
Fase 1: 100%
Fase 2: em andamento
Fase 3: 100%
Fase 4: em andamento - 4/11 concluídos
Fase 5: bloqueada por Fase 4
Fase 6: aberta
Fase 7: aberta futuro

