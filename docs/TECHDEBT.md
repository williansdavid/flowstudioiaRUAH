# TECHDEBT - FlowStudio AI

> Registro de dividas tecnicas conhecidas.
> Atualizado: 08/06/2026

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

### DEBT-015 [HIGH] - Schema de finance lifecycle fora do git (RESGATADO, aguarda aplicacao)
Descoberto 08/06/2026. O motor de receita (payment_methods, vinculos em
finance_transactions, agregados de clients, recalc_client_aggregates,
handle_appointment_lifecycle + trigger) vivia so em producao, sem
migration. Ambiente nao reproduzivel.
Resolucao: migration idempotente 20260608_011_finance_lifecycle.sql,
funcao transcrita FIEL via pg_get_functiondef. ADR-003.
Pendencias residuais RESOLVIDAS (08/06/2026):
- nome real do trigger confirmado: trg_appointment_lifecycle (confere com
  a migration; sem risco de trigger duplicado / dupla receita)
- ausencia de duplicatas income/service confirmada em producao (query
  agregada retornou 0 linhas) -> indice unico parcial seguro
Pendencia restante:
- aplicar a migration 011 em ambiente limpo / novo studio e validar
  (provisionamento). Status segue RESGATADO ate a aplicacao fisica.

### DEBT-016 [MEDIUM] - AJUSTE*.sql nao-idempotente + role duplicada
Descoberto 08/06/2026.
Item (a) ABERTO: AJUSTE.sql e AJUSTE2.sql sao identicos e nao-idempotentes
(adicionam coluna role duplicada) e contrariam a regra de que role mora em
profiles (a tabela user_roles e planejada, nao oficial).
Item (b) RESOLVIDO (08/06/2026): risco de duplicatas income/service
eliminado — query agregada confirmou 0 duplicatas em producao e a migration
011 adiciona indice unico parcial (appointment_id) where income/service.
Descoberta adicional (08/06/2026): existe um segundo trigger vivendo so em
producao, trg_appointments_updated_at (atualiza updated_at em appointments),
fora do versionamento. Independente do lifecycle e nao tocado pela migration
011, mas reforca que ha mais schema fora do git.
Acao proposta: mover AJUSTE*.sql para docs/legacy/ ou deletar; consolidar
role em profiles; resgatar/limpar trg_appointments_updated_at para o git.

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

| ID       | Severidade | Status    | Tema                                      |
|----------|------------|-----------|-------------------------------------------|
| DEBT-002 | MEDIUM     | Aberto    | UI Kit inexistente                        |
| DEBT-006 | MEDIUM     | Aberto    | Cobertura de features                     |
| DEBT-010 | -          | Resolvido | Barrel feature auth                       |
| DEBT-011 | MEDIUM     | Aberto    | Forms auth com inputs inline              |
| DEBT-012 | LOW        | Aberto    | Service role client inexistente           |
| DEBT-013 | LOW        | Aberto    | Binario .exe no historico git             |
| DEBT-014 | MEDIUM     | Aberto    | Rotas admin sao placeholders              |
| DEBT-015 | HIGH       | Resgatado | Finance lifecycle fora do git (aguarda aplicacao) |
| DEBT-016 | MEDIUM     | Aberto    | AJUSTE*.sql + role duplicada (item b resolvido)   |
