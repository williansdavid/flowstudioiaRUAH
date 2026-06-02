# FlowStudio AI — Roadmap

Ultima atualizacao: 02/06/2026 (tarde)
Estrategia: Sprints curtas, foco em fundacao antes de features novas.

---

## Visao geral das sprints

- Sprint 0     Housekeeping                                CONCLUIDA
- Sprint 0.5   Fundacao White-Label (switch active-studio) EM ANDAMENTO
- Sprint 1     Dashboard administrativo                    PLANEJADA
- Sprint 2     Appointments — update/cancel/reschedule     PLANEJADA
- Sprint 3     Modulo Financeiro                           PLANEJADA
- Sprint 4     Settings (configuracoes do studio)          PLANEJADA
- Sprint 5     Integracao WhatsApp                         PLANEJADA
- Sprint 6     Chat IA real                                PLANEJADA
- Sprint 7     Hardening + observabilidade                 PLANEJADA
- Sprint 8     Segundo studio (validacao white-label)      PLANEJADA

---

## Sprint 0 — Housekeeping (CONCLUIDA)

Objetivo: Limpar o repositorio antes de evoluir arquitetura.

Entregas:

- Remocao de arquivos .bak no nucleo
- Remocao de pastas orfas
- Remocao de backups antigos de styles
- Build + typecheck verdes
- Commit oficial aplicado

---

## Sprint 0.5 — Fundacao White-Label (EM ANDAMENTO)

Objetivo: Estabelecer o switch unico de studio ativo e desacoplar o
nucleo de src/sites/ruah/.

Entregas planejadas:

- [x] Criar docs/adr/ e ADR-001
- [x] Criar docs/CHECKPOINT.md
- [x] Criar docs/ARCHITECTURE.md (v1.1 com secao White-Label Switch)
- [x] Criar docs/ROADMAP.md (este arquivo)
- [x] Criar src/sites/_legacy/ (placeholder)
- [x] Consolidar tech debt legado em docs/TECHDEBT.md
- [x] Arquivar pasta checkpoints/ em src/_legacy/docs/checkpoints/
- [x] Mover src/admin/ antigo para src/_legacy/admConfig/
- [ ] Mapear consumidores atuais de src/sites/ruah/config/
- [ ] Criar src/sites/ruah/studio.ts (export consolidado)
- [ ] Criar src/config/active-studio.ts (switch)
- [ ] Migrar imports do nucleo para @/config/active-studio
- [ ] Validar typecheck
- [ ] Validar build
- [ ] Smoke test landing + admin
- [ ] Commit oficial: feat(core): introduce active-studio switch

Criterios de saida:

- Zero imports de src/sites/ruah/* fora de src/sites/ e do switch
- ARCHITECTURE.md, CHECKPOINT.md, ROADMAP.md e TECHDEBT.md atualizados
- Typecheck verde
- Build verde
- Landing publica funcionando
- Admin funcionando

---

## Sprint 1 — Dashboard administrativo

Objetivo: Tela inicial do admin com metricas operacionais essenciais.

Escopo:

- Cards de KPI (agendamentos do dia, semana, mes)
- Lista de proximos agendamentos
- Lista de leads recentes
- Atalhos para acoes frequentes

Dependencias:

- Sprint 0.5 concluida

---

## Sprint 2 — Appointments completos

Objetivo: Fechar o CRUD de agendamentos.

Escopo:

- Update (editar agendamento existente)
- Cancel (com motivo)
- Reschedule (drag-and-drop no calendar — opcional v2)
- Delete (soft delete)
- Historico de alteracoes (audit log simples)

Dependencias:

- Sprint 1 concluida (atalhos do dashboard chamam estas acoes)

---

## Sprint 3 — Modulo Financeiro

Objetivo: Controle financeiro basico por studio.

Escopo:

- Tabela finance_transactions
- CRUD de receitas e despesas
- Categorias de transacao
- Vinculo com appointments (receita automatica ao concluir)
- Relatorios simples (mes atual, mes anterior)
- Exportacao CSV

Dependencias:

- Sprint 2 concluida (vinculo appointment -> transaction)

---

## Sprint 4 — Settings do studio

Objetivo: Painel de configuracoes editaveis pelo admin do studio.

Escopo:

- Tabela studio_settings
- Edicao de horarios de funcionamento
- Edicao de informacoes de contato
- Edicao de redes sociais
- Upload de logo
- Preferencias de notificacao

Nota: Settings vivem no banco do studio, NAO sobrescrevem o
active-studio.ts (que continua sendo a fonte de identidade base
white-label). Settings sao overrides dinamicos.

Dependencias:

- Sprint 0.5 concluida

---

## Sprint 5 — Integracao WhatsApp

Objetivo: Receber e responder mensagens via WhatsApp Business API.

Escopo:

- Tabelas whatsapp_messages e whatsapp_settings
- Webhook de recebimento
- Envio de mensagens
- Templates aprovados
- Inbox no admin
- Vinculo mensagem -> cliente -> appointment

Dependencias:

- Sprint 3 concluida
- Definicao do provider (Meta direto, Z-API, Twilio, etc — ADR a criar)

---

## Sprint 6 — Chat IA real

Objetivo: Substituir o placeholder de chat IA por integracao real.

Escopo:

- Provider LLM definido (ADR)
- Contexto do studio injetado no prompt (servicos, equipe, horarios)
- Captura de leads pelo chat
- Agendamento via chat (handoff para fluxo de appointment)
- Persistencia em ai_messages

Dependencias:

- Sprint 5 concluida (chat pode disparar WhatsApp para confirmacao)

---

## Sprint 7 — Hardening + observabilidade

Objetivo: Preparar para escala e operacao real.

Escopo:

- Logging estruturado
- Error tracking (Sentry ou alternativa)
- Metricas basicas (Netlify Analytics + custom)
- Rate limiting nas server functions criticas
- Backup automatizado do Supabase
- Documentacao de runbook (incidentes comuns)

Dependencias:

- Sprint 6 concluida

---

## Sprint 8 — Segundo studio (validacao white-label)

Objetivo: Provar na pratica que o switch white-label funciona criando
o segundo studio do zero.

Escopo:

- Criar src/sites/<novo-studio>/
- Criar studio.ts do novo studio
- Trocar active-studio.ts
- Criar projeto Supabase novo
- Criar deploy Netlify novo
- Documentar processo em docs/PLAYBOOK-NOVO-STUDIO.md

Resultado esperado:

- Tempo total de provisionamento documentado
- Ajustes necessarios no nucleo identificados
- ADRs adicionais se necessario

Dependencias:

- Sprint 4 concluida (settings funcionando)

---

## Regras de execucao do roadmap

- Uma sprint por vez
- Nao iniciar a proxima sem fechar a anterior
- Sempre validar typecheck + build antes de fechar
- Sempre atualizar CHECKPOINT.md ao fechar uma sprint
- Sempre atualizar TECHDEBT.md quando novo debito for identificado
- Sempre criar ADR para decisoes que afetam o nucleo
- Mudancas no roadmap devem ser explicitas e datadas neste documento

---

## Historico de mudancas do roadmap

- 02/06/2026 (tarde) — Consolidacao do tech debt: criacao de
  docs/TECHDEBT.md com 8 debitos catalogados (5 migrados do legado +
  3 novos da Sprint 0.5). Arquivamento de checkpoints/Tech Debt.md e
  checkpoints/Roadmap1.md em src/_legacy/docs/checkpoints/.
  Movimentacao de src/admin/ para src/_legacy/admConfig/.
- 02/06/2026 — Criacao inicial. Sprint 0.5 introduzida entre 0 e 1
  para fundar o switch white-label antes de evoluir features.

---

Fim do documento.
