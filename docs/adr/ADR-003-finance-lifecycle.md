# ADR-003 — Finance Lifecycle & Resgate de Schema de Produção

- **Status:** Aceito
- **Data:** 2026-06-08
- **Contexto do studio:** Ruah
- **Relacionado:** DEBT-015, DEBT-016

## Contexto

Auditoria de schema revelou que o **motor de receita** do studio existia
apenas no banco de produção, sem migration no git. Peças fora de
versionamento:

- Tabela `payment_methods`.
- Coluna `appointments.payment_method_id` + FK.
- Colunas de vínculo em `finance_transactions`: `appointment_id`,
  `staff_id`, `payment_method_id`, `occurred_at`.
- Agregados em `clients`: `total_appointments`, `total_spent`,
  `last_visit_at` + denormalizados `full_name`, `phone`, `email`.
- Função `recalc_client_aggregates(uuid)`.
- Função `handle_appointment_lifecycle()` + trigger em `appointments`.

A função `handle_appointment_lifecycle` **não é só agregação** — ela é a
regra de negócio que materializa receita. Comportamento real:

1. **Guard:** bloqueia `completed` sem `payment_method_id` (raise).
2. **INSERT completed:** cria `finance_transactions` (income/service),
   idempotente via `not exists`.
3. **UPDATE → completed:** cria a transação (idempotente).
4. **UPDATE completed → cancelled/no_show:** deleta a transação.
5. **UPDATE completed → completed:** atualiza amount/payment/staff/occurred_at.
6. Em troca de `client_id`, recalcula agregados de OLD e NEW.

Schema vivo sem migration = ambiente não reproduzível. Um studio novo
provisionado do zero não teria o motor de receita.

## Decisão

Migration de resgate **idempotente**
`20260608_011_finance_lifecycle.sql` recriando todas as peças com
`if not exists` / `or replace`. A função foi transcrita **fiel** ao
`pg_get_functiondef` extraído de produção em 08/06/2026.

Reforço de idempotência: índice único parcial
`finance_tx_appointment_income_service_key` garantindo no máximo uma
transação income/service por appointment, complementando o `not exists`
do trigger contra corrida/duplicidade.

Modelo de agregação: `clients.total_spent / total_appointments /
last_visit_at` derivados de `appointments` com `status = 'completed'`,
recalculados pelo trigger AFTER INSERT OR UPDATE.

## Validação

- **Teste 1 (conclusão de atendimento → receita):** validado em produção.
  Concluir gera `finance_transactions` income/service e recalcula
  agregados do cliente.
- `information_schema.columns` confirmou as colunas resgatadas.
- `pg_get_functiondef` confirmou a DDL real da função (transcrita 1:1).
- **Confirmação 08/06/2026 — nome do trigger:** `pg_trigger` confirmou
  `trg_appointment_lifecycle` em `appointments`, idêntico ao da migration.
  Sem risco de trigger duplicado / dupla receita.
- **Confirmação 08/06/2026 — ausência de duplicatas:** query agregada por
  `appointment_id` (income/service) retornou 0 linhas. Índice único
  parcial seguro para aplicar.

## Consequências

- ✅ Ambiente reproduzível do git; novo studio inclui o motor de receita.
- ✅ Receita materializada e idempotente por design.
- ✅ Nome do trigger confirmado contra produção (`trg_appointment_lifecycle`,
  08/06/2026) — sem risco de duplicação.
- ✅ Ausência de duplicatas income/service confirmada em produção
  (08/06/2026) — índice único parcial aplicável com segurança.
- ⚠️ Denormalização em `clients` (`full_name/phone/email`) mantida por
  compatibilidade; revisar coerência com `clients_view`.
- ℹ️ A auditoria revelou também o trigger `trg_appointments_updated_at`
  (atualiza `updated_at` em `appointments`) vivendo só em produção, fora
  do git. Independente do lifecycle e não tocado pela migration 011;
  resgate rastreado em DEBT-016.

## Alternativas descartadas

- Recalcular agregados/receita em runtime: descartado por custo e por já
  existir materialização consolidada.
- Manter schema só em produção: inaceitável (quebra reprodutibilidade).
- Materializar receita na camada de aplicação: descartado — regra crítica
  fica mais segura no banco (transacional, à prova de bypass).
