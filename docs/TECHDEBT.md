# TECHDEBT - FlowStudio AI

> Registro de dividas tecnicas conhecidas.
> Atualizado: 10/06/2026

---

## Aberto

### DEBT-002 [MEDIUM] - UI Kit inexistente
Sem primitivos compartilhados (Input, Button, Field, Card). Cada tela
reimplementa estilos inline com Tailwind + tokens CSS. Admin-shell, telas
placeholder, dashboard e appointments seguem sem primitivo compartilhado.
Decidir se o UI Kit nasce como sprint propria (resolve com DEBT-011).

### DEBT-006 [MEDIUM] - Cobertura de features incompleta
Concluidas: auth, casca do admin, dashboard (dados reais), appointments
(lista + update de status). Faltam: financeiro, clientes, equipe, servicos,
agenda e settings — ver DEBT-014.

### DEBT-011 [MEDIUM] - Forms de auth com inputs inline
LoginForm/ForgotPasswordForm/ResetPasswordForm usam input/label/botao inline
com Tailwind cru (inputBaseClass repetido). Extrair Input/Button/Field e
religar os 3 forms. Resolver junto do UI Kit (DEBT-002).

### DEBT-012 [LOW] - Service role client inexistente
src/lib/supabase/admin.ts (cliente service role) ainda nao existe.
Criar quando a 1a feature exigir SUPABASE_SERVICE_ROLE_KEY.

### DEBT-013 [LOW] - Binario .exe no historico do git
birdid-sign-plugin.exe (~30 MB) removido da arvore no merge 6ffff34, mas
persiste no historico. Resolver com git filter-repo (ou BFG) se o repo pesar.

### DEBT-014 [MEDIUM] - Rotas admin placeholder remanescentes
5 rotas ainda renderizam PlaceholderScreen: agenda, clientes, equipe,
financeiro, servicos. (index/dashboard e agendamentos JA sairam do
placeholder.) Preencher progressivamente nas proximas sprints.

### DEBT-015 [HIGH] - Finance lifecycle versionado, aguarda aplicacao
Motor de receita resgatado em migration idempotente
20260608_011_finance_lifecycle.sql (ADR-003). Trigger
(trg_appointment_lifecycle) e ausencia de duplicatas income/service
confirmados em producao. Pendencia restante: aplicar a migration em
ambiente limpo / novo studio e validar Teste 1 (conclusao -> receita).
Status segue RESGATADO ate a aplicacao fisica.

### DEBT-016 [MEDIUM] - AJUSTE*.sql nao-idempotente + role duplicada
Item (a) ABERTO: supabase/migrations/20260522_AJUSTE.sql, _AJUSTE2.sql e
_AJUSTE3.sql convivem com as migrations oficiais. AJUSTE/AJUSTE2 adicionam
coluna role duplicada, contrariando a regra de que role mora em profiles
(user_roles e planejada, nao oficial). Acao: mover para docs/legacy/ ou
deletar; consolidar role em profiles.
Item (b) RESOLVIDO (08/06/2026): duplicatas income/service eliminadas
(0 em prod + indice unico parcial na migration 011).
Pendencia adicional: trg_appointments_updated_at vive so em producao
(fora do git) — resgatar em migration propria.

### DEBT-017 [LOW] - Fundacao WhatsApp orfa
src/lib/utils/whatsapp.ts e src/components/icons/WhatsAppIcon.tsx criados
no marco 3fd90d7 como fundacao, mas ainda NAO sao importados por nenhuma
feature. Plugar quando a feature WhatsApp iniciar ou registrar como
intencional. Manter isolados ate la.

### DEBT-018 [LOW] - Lixo de styles no studio Ruah
src/sites/ruah/styles/base.css.err e base.csse sao arquivos invalidos
(extensoes quebradas), residuo de edicao. Deletar.

---

## Resolvido

### DEBT-010 [resolvido em 05/06/2026] - Barrel da feature auth
Criado index.ts expondo contrato publico da feature auth (types, queries,
hooks, layouts). Forms e LoginBrandPanel mantidos internos.

---

## Sumario

| ID       | Severidade | Status    | Tema                                        |
|----------|------------|-----------|---------------------------------------------|
| DEBT-002 | MEDIUM     | Aberto    | UI Kit inexistente                          |
| DEBT-006 | MEDIUM     | Aberto    | Cobertura de features                       |
| DEBT-010 | -          | Resolvido | Barrel feature auth                         |
| DEBT-011 | MEDIUM     | Aberto    | Forms auth com inputs inline                |
| DEBT-012 | LOW        | Aberto    | Service role client inexistente             |
| DEBT-013 | LOW        | Aberto    | Binario .exe no historico git               |
| DEBT-014 | MEDIUM     | Aberto    | 5 rotas admin placeholder remanescentes     |
| DEBT-015 | HIGH       | Resgatado | Finance lifecycle (aguarda aplicacao)       |
| DEBT-016 | MEDIUM     | Aberto    | AJUSTE*.sql + role duplicada (item b ok)    |
| DEBT-017 | LOW        | Aberto    | Fundacao WhatsApp orfa                       |
| DEBT-018 | LOW        | Aberto    | Lixo de styles no Ruah (base.css.err/csse)  |
