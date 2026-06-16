
================================================================
ARQUIVO: docs/ai/02_ARCHITECTURE_DECISIONS.txt
================================================================

FLOWSTUDIO AI - DECISÕES DE ARQUITETURA

Atualizado em: 12/06/2026

----------------------------------------------------------------
AD-01 - ARQUITETURA ISOLADA POR STUDIO
----------------------------------------------------------------

Cada studio possui:

- 1 Netlify
- 1 Supabase
- 1 banco
- 1 landing
- 1 identidade/config

Nunca usar multi-tenant.

----------------------------------------------------------------
AD-02 - STACK TRAVADA
----------------------------------------------------------------

Stack oficial:

- TanStack Start
- TanStack Router
- React Query
- TypeScript
- Supabase
- Tailwind
- Vite
- Netlify
- Lucide
- Sonner
- Zod
- framer-motion

Nova lib somente com justificativa forte e OK do Willians.

----------------------------------------------------------------
AD-03 - IDENTIDADE DO STUDIO
----------------------------------------------------------------

Identidade do studio mora em:

src/sites/<studio>/config

Não colocar identidade do studio em env.

----------------------------------------------------------------
AD-04 - ENV
----------------------------------------------------------------

Validação de env via Zod em:

src/lib/env.ts

----------------------------------------------------------------
AD-05 - ROLE
----------------------------------------------------------------

role vive em profiles hoje.

user_roles é futuro e ainda não existe.

----------------------------------------------------------------
AD-06 - FACHADAS DO SITE
----------------------------------------------------------------

Fachadas específicas podem existir em:

src/sites/<studio>/utils

Exemplos:
- buildBrandingCss
- buildSeo

----------------------------------------------------------------
AD-07 - UI
----------------------------------------------------------------

Toda UI deve ser:

- mobile-first
- SSR-safe
- com loading state
- com error state
- com empty state quando aplicável

----------------------------------------------------------------
AD-08 - GRANULARIDADE DOS SLOTS
----------------------------------------------------------------

Slots têm granularidade fixa de 30 minutos.

----------------------------------------------------------------
AD-09 - DISPONIBILIDADE DERIVADA
----------------------------------------------------------------

Não criar tabela materializada de slots.

Disponibilidade é calculada a partir de:

- staff.working_hours
- staff_time_off
- appointments

Motivos:
- evita dessincronização
- evita overbooking por cache ruim
- evita explosão de linhas
- preserva fonte única da verdade

----------------------------------------------------------------
AD-10 - FATOS DA DISPONIBILIDADE
----------------------------------------------------------------

A disponibilidade mora em três fatos:

1. staff.working_hours
2. staff_time_off
3. appointments

----------------------------------------------------------------
AD-11 - OVERRIDE ADMIN
----------------------------------------------------------------

admin/staff podem agendar fora do horário do salão e fora da grade.

Isso ignora validação de disponibilidade.

Cliente no portal não pode.

Cliente só vê slots válidos.

----------------------------------------------------------------
AD-12 - RLS STAFF_TIME_OFF
----------------------------------------------------------------

RLS travada em 12/06/2026.

admin:
- acesso total

staff:
- CRUD completo sobre as próprias folgas
- vínculo via staff.profile_id = auth.uid()

Policies ativas:
- staff_time_off_admin_all
- staff_time_off_self_select
- staff_time_off_self_insert
- staff_time_off_self_update
- staff_time_off_self_delete

----------------------------------------------------------------
AD-13 - RLS APPOINTMENTS
----------------------------------------------------------------

RLS travada em 12/06/2026.

admin/staff:
- SELECT
- INSERT
- UPDATE
- DELETE

client:
- SELECT dos próprios appointments
- UPDATE dos próprios appointments
- INSERT somente com status pending
- sem DELETE

Existem 7 policies ativas em produção.

----------------------------------------------------------------
AD-14 - GET_DAY_APPOINTMENTS
----------------------------------------------------------------

Leitura da agenda do dia:

- Buscar o dia inteiro em uma query.
- Particionar por staff no client.
- Não fazer N requests.
- Excluir cancelled no server.
- Seletor de status na UI é TD-06.

