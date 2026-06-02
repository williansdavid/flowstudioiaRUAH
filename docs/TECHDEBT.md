# 🧱 Tech Debt — FlowStudio AI (Sistema Global)

> Registro vivo de débitos técnicos do **núcleo do sistema**.
> **Escopo:** apenas código global (`src/`, exceto `src/sites/`).
> Débitos específicos de cada studio ficam em `src/sites/<studio>/docs/`.
>
> Última atualização: **2026-06-02** (Sprint 0.5)

---

## 📐 Convenções

- **ID:** `DEBT-XXX` sequencial e imutável.
- **Prioridade:**
  - 🔴 **HIGH** — Bloqueia release ou compromete arquitetura
  - 🟡 **MEDIUM** — Afeta DX/UX, não bloqueia
  - 🟢 **LOW** — Cosmético, warnings, dependências
- **Status:** `Aberto` | `Em andamento` | `Resolvido`
- Toda entrada deve ter: **Identificado em**, **Sintoma**, **Causa**, **Impacto**, **Solução proposta**, **Esforço**, **Quando resolver**, **Bloqueia produção?**

---

## 📊 Sumário

| ID | Prioridade | Título | Status |
|----|-----------|--------|--------|
| DEBT-001 | 🟡 MEDIUM | Validação funcional do Calendar em produção | Aberto |
| DEBT-002 | 🟡 MEDIUM | DataTable com adoção parcial nas listagens | Aberto |
| DEBT-003 | 🟢 LOW | UI admin para troca de tema em runtime | Aberto |
| DEBT-004 | 🟢 LOW | `.gitattributes` ausente (warnings LF/CRLF) | Aberto |
| DEBT-005 | 🟢 LOW | `docs/THEMING.md` não existe | Aberto |
| DEBT-006 | 🔴 HIGH | Reescrita completa do módulo ADM | Aberto |
| DEBT-007 | 🟢 LOW | Warning `disableRemotePlayback` no `<video>` | Aberto |
| DEBT-008 | 🟢 LOW | Deprecation do módulo `punycode` (Node.js) | Aberto |

---

## 🔓 Status: Aberto

### 🔴 [HIGH] DEBT-006 — Reescrita completa do módulo ADM

- **Identificado em**: Sprint 0.5 (2026-06-02)
- **Sintoma**: A pasta `src/config/` foi movida para `src/_legacy/admConfig/` como fallback. O painel administrativo precisa ser reescrito do zero seguindo a nova arquitetura por studio.
- **Causa**: Limpeza arquitetural da Sprint 0.5 isolou a configuração legada sem substituto definitivo ainda.
- **Impacto atual**: Bloqueia evolução dos módulos administrativos (clients, staff, services, appointments). Sem ADM funcional, não há gestão operacional pro studio.
- **Solução proposta**: Definir nova estrutura em `src/features/admin/` com:
  - SSR via TanStack React Start
  - Guards de rota e roles (admin/staff/client)
  - Integração Supabase isolada por studio
  - UI Kit padronizado (DataTable, Card, PageHeader)
- **Esforço estimado**: 3-5 sprints
- **Quando resolver**: Sprint 1.x (após fundação de auth SSR estar validada)
- **Bloqueia produção?**: Sim (para clientes que dependerem do ADM)

---

### 🟡 [MEDIUM] DEBT-001 — Validação funcional do Calendar em produção pendente

- **Identificado em**: Checkpoint legado 2026-05-26 (origem: ex-DEBT-001)
- **Sintoma**: Módulo Calendar (`src/features/calendar`, rota `/admin/calendar`) foi deployado e renderiza, mas não houve validação manual ponto a ponto em produção (DayView, WeekView, NowLine, interação com slots, mobile 375px).
- **Causa**: Sessão de deploy encerrada após confirmação visual básica.
- **Impacto atual**: Risco de bugs visuais/comportamentais em produção sem percebermos antes do cliente piloto reportar.
- **Solução proposta**: Executar checklist completo: DayView, WeekView, slots, AppointmentCard, mobile 375px, console limpo (sem erros SSR/hydration).
- **Esforço estimado**: 1-2 horas
- **Quando resolver**: Próxima sprint de QA
- **Bloqueia produção?**: Não (Calendar já está no ar)

---

### 🟡 [MEDIUM] DEBT-002 — DataTable criado mas adoção parcial nas listagens

- **Identificado em**: Checkpoint legado 2026-05-26 (origem: ex-DEBT-002)
- **Sintoma**: Componente `DataTable` existe no UI Kit, mas listagens existentes (Appointments, Services) ainda não foram migradas.
- **Causa**: Componente criado no BLOCO 4 sem reservar tempo para migração das telas existentes.
- **Impacto atual**: Inconsistência visual entre listagens + duplicação de código de tabela.
- **Solução proposta**: Migrar Appointments e Services para `DataTable` na reescrita do ADM (DEBT-006), garantindo padronização desde o início.
- **Esforço estimado**: 3-4 horas
- **Quando resolver**: Junto com DEBT-006
- **Bloqueia produção?**: Não

---

### 🟢 [LOW] DEBT-003 — UI admin para troca de tema em runtime ausente

- **Identificado em**: Checkpoint legado 2026-05-26 (origem: ex-DEBT-003)
- **Sintoma**: Presets de tema (classic, luxury, premium, soft) existem em CSS, mas só é possível trocar via código/config — não há UI para o admin trocar visualmente.
- **Causa**: BLOCO 4 cobriu apenas infraestrutura de temas, não a interface de seleção.
- **Impacto atual**: Cada troca de tema exige edição de código + redeploy.
- **Solução proposta**: Tela em `/admin/settings/theme` com preview e seleção dos presets. Persistir escolha em tabela de settings do Supabase do studio.
- **Esforço estimado**: 4-6 horas
- **Quando resolver**: Pós-MVP (parte da reescrita do ADM — DEBT-006)
- **Bloqueia produção?**: Não

---

### 🟢 [LOW] DEBT-004 — `.gitattributes` ausente (warnings LF/CRLF no Windows)

- **Identificado em**: Checkpoint legado 2026-05-26 (origem: ex-DEBT-004)
- **Sintoma**: Todo `git add` no Windows mostra `LF will be replaced by CRLF the next time Git touches it`.
- **Causa**: `core.autocrlf` no Windows + ausência de `.gitattributes` no repo.
- **Impacto atual**: Apenas ruído visual no terminal. Não afeta funcionamento.
- **Solução proposta**: Criar `.gitattributes` na raiz com:
text=auto eol=lf *.ps1 text eol=crlf *.cmd text eol=crlf
- **Esforço estimado**: 30 minutos
- **Quando resolver**: Backlog (quando incomodar)
- **Bloqueia produção?**: Não

---

### 🟢 [LOW] DEBT-005 — `docs/THEMING.md` não existe

- **Identificado em**: Checkpoint legado 2026-05-26 (origem: ex-DEBT-005, revalidado em Sprint 0.5)
- **Sintoma**: Documentação de tema referenciada no roadmap antigo, mas o arquivo `docs/THEMING.md` **não existe**.
- **Causa**: Arquivo nunca foi criado, ou foi removido em limpezas anteriores.
- **Impacto atual**: Onboarding de novos devs/IAs no projeto fica mais lento — precisam inferir o sistema de tema do código.
- **Solução proposta**: Criar `docs/THEMING.md` com seções:
- Como aplicar um preset
- Como criar um novo preset
- Estrutura de tokens CSS
- Exemplo de customização para novo studio
- **Esforço estimado**: 1-2 horas
- **Quando resolver**: Quando estabilizar o sistema de tema (após DEBT-003)
- **Bloqueia produção?**: Não

---

### 🟢 [LOW] DEBT-007 — Warning `disableRemotePlayback` no `<video>` da landing

- **Identificado em**: Sprint 0.5 (2026-06-02)
- **Sintoma**: Warning do React em console: atributo `disableRemotePlayback` no elemento `<video>` da hero section.
- **Causa**: Uso incorreto do atributo (camelCase errado ou prop não suportada em SSR).
- **Impacto atual**: Apenas warning em console, sem impacto funcional.
- **Solução proposta**: Investigar componente da hero e corrigir o atributo conforme spec do React 18+ SSR.
- **Esforço estimado**: 5-15 minutos
- **Quando resolver**: Próxima sprint de polish
- **Bloqueia produção?**: Não

---

### 🟢 [LOW] DEBT-008 — Deprecation do módulo `punycode` (Node.js)

- **Identificado em**: Sprint 0.5 (2026-06-02)
- **Sintoma**: Warning ao iniciar o dev server: `(node:xxxx) [DEP0040] DeprecationWarning: The 'punycode' module is deprecated`.
- **Causa**: Dependência transitiva (provavelmente do TanStack ou Vite).
- **Impacto atual**: Nenhum no runtime. Apenas ruído no terminal.
- **Solução proposta**: Aguardar atualização das libs upstream. Reavaliar a cada major bump do TanStack/Vite.
- **Esforço estimado**: Monitoramento passivo
- **Quando resolver**: Quando lib upstream resolver
- **Bloqueia produção?**: Não

---

## ✅ Status: Resolvido

_(Nenhum débito resolvido nesta baseline consolidada. Itens resolvidos serão movidos pra cá com data e sprint de resolução.)_

---

## 📝 Template para novos débitos

```markdown
### 🔴/🟡/🟢 [HIGH/MEDIUM/LOW] DEBT-XXX — Título curto

- **Identificado em**: Sprint X.X (YYYY-MM-DD)
- **Sintoma**: O que se observa
- **Causa**: Por que acontece
- **Impacto atual**: O que afeta hoje
- **Solução proposta**: Como resolver
- **Esforço estimado**: Horas/sprints
- **Quando resolver**: Prazo / sprint alvo
- **Bloqueia produção?**: Sim / Não

