# TECHDEBT - FlowStudio AI

> Registro de dividas tecnicas conhecidas.
> Atualizado: 05/06/2026

---

## Aberto

### DEBT-002 [MEDIUM] - UI Kit inexistente
Sem primitivos compartilhados (Input, Button, Field, Card).
Cada tela reimplementa estilos inline com Tailwind + tokens CSS.
Resolver na Sprint 2, junto a DEBT-006 e DEBT-011.

### DEBT-006 [MEDIUM] - Cobertura de features incompleta
Sprint 1 concluida: auth (features/auth + server/auth +
login/forgot/reset + guard _authed.tsx + barrel).
Proximo: dashboard + AdminLayout (Sprint 2).

### DEBT-011 [MEDIUM] - Forms de auth com inputs inline
LoginForm/ForgotPasswordForm/ResetPasswordForm usam input/label/
botao inline com Tailwind cru. Consomem tokens de tema corretamente
(positivo), mas sem primitivo compartilhado. inputBaseClass repetido.
Retrabalho estrutural: extrair Input/Button/Field e religar os 3 forms.
Resolver junto da criacao do UI Kit (Sprint 2, com DEBT-002/006).

### DEBT-012 [LOW] - Service role client inexistente
src/lib/supabase/admin.ts (cliente service role) ainda nao existe.
Criar quando a 1a feature exigir SUPABASE_SERVICE_ROLE_KEY.

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