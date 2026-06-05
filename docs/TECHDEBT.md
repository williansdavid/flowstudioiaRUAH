# TECHDEBT - FlowStudio AI

> Registro de dividas tecnicas conhecidas.
> Atualizado: 05/06/2026 (noite)

---

## Aberto

### DEBT-002 [MEDIUM] - UI Kit inexistente
Sem primitivos compartilhados (Input, Button, Field, Card).
Cada tela reimplementa estilos inline com Tailwind + tokens CSS.
A Sprint 1.5 trouxe admin-shell e telas placeholder tambem sem primitivo
compartilhado, aumentando a superficie da divida. Decidir na Sprint 2 se
o UI Kit nasce junto ou vira sprint propria (resolve com DEBT-011).

### DEBT-006 [MEDIUM] - Cobertura de features incompleta
Auth concluida (Sprint 1). Casca do admin concluida (Sprint 1.5:
admin-shell + rotas). Faltam as features de dominio (dashboard com dados,
appointments, financeiro, settings) — ver Sprints 2 a 5.

### DEBT-011 [MEDIUM] - Forms de auth com inputs inline
LoginForm/ForgotPasswordForm/ResetPasswordForm usam input/label/botao
inline com Tailwind cru. Consomem tokens de tema corretamente (positivo),
mas sem primitivo compartilhado. inputBaseClass repetido. Retrabalho
estrutural: extrair Input/Button/Field e religar os 3 forms.
Resolver junto da criacao do UI Kit (com DEBT-002).

### DEBT-012 [LOW] - Service role client inexistente
src/lib/supabase/admin.ts (cliente service role) ainda nao existe.
Criar quando a 1a feature exigir SUPABASE_SERVICE_ROLE_KEY.

### DEBT-013 [LOW] - Binario .exe no historico do git
birdid-sign-plugin.exe (~30 MB) foi removido da arvore no merge 6ffff34,
mas persiste no historico do git, inflando clone e tamanho do .git.
Resolver com git filter-repo (ou BFG) quando/se o repo passar a pesar.
Operacao reescreve historico — exige coordenacao (e dev unico, baixo risco).

### DEBT-014 [MEDIUM] - Rotas admin sao placeholders
As 7 rotas sob _authed/admin/ (index, agenda, agendamentos, clientes,
equipe, financeiro, servicos) renderizam PlaceholderScreen, sem dados
ou CRUD reais. Preencher progressivamente: dashboard na Sprint 2,
appointments na Sprint 3, financeiro na Sprint 4, settings na Sprint 5.

---

## Resolvido

### DEBT-010 [resolvido em 05/06/2026] - Barrel da feature auth
features/auth nao tinha index.ts (esquecimento, nao decisao).
Criado barrel expondo contrato publico: types (UserRole, AuthProfile,
SessionData, ADMIN_ROLES, canAccessAdmin), queries (authKeys,
sessionQueryOptions), 5 hooks e os 3 layouts montados pelas rotas
(LoginSplitLayout, ForgotPasswordLayout, ResetPasswordLayout).
Forms e LoginBrandPanel mantidos internos (detalhe dos layouts).
Imports das rotas mantidos por path direto (migracao opcional futura).

---

## Sumario

| ID       | Severidade | Status    | Tema                            |
|----------|------------|-----------|---------------------------------|
| DEBT-002 | MEDIUM     | Aberto    | UI Kit inexistente              |
| DEBT-006 | MEDIUM     | Aberto    | Cobertura de features           |
| DEBT-010 | -          | Resolvido | Barrel feature auth             |
| DEBT-011 | MEDIUM     | Aberto    | Forms auth com inputs inline    |
| DEBT-012 | LOW        | Aberto    | Service role client inexistente |
| DEBT-013 | LOW        | Aberto    | Binario .exe no historico git   |
| DEBT-014 | MEDIUM     | Aberto    | Rotas admin sao placeholders    |