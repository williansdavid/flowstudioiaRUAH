
FLOWSTUDIO AI - CONTEXTO BASE DO PROJETO

Atualizado em: 12/06/2026
Studio de referência: ruah

----------------------------------------------------------------
1. VISÃO GERAL
----------------------------------------------------------------

FlowStudio AI é uma plataforma white-label para studios de beleza.

Arquitetura:
- Um Netlify por studio.
- Um Supabase por studio.
- Um banco por studio.
- Uma landing/config por studio.
- Nunca usar multi-tenant.

Existem dois módulos mentais:

1. MÓDULO SISTEMA
   Núcleo compartilhado entre studios.
   Exemplos:
   - src/lib
   - src/routes estruturais
   - componentes core
   - auth
   - guards
   - Supabase clients
   - funções server
   - tipos

2. MÓDULO SITE
   Configuração individual do studio.
   Exemplo:
   - src/sites/ruah
   - branding
   - identidade
   - conteúdo
   - businessHours
   - utilitários específicos do site

Regra de ouro:
- Sistema nunca importa de src/sites.
- Sites consomem lib/core por fachadas.
- Fonte única da verdade por entidade.
- Nada de cache materializado para disponibilidade.

----------------------------------------------------------------
2. STACK OFICIAL
----------------------------------------------------------------

Stack travada:

- TanStack Start
- TanStack Router
- React Query
- TypeScript estrito
- noUncheckedIndexedAccess
- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Tailwind
- Vite
- Netlify
- Lucide
- Sonner
- Zod
- framer-motion

----------------------------------------------------------------
3. BANCO - TABELAS EXISTENTES
----------------------------------------------------------------

Tabelas existentes:

profiles:
- id
- email
- role
- full_name
- phone
- avatar_url
- is_active

clients:
- profile_id opcional

staff:
- profile_id
- working_hours jsonb

services:
- id
- name
- description
- duration_minutes INT NOT NULL
- price
- category
- image_url
- is_active
- display_order
- outros campos existentes

appointments:
- client_id
- staff_id
- service_id
- status enum
- outros campos existentes

finance_transactions:
- type income/expense
- category enum

leads:
- status enum
- source enum

staff_time_off:
- tabela real
- criada em produção em 12/06/2026
- usada para folgas e bloqueios pontuais de staff

View existente:
- clients_view

Function existente:
- current_user_role()

----------------------------------------------------------------
4. ENUMS EXISTENTES
----------------------------------------------------------------

appointment_status:
- pending
- confirmed
- completed
- cancelled
- no_show

user_role:
- admin
- staff
- client

Também existem:
- lead_source
- lead_status
- transaction_category
- transaction_type

----------------------------------------------------------------
5. TABELAS PLANEJADAS, MAS AINDA NÃO EXISTENTES
----------------------------------------------------------------

Não assumir que estas tabelas existem:

- whatsapp_messages
- whatsapp_settings
- ai_messages
- user_roles

Observação:
role vive em profiles hoje.
user_roles é futuro.

----------------------------------------------------------------
6. REGRA DE OCUPAÇÃO DA AGENDA
----------------------------------------------------------------

Statuses que ocupam slot:

- pending
- confirmed
- completed

Statuses que não ocupam slot:

- cancelled
- no_show

----------------------------------------------------------------
7. DISPONIBILIDADE
----------------------------------------------------------------

Disponibilidade é derivada.

Não existe tabela de slots.

A disponibilidade vem de três fatos:

1. staff.working_hours
2. staff_time_off
3. appointments

Fórmula mental:

disponível =
businessHours do dia
interseção com working_hours do staff
menos breaks/almoço
menos staff_time_off
menos appointments que ocupam slot

----------------------------------------------------------------
8. STAFF.WORKING_HOURS
----------------------------------------------------------------

Formato definido:
definido e importado de src/sites/ruah/config/businessHours.ts

----------------------------------------------------------------
9. STAFF_TIME_OFF
----------------------------------------------------------------

Tabela real:

staff_time_off:
- id uuid primary key
- staff_id uuid not null
- starts_at timestamptz not null
- ends_at timestamptz not null
- reason text
- created_at timestamptz
- updated_at timestamptz

Constraint:
- ends_at > starts_at

Índice:
- staff_id, starts_at, ends_at

Observação:
updated_at existe, mas ainda não possui trigger automática.
Isso está mapeado como TD-05.

----------------------------------------------------------------
10. APPOINTMENTS
----------------------------------------------------------------

appointments possui RLS travada em 12/06/2026.

Resumo:

admin/staff:
- acesso total via current_user_role() IN ('admin', 'staff')

client:
- SELECT/UPDATE somente dos próprios appointments
- INSERT permitido somente com status pending
- DELETE não permitido

----------------------------------------------------------------
11. LEITURA DA AGENDA DO DIA
----------------------------------------------------------------

getDayAppointments:

- Busca o dia inteiro em uma query.
- Usa range UTC-3.
- Exclui cancelled no server.
- Particiona por staff no client.
- Não deve fazer N requests por staff.
- Filtro server-side por staff/status não existe por design.
- Seletor de status na UI está mapeado como TD-06.

