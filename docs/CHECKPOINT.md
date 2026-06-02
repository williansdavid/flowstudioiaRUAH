# FlowStudio AI — Checkpoint do Projeto

Ultima atualizacao: 02/06/2026 (tarde)
Estado: Sprint 0.5 em andamento — Fundacao White-Label

---

## Contexto rapido

O FlowStudio AI e uma plataforma white-label para studios de beleza.
Cada studio recebe um deploy isolado (Netlify proprio + Supabase proprio).
Estamos consolidando a fronteira entre nucleo reutilizavel e configuracao
especifica do studio antes de evoluir o admin.

---

## O que ja esta pronto

### Nucleo

- TanStack React Start configurado com SSR
- TanStack Router com guards de sessao
- Supabase Auth funcionando (login/logout/sessao SSR)
- React Query com hidratacao SSR
- Tailwind configurado com tokens base
- Estrutura feature-based em src/features/
- Estrutura server-functions em src/server/

### Modulos universais (admin)

- Auth (login, guard, roles)
- Clients (CRUD completo)
- Services (CRUD completo)
- Team / Staff (CRUD completo)
- Appointments (create + list + calendar — falta update/cancel/reschedule/delete)
- Calendar (visualizacao semanal e diaria)

### Studio Ruah

- Landing publica funcional em /
- Identidade visual implementada
- Hero, servicos, equipe, contato
- Captura de leads
- Chat IA inicial (placeholder)

### Infra

- Deploy Netlify funcionando
- Supabase Ruah em producao
- RLS habilitada nas tabelas principais

---

## Sprint 0 — Housekeeping (CONCLUIDA)

- Remocao de arquivos .bak no nucleo
- Remocao de pastas orfas
- Remocao de backups antigos de styles
- Build + typecheck verdes
- Commit oficial aplicado

---

## Sprint 0.5 — Fundacao White-Label (EM ANDAMENTO)

Objetivo: Estabelecer o switch unico de studio ativo (active-studio.ts)
e desacoplar o nucleo de src/sites/ruah/.

### Ja concluido

- Criacao da pasta docs/adr/
- Criacao de docs/adr/README.md (indice de ADRs)
- Criacao de docs/adr/ADR-001-white-label-switch.md
- Criacao da pasta src/sites/_legacy/ (placeholder)
- Validacao de encoding UTF-8 sem BOM nos novos docs
- Validacao de typecheck e build apos criacao dos arquivos de docs
- Consolidacao do tech debt legado em docs/TECHDEBT.md (8 debitos catalogados)
- Arquivamento de checkpoints/ (legado) em src/_legacy/docs/checkpoints/
- Movimentacao do src/admin/ antigo para src/_legacy/admConfig/

### Pendente

- Criar src/sites/ruah/studio.ts (export consolidado)
- Criar src/config/active-studio.ts (switch)
- Mapear consumidores atuais que importam de src/sites/ruah/config/
- Migrar imports do nucleo para @/config/active-studio
- Validar typecheck apos migracao
- Validar build apos migracao
- Smoke test landing + admin
- Atualizar ARCHITECTURE.md com secao White-Label Switch (feito nesta entrega)
- Atualizar ROADMAP.md com Sprint 0.5 (feito nesta entrega)
- Commit oficial: feat(core): introduce active-studio switch (ADR-001)

---

## Proximo passo imediato

Investigar a estrutura atual de src/sites/ruah/config/ para mapear:

- Quais arquivos existem
- O que cada um exporta
- Quem no nucleo consome esses exports

Sem essa investigacao nao e possivel consolidar src/sites/ruah/studio.ts
corretamente.

Apos a investigacao:

1. Criar src/sites/ruah/studio.ts
2. Criar src/config/active-studio.ts
3. Migrar imports
4. Validar e commitar

---

## Arquivos criticos do projeto (referencia rapida)

- src/routes/                       rotas universais (nucleo)
- src/features/                     modulos de negocio (nucleo)
- src/server/                       server functions (nucleo)
- src/components/                   UI compartilhada (nucleo)
- src/lib/                          utilitarios (nucleo)
- src/config/active-studio.ts       switch white-label (a criar)
- src/sites/ruah/                   studio Ruah (isolado)
- src/sites/_legacy/                sites arquivados
- src/_legacy/admConfig/            admin antigo (referencia historica)
- src/_legacy/docs/checkpoints/     historico de checkpoints e roadmaps antigos
- docs/ARCHITECTURE.md              arquitetura oficial
- docs/ROADMAP.md                   sprints planejados
- docs/CHECKPOINT.md                este documento
- docs/TECHDEBT.md                  debitos tecnicos do nucleo
- docs/adr/                         decisoes arquiteturais

---

## Zonas congeladas durante Sprint 0.5

- src/sites/ruah/ nao recebe alteracoes de feature
- Apenas criacao de studio.ts e permitida
- src/_legacy/ nao recebe edicoes (somente leitura para referencia)

---

## Regras permanentes em vigor

- Nada de plano antes de validar a solucao real
- Sempre investigar antes de implementar
- Sempre fornecer comandos PowerShell prontos para Windows
- Sempre atualizar memoria persistente com decisoes relevantes
- Sempre validar typecheck + build antes de fechar etapa
- Sempre manter os 4 documentos principais sincronizados
  (ARCHITECTURE, ROADMAP, CHECKPOINT, TECHDEBT)
- Novos debitos tecnicos devem ser registrados em docs/TECHDEBT.md
  no momento em que sao identificados (nao acumular na cabeca)
- Tech debt e roadmap especificos de cada studio vivem em
  src/sites/<studio>/docs/ (nao misturar com docs globais)

---

Fim do documento.
