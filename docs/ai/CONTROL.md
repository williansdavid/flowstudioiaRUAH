# FLOWSTUDIO AI — ARQUIVO DE CONTROLE
> Fonte única de foco. Editar topo = trocar missão. O agente mantém o resto.

================================================================
## 🎯 TOPO — VOCÊ PREENCHE (define a missão)
================================================================

MISSÃO:


OBJETIVO:


FORA DE ESCOPO:
> - nada em src/sites sem OK explícito
> - sem RLS / migration / nova tabela sem OK

CRITÉRIO DE ACEITE:
> - smoketest ok

================================================================
## 🧭 CABEÇALHO OBRIGATÓRIO (toda resposta do agente)
================================================================
Toda msg DEVE começar com:

> Missão ativa: <missão> | Etapa: <investigar | confirmar | propor | aguardar OK | entregar>

================================================================
## 🔁 FLUXO (inviolável)
================================================================
investigar → confirmar → propor → AGUARDAR OK → entregar → registrar

- Não executar código sem OK explícito.
- OK válido: "pode executar", "aprovado, siga", "pode aplicar".
- NÃO é OK: "entendi", "faz sentido", "manda o plano".
- Tarefa fora da missão → registrar como techdeb, não desviar.
- Nunca chutar API/coluna/tabela: investigar arquivo real primeiro.

================================================================
## 💬 COMUNICAÇÃO + ENTREGA DE CÓDIGO
================================================================
- PT-BR, técnico-direto, sem floreio. Tratar por "Willians" quando natural.
- Ambiguidade → perguntar (não listar 10 opções).
- Errou → admitir + corrigir na hora.
- Código SEMPRE em bloco com linguagem (```ts, ```sql, ```powershell).
- **SEMPRE devolver o caminho do arquivo alterado.**
- **Se o arquivo tem várias alterações → entregar o arquivo COMPLETO**, não trechos soltos.
- UI: mobile-first, SSR-safe, com loading/error/empty.
- TS estrito (noUncheckedIndexedAccess).

================================================================
## ⚠️ POWERSHELL (Windows — header obrigatório)
================================================================
Todo comando de diagnóstico começa com:

```powershell
$ErrorActionPreference = "Stop"
[Environment]::CurrentDirectory = (Get-Location).Path
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8
chcp 65001 > $null


Problemas conhecidos:

Acentuação quebra sem o header UTF-8 acima → sempre incluir.
Sempre mandar comando PRONTO pra colar (não pseudo-comando).
Para ler arquivo: Get-Content "caminho" -Encoding UTF8.
Para grep: Select-String -Pattern "x" -SimpleMatch.
================================================================

🏗️ ARQUITETURA (regras travadas)
================================================================

1 studio = 1 Netlify + 1 Supabase + 1 banco + 1 landing. NUNCA multi-tenant.
Módulo SISTEMA (src/lib, rotas/core) NUNCA importa de src/sites.
Módulo SITE (src/sites/<studio>) consome core via fachadas.
Identidade do studio → src/sites/<studio>/config (NÃO em env).
Disponibilidade é DERIVADA (sem tabela de slots). Slots = 30min fixo. Fatos: staff.working_hours + staff_time_off + appointments.
role vive em profiles hoje (user_roles é futuro).
Override: admin/staff agendam fora da grade; cliente não.
Stack travada (nova lib só com OK): TanStack Start/Router · React Query · TS estrito · Supabase (Auth/PG/RLS) · Tailwind · Vite · Netlify · Lucide · Sonner · Zod · framer-motion.

================================================================

🗄️ BANCO (tabelas REAIS — não inventar)
================================================================

profiles (id, email, role, full_name, phone, avatar_url, is_active)
clients (profile_id opcional) · view: clients_view
staff (id, full_name, specialty, bio, phone, commission_rate, is_bookable, display_order, profile_id, working_hours, timestamps)
services (duration_minutes INT NOT NULL, price, is_active, ...)
appointments (client_id, staff_id, service_id, status enum)
finance_transactions (type, category enum)
leads (status, source enum)
staff_time_off (id, staff_id, starts_at, ends_at, reason, timestamps)
Enums: appointment_status (pending/confirmed/completed/cancelled/no_show), user_role (admin/staff/client), lead_source, lead_status, transaction_category, transaction_type. Function: current_user_role(). Ocupa slot: pending, confirmed, completed. NÃO ocupa: cancelled, no_show.

NÃO existem ainda: whatsapp_messages, whatsapp_settings, ai_messages, user_roles.

RLS travada (12/06/26): appointments (7 policies), staff_time_off (5 policies).

================================================================

🗺️ ROADMAP (marcar [x] feito · [~] andamento · [ ] aberto · [!] bloqueado)
================================================================ FASE 0 — FUNDAÇÃO ............................. [x] FASE 1 — NÚCLEO/AUTH/LAYOUT ................... [x] FASE 2 — CRUDS BASE ........................... [] [] 2.1 services [] 2.2 clients [] 2.3 staff [] 2.4 profiles [] 2.5 revisão RLS FASE 3 — APPOINTMENTS BÁSICO .................. [x] FASE 4 — DISPONIBILIDADE + AGENDAMENTO ........ [] (4/11) [x] 4.1 DDL staff_time_off [x] 4.2 schema working_hours [x] 4.3 UI grade recorrente [ ] 4.4 UI folgas/bloqueios [x] 4.5 getAvailableSlots [ ] 4.6 UI agendamento Janela 1 [] 4.7 UI agendamento Janela 2 (SlotsStep ↔ Modal pendente) [ ] 4.8 override admin [ ] 4.9 anti-overbooking insert [ ] 4.10 fuso [ ] 4.11 loading/error/empty grade FASE 5 — PORTAL CLIENTE ....................... [!] (depende F4) FASE 6 — FINANCE/LEADS/DASHBOARDS ............. [ ] FASE 7 — WHATSAPP + IA ........................ [ ]

================================================================

🧱 TECHDEBT
================================================================ [ ] TD-02 criar user_roles dedicada (role hoje em profiles) [ ] TD-03 backfill full_name em staff (pode estar null) [ ] TD-04 anti-overbooking no insert (item 4.9) [ ] TD-05 trigger set_updated_at em staff_time_off [ ] TD-06 seletor de status na agenda (getDayAppointments exclui cancelled fixo)

================================================================

📌 ESTADO DA MISSÃO ATUAL (agente mantém)
================================================================ Arquivos investigados:

Arquivos a alterar:

Decisões tomadas:

Pendências / próximo passo:

