================================================================
ARQUIVO: docs/ai/04_CURRENT_TASK_EXEMPLO_F4_7.txt
================================================================

FLOWSTUDIO AI - EXEMPLO DE MISSÃO ATUAL

Use este arquivo como exemplo.
Não é a missão ativa oficial, a menos que Willians copie este conteúdo para 04_CURRENT_TASK.txt.

----------------------------------------------------------------
1. MISSÃO ATIVA
----------------------------------------------------------------

[MISSÃO] Confirmar e finalizar a integração do SlotsStep.tsx no AppointmentFormModal.

----------------------------------------------------------------
2. ROADMAP VINCULADO
----------------------------------------------------------------

Fase: 4
Item: 4.7 - UI agendamento - Janela 2

----------------------------------------------------------------
3. OBJETIVO
----------------------------------------------------------------

Finalizar a Janela 2 da UI de agendamento.

Após selecionar cliente, serviço e profissional, o usuário deve conseguir visualizar slots disponíveis e selecionar um horário válido para criar o appointment.

----------------------------------------------------------------
4. ESTADO ATUAL CONHECIDO
----------------------------------------------------------------

- SlotsStep.tsx existe.
- getAvailableSlots.ts existe.
- useAvailableSlots existe.
- Fase 4.5 está concluída.
- Integração no AppointmentFormModal ainda está pendente de confirmação.

----------------------------------------------------------------
5. FORA DE ESCOPO
----------------------------------------------------------------

- Não implementar override admin.
- Não mexer em RLS.
- Não alterar migrations.
- Não criar tabela nova.
- Não alterar o algoritmo de getAvailableSlots sem autorização.
- Não implementar portal do cliente.
- Não implementar staff_time_off UI.
- Não fazer refatoração ampla do modal.

----------------------------------------------------------------
6. ARQUIVOS PROVAVELMENTE ENVOLVIDOS
----------------------------------------------------------------

- AppointmentFormModal.tsx
- SlotsStep.tsx
- useAvailableSlots.ts
- tipos relacionados a appointments

O caminho real dos arquivos deve ser investigado antes de qualquer proposta.

----------------------------------------------------------------
7. ARQUIVOS PROIBIDOS SEM OK
----------------------------------------------------------------

- migrations SQL
- RLS
- env
- config de studio
- getAvailableSlots.ts, salvo se a investigação provar necessidade e Willians aprovar

----------------------------------------------------------------
8. CRITÉRIOS DE ACEITE
----------------------------------------------------------------

- Modal possui fluxo de duas janelas.
- Janela 1 coleta cliente, serviço e profissional.
- Janela 2 exibe slots disponíveis.
- Slot respeita duration_minutes.
- Loading state existe.
- Error state existe.
- Empty state existe.
- Slot selecionado alimenta corretamente o payload de criação do appointment.
- TypeScript não quebra.
- Código é SSR-safe.
- Nenhuma regra central de disponibilidade é duplicada indevidamente no client.
- Session log é atualizado.

----------------------------------------------------------------
9. PRÓXIMO PASSO OBRIGATÓRIO
----------------------------------------------------------------

Investigar arquivos reais.

O agente deve ler:
- AppointmentFormModal.tsx
- SlotsStep.tsx
- useAvailableSlots.ts
- funções server de appointment, se necessário

Depois deve responder:
- o que encontrou
- quais arquivos precisam mudar
- abordagem recomendada
- riscos

Depois deve aguardar OK explícito do Willians.

----------------------------------------------------------------
10. ÚLTIMA ATUALIZAÇÃO
----------------------------------------------------------------

Data: 12/06/2026
Responsável: Willians



================================================================
ARQUIVO: docs/ai/06_CHANGELOG.txt
================================================================

FLOWSTUDIO AI - CHANGELOG TÉCNICO

Objetivo:
Registrar alterações reais feitas no código, banco ou configuração.

Regra:
Atualizar somente quando houver mudança concreta.

Formato:

----------------------------------------------------------------
DATA: AAAA-MM-DD
MISSÃO:
ROADMAP:
----------------------------------------------------------------

Arquivos alterados:
- caminho/do/arquivo.tsx
  - descrição da alteração

Banco:
- nenhuma alteração
ou
- migration aplicada
- RLS alterada
- tabela criada

Impacto:
- impacto funcional
- impacto técnico

Validação:
- build rodou?
- TypeScript validado?
- smoketest feito?
- pendente de validação manual?

Observações:
- observação relevante

----------------------------------------------------------------
LOG ATUAL
----------------------------------------------------------------

Nenhuma alteração registrada ainda neste arquivo.


================================================================
ARQUIVO: docs/ai/07_TECHDEBT.txt
================================================================

FLOWSTUDIO AI - TECHDEBTS

Objetivo:
Registrar pendências técnicas sem tirar o foco da missão ativa.

Regra:
Se algo importante aparecer, mas estiver fora da missão, registrar aqui.
Não executar sem aprovação do Willians.

----------------------------------------------------------------
TECHDEBTS OFICIAIS DO ROADMAP
----------------------------------------------------------------

[x] TD-01 Disponibilidade
Status:
Promovida e especificada na Fase 4.

[ ] TD-02 Criar user_roles dedicada
Contexto:
Hoje role vive em profiles.

[ ] TD-03 Backfill de full_name em staff
Contexto:
Hoje pode estar null.

[ ] TD-04 Anti-overbooking no insert
Contexto:
Mapeado no item 4.9.

[ ] TD-05 Trigger set_updated_at em staff_time_off
Contexto:
Coluna updated_at existe, mas não atualiza sozinha.

[ ] TD-06 Seletor de status na agenda
Contexto:
getDayAppointments hoje exclui cancelled fixo.
Falta UI para ver cancelled/no_show quando necessário.

----------------------------------------------------------------
NOVOS TECHDEBTS ENCONTRADOS
----------------------------------------------------------------

Nenhum novo techdeb registrado ainda.


================================================================
ARQUIVO: docs/ai/MANUAL_DE_USO.txt
================================================================

MANUAL DE USO - MEMÓRIA OPERACIONAL DO AGENTE

Objetivo:
Ensinar como usar os arquivos docs/ai para reduzir perda de foco, retrabalho e esquecimento do agente.
