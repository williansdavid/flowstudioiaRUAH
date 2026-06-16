================================================================
ROADMAP DE ACOMPANHAMENTO — CADASTRO DE PROFISSIONAL
FlowStudio AI  |  Studio: ruah  |  Status: FASE 7 (convite/SMTP) << ATIVA
================================================================

LEGENDA: [ ] pendente   [~] em andamento   [x] concluído   [!] bloqueado

----------------------------------------------------------------
FASE 0 — PRÉ-REQUISITOS (investigação) ................. CONCLUÍDA
----------------------------------------------------------------
[x] Ler supabase/server.ts ............................ OK
[x] Ler StaffList.tsx + rota equipe ................... OK
[x] Validar SUPABASE_SERVICE_ROLE_KEY no env.ts ....... OK
[x] Verificar trigger handle_new_user ................. INCONCLUSIVO
    -> mitigado: upsert idempotente no profiles
[x] Confirmar form (mínimo+2) ......................... OK
[x] OK EXPLÍCITO do Willians pra iniciar código ....... OK

----------------------------------------------------------------
FASE 1 — INFRAESTRUTURA (Módulo Sistema) ............... CONCLUÍDA
----------------------------------------------------------------
[x] 1.1  src/lib/supabase/admin.ts (NOVO) ............. ENTREGUE
[x] 1.2  Conferir import @supabase/supabase-js ........ CONFIRMADO

----------------------------------------------------------------
FASE 2 — BACKEND / ACTION .............................. CONCLUÍDA
----------------------------------------------------------------
[x] 2.1  src/features/staff/server/createStaff.ts (NOVO)  ENTREGUE
[x] 2.2  Patch B1 aplicado + revisado (sem password) .... OK

----------------------------------------------------------------
FASE 3 — DATA LAYER / HOOKS ............................ CONCLUÍDA
----------------------------------------------------------------
[x] 3.1  src/features/staff/types.ts (EDITAR) ......... ENTREGUE
         - CreateStaffFormValues = alias de CreateStaffInput
         - TD-07 não tocado
[x] 3.2  src/features/staff/hooks.ts (EDITAR) ......... ENTREGUE
         - useCreateStaff(): useMutation<Result,Error,Input>
         - onSuccess -> invalidate ['staff','list'] + toast
         - reasons tratados na UI (Fase 4)
[x] 3.3  tsc --noEmit limpo (confirmado Willians) ..... OK

----------------------------------------------------------------
FASE 4 — UI ............................................ CONCLUÍDA
----------------------------------------------------------------
[x] 4.1  StaffFormModal.tsx (NOVO) — form 5 campos ..... ENTREGUE
         - Radix Dialog + padrão TimeOffFormModal
         - validação client (nome/email/phone) via useMemo
         - EMAIL_TAKEN inline no campo + faixa âmbar p/ demais
         - is_bookable checkbox (default true)
[x] 4.2  StaffList.tsx (EDITAR) — botão + open/close .... ENTREGUE
[x] 4.3  index.ts (EDITAR) — export StaffFormModal ..... ENTREGUE
[x] 4.4  tsc --noEmit limpo (confirmado Willians) ...... OK

----------------------------------------------------------------
FASE 5 — VALIDAÇÃO / DEFINIÇÃO DE PRONTO ............... CONCLUÍDA
----------------------------------------------------------------
[x] 5.0  Confirmar tipagem rpc('current_user_role') +
         assinatura createSupabaseServer() .............. OK
[x] 5.1  Admin cadastra -> profissional aparece na lista  OK
[x] 5.2  Email duplicado -> erro claro, sem lixo no banco  OK
[x] 5.3  Não-admin -> bloqueado server-side ............. OK
         - reforço UX: gate isAdmin no StaffList
           (botão + modal só montam p/ admin)
[x] 5.4  Build limpo / sem warning de tipo / SSR-safe ... OK

----------------------------------------------------------------
FASE 6 — EDIÇÃO DE PROFISSIONAL ........................ CONCLUÍDA
----------------------------------------------------------------
[x] 6.0  Investigar: listStaff retorna campos editáveis?
         -> resolvido: email + phone adicionados ao listStaff
            (join profiles.email; canEdit no item: admin|dono)
[x] 6.1  Backend: updateStaff.ts (server fn + gate admin/dono)
         - retorno discriminado FORBIDDEN|NOT_FOUND|UNKNOWN
         - email NÃO editável (read-only)
[x] 6.2  Hook useUpdateStaff() (invalidate ['staff','list'])
[x] 6.3  UI: StaffFormModal reusado em modo create|edit
         (TD-09 absorvido)
[x] 6.4  StaffList: botão "Editar" no card (gate canEdit)
[x] 6.5  Validação: editar -> persiste -> reflete na lista  OK
[x] 6.6  tsc --noEmit limpo + SSR-safe (confirmado Willians) OK

----------------------------------------------------------------
FASE 7 — CONVITE DO PROFISSIONAL (SMTP) ................ << ATIVA
----------------------------------------------------------------
[ ] 7.0  Investigar: SMTP configurado no Supabase ruah?
         (Auth > Settings > SMTP / templates de email)
[ ] 7.1  TD-10: fluxo de convite depende de SMTP no Supabase ruah
[ ] 7.2  TD-11: reenvio de convite ao profissional
[ ] 7.3  Validação: convite enviado -> recebido -> aceito
[ ] 7.4  tsc --noEmit limpo + SSR-safe

----------------------------------------------------------------
TECHDEB GERADO (backlog — fora desta missão)
----------------------------------------------------------------
[ ] TD-07  StaffListItem duplicada em types.ts
[ ] TD-08  sincronizar profiles.full_name <-> staff.full_name no update
[x] TD-09  edição de profissional -> CONCLUÍDO NA FASE 6
[x] TD-10  convite depende de SMTP -> PROMOVIDO À FASE 7
[x] TD-11  reenvio de convite -> PROMOVIDO À FASE 7

----------------------------------------------------------------
PROGRESSO GERAL
----------------------------------------------------------------
Fase 0: 6/6  ██████████  CONCLUÍDA
Fase 1: 2/2  ██████████  CONCLUÍDA
Fase 2: 2/2  ██████████  CONCLUÍDA
Fase 3: 3/3  ██████████  CONCLUÍDA
Fase 4: 4/4  ██████████  CONCLUÍDA
Fase 5: 5/5  ██████████  CONCLUÍDA
Fase 6: 7/7  ██████████  CONCLUÍDA
Fase 7: 0/5  ░░░░░░░░░░  ATIVA
TOTAL: 29/34 ████████░░  (85%)
================================================================
