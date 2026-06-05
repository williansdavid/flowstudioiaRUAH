# Tech Debt — FlowStudio AI (Sistema Global)

Registro vivo de debitos tecnicos do nucleo do sistema.
Escopo: apenas codigo global (src/, exceto src/sites/).
Debitos especificos de cada studio ficam em src/sites/<studio>/docs/.

Ultima atualizacao: 2026-06-05

---

## Convencoes

- ID: DEBT-XXX sequencial e imutavel.
- Prioridade:
  - HIGH   — Bloqueia release ou compromete arquitetura
  - MEDIUM — Afeta DX/UX, nao bloqueia
  - LOW    — Cosmetico, warnings, dependencias
- Status: Aberto | Em andamento | Resolvido
- Toda entrada deve ter: Identificado em, Sintoma, Causa, Impacto,
  Solucao proposta, Esforco, Quando resolver, Bloqueia producao?

---

## Sumario

- DEBT-001 | MEDIUM | Validacao funcional do Calendar em producao | Aberto
- DEBT-002 | MEDIUM | DataTable com adocao parcial nas listagens  | Aberto
- DEBT-003 | LOW    | UI admin para troca de tema em runtime      | Aberto
- DEBT-004 | LOW    | .gitattributes ausente (warnings LF/CRLF)    | Aberto
- DEBT-005 | LOW    | docs/THEMING.md nao existe                   | Aberto
- DEBT-006 | HIGH   | Reconstrucao do modulo ADM do zero          | Aberto
- DEBT-007 | LOW    | Warning disableRemotePlayback no <video>     | Aberto
- DEBT-008 | LOW    | Deprecation do modulo punycode (Node.js)     | Aberto
- DEBT-009 | LOW    | Encoding do docs/TROCAR-STUDIO.md            | Aberto

---

## Status: Aberto

### [HIGH] DEBT-006 — Reconstrucao do modulo ADM do zero

- Identificado em: Sprint 0.5 (2026-06-02), reclassificado em 2026-06-05
- Sintoma: O admin legado foi demolido (commit f837eee) e arquivado em
  src/_legacy/admConfig/. Hoje o nucleo tem apenas __root.tsx, index.tsx e
  os clients Supabase. Nao existe login, guard, layout admin nem features
  (auth, clients, staff, services, appointments).
- Causa: Limpeza arquitetural da Sprint 0.5 isolou e removeu o admin legado
  sem substituto. Decisao deliberada: reconstruir sobre a nova fundacao
  white-label em vez de migrar codigo velho.
- Impacto atual: Sem ADM funcional nao ha gestao operacional pro studio.
  Bloqueia tudo que dependa de area autenticada.
- Solucao proposta: Reconstrucao incremental por sprint, comecando pela base:
  - Sprint 1: src/features/auth/ + src/server/auth/ + src/routes/login.tsx
    + guard SSR
  - Sprint 2: Dashboard + AdminLayout
  - Sprint 3+: Appointments, Calendar, Finance (recriados com UI Kit)
  - UI Kit padronizado (DataTable, Card, PageHeader) recriado junto
  - Integracao Supabase isolada por studio + roles via current_user_role()
- Esforco estimado: 4-5 sprints (1 a 4+)
- Quando resolver: Em andamento a partir da Sprint 1
- Bloqueia producao?: Sim (para clientes que dependerem do ADM)

---

### [MEDIUM] DEBT-001 — Validacao funcional do Calendar em producao pendente

- Identificado em: Checkpoint legado 2026-05-26
- Sintoma: O Calendar legado renderizava em producao mas nunca teve validacao
  manual ponto a ponto (DayView, WeekView, NowLine, slots, mobile 375px).
- Causa: Sessao de deploy encerrada apos confirmacao visual basica.
- Impacto atual: O Calendar sera recriado na Sprint 3 (DEBT-006). Este debito
  passa a valer para a nova implementacao, nao a legada.
- Solucao proposta: Executar checklist completo na recriacao: DayView,
  WeekView, slots, AppointmentCard, mobile 375px, console limpo
  (sem erros SSR/hydration).
- Esforco estimado: 1-2 horas
- Quando resolver: Junto com a recriacao do Calendar (Sprint 3)
- Bloqueia producao?: Nao

---

### [MEDIUM] DEBT-002 — DataTable e padronizacao das listagens

- Identificado em: Checkpoint legado 2026-05-26
- Sintoma: O DataTable legado tinha adocao parcial. Com a demolicao do admin,
  o UI Kit sera recriado do zero.
- Causa: Componente legado criado sem migracao das telas.
- Impacto atual: Oportunidade de nascer padronizado. Recriar o DataTable no
  UI Kit novo e usa-lo desde a primeira listagem (Appointments, Services).
- Solucao proposta: Criar DataTable no UI Kit junto da reconstrucao (DEBT-006)
  e adota-lo em TODAS as listagens desde o inicio — sem migracao tardia.
- Esforco estimado: 3-4 horas
- Quando resolver: Junto com DEBT-006 (a partir da Sprint 2)
- Bloqueia producao?: Nao

---

### [LOW] DEBT-003 — UI admin para troca de tema em runtime ausente

- Identificado em: Checkpoint legado 2026-05-26
- Sintoma: Presets de tema (classic, luxury, premium, soft) existem em CSS,
  mas so da pra trocar via codigo/config — nao ha UI para o admin.
- Causa: Infra de temas coberta, interface de selecao nao.
- Impacto atual: Cada troca de tema exige edicao de codigo + redeploy.
- Solucao proposta: Tela em /admin/settings/theme com preview e selecao de
  presets. Persistir escolha em studio_settings do Supabase.
- Esforco estimado: 4-6 horas
- Quando resolver: Sprint 5 (Settings)
- Bloqueia producao?: Nao

---

### [LOW] DEBT-004 — .gitattributes ausente (warnings LF/CRLF no Windows)

- Identificado em: Checkpoint legado 2026-05-26
- Sintoma: Todo git add no Windows mostra "LF will be replaced by CRLF".
- Causa: core.autocrlf no Windows + ausencia de .gitattributes.
- Impacto atual: Apenas ruido visual no terminal.
- Solucao proposta: Criar .gitattributes na raiz:

      * text=auto eol=lf
      *.ps1 text eol=crlf
      *.cmd text eol=crlf

- Esforco estimado: 30 minutos
- Quando resolver: Backlog (quando incomodar)
- Bloqueia producao?: Nao

---

### [LOW] DEBT-005 — docs/THEMING.md nao existe

- Identificado em: Checkpoint legado 2026-05-26, revalidado em Sprint 0.5
- Sintoma: Documentacao de tema referenciada no roadmap antigo, mas
  docs/THEMING.md nao existe.
- Causa: Nunca foi criado ou removido em limpeza.
- Impacto atual: Onboarding de devs/IAs mais lento — precisam inferir o
  sistema de tema do codigo.
- Solucao proposta: Criar docs/THEMING.md com: aplicar preset, criar preset,
  estrutura de tokens CSS, exemplo de customizacao por studio.
- Esforco estimado: 1-2 horas
- Quando resolver: Apos estabilizar tema (Sprint 5, junto a DEBT-003)
- Bloqueia producao?: Nao

---

### [LOW] DEBT-007 — Warning disableRemotePlayback no <video> da landing

- Identificado em: Sprint 0.5 (2026-06-02)
- Sintoma: Warning do React: atributo disableRemotePlayback no <video> da hero.
- Causa: Uso incorreto do atributo (camelCase errado ou prop nao suportada
  em SSR).
- Impacto atual: Apenas warning em console.
- Solucao proposta: Investigar a hero e corrigir conforme spec React 18+ SSR.
- Esforco estimado: 5-15 minutos
- Quando resolver: Proxima sprint de polish
- Bloqueia producao?: Nao

---

### [LOW] DEBT-008 — Deprecation do modulo punycode (Node.js)

- Identificado em: Sprint 0.5 (2026-06-02)
- Sintoma: (node:xxxx) [DEP0040] DeprecationWarning: The 'punycode' module is
  deprecated.
- Causa: Dependencia transitiva (provavelmente TanStack ou Vite).
- Impacto atual: Nenhum no runtime.
- Solucao proposta: Aguardar atualizacao das libs upstream. Reavaliar a cada
  major bump.
- Esforco estimado: Monitoramento passivo
- Quando resolver: Quando lib upstream resolver
- Bloqueia producao?: Nao

---

### [LOW] DEBT-009 — Encoding do docs/TROCAR-STUDIO.md

- Identificado em: Sprint 1 (2026-06-05)
- Sintoma: O arquivo docs/TROCAR-STUDIO.md apresentou caracteres acentuados
  inconsistentes — risco de salvar com encoding errado (nao UTF-8 sem BOM).
- Causa: Edicao em editor sem UTF-8 sem BOM garantido no ambiente Windows.
- Impacto atual: Cosmetico na doc; nenhum no runtime. Mas viola a regra de
  "UTF-8 sem BOM nos docs".
- Solucao proposta: Re-salvar o arquivo como UTF-8 sem BOM e validar
  acentuacao.
- Esforco estimado: 5 minutos
- Quando resolver: Backlog (proxima edicao da doc)
- Bloqueia producao?: Nao

---

## Status: Resolvido

(Nenhum debito resolvido nesta baseline. Itens resolvidos serao movidos pra
ca com data e sprint de resolucao.)

---

## Template para novos debitos

    ### [HIGH/MEDIUM/LOW] DEBT-XXX — Titulo curto

    - Identificado em: Sprint X.X (YYYY-MM-DD)
    - Sintoma: O que se observa
    - Causa: Por que acontece
    - Impacto atual: O que afeta hoje
    - Solucao proposta: Como resolver
    - Esforco estimado: Horas/sprints
    - Quando resolver: Prazo / sprint alvo
    - Bloqueia producao?: Sim / Nao

---

Fim do documento.
