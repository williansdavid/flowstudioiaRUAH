# 🧾 Tech Debt — FlowStudio AI

> **Última atualização:** 27/05/2026
> **Contexto:** Débitos identificados durante a Fase 6 (Landing Page RUAH).
> **Política:** Itens fora do escopo da landing são suspensos até retomada explícita do sistema.

---

## 📋 Política de Escopo

Durante a entrega da **Landing Page RUAH**, qualquer item que **não bloqueie** a renderização visual/funcional da landing é registrado aqui como **débito técnico** e adiado.

**Regra prática:**
> Se o problema não impede a landing de funcionar bonita e estável → vira débito.

**Critérios para promoção de débito → tarefa ativa:**
- Bloqueia uma nova feature crítica
- Causa bug em produção
- Impede onboarding de novo studio
- Acumula risco arquitetural significativo

---

## 🗂️ Backlog de Débitos Técnicos

### DEBT-001 — Remover types/sections.ts duplicado
- **Categoria:** Limpeza
- **Prioridade:** Média
- **Origem:** Fase 6.0 — Auditoria
- **Problema:** Existe `src/types/sections.ts` (legacy) duplicado com `src/sites/ruah/types/sections.ts`. Mesmo conteúdo, mantido em dois lugares.
- **Risco:** Divergência futura entre os dois arquivos; confusão sobre qual é a fonte da verdade.
- **Ação:**
  1. Confirmar que ninguém importa `@/types/sections`
  2. Deletar `src/types/sections.ts`
  3. Validar build TypeScript
- **Esforço estimado:** 15 min

---

### DEBT-002 — Mover components/landing → sites/ruah/components
- **Categoria:** Refactor estrutural
- **Prioridade:** Média
- **Origem:** Fase 6.0
- **Problema:** Componentes da landing RUAH estão em `src/components/landing/` (estrutura genérica antiga) em vez de `src/sites/ruah/components/` (padrão site auto-contido).
- **Arquivos afetados:**
  - `src/components/landing/SectionsRenderer.tsx`
  - `src/components/landing/WhatsAppFloatingButton.tsx`
  - `src/components/landing/hero/*` (HeroFullscreen, HeroSplit, HeroMinimal, _shared/*)
  - `src/components/landing/services/*` (ServicesGrid, _shared/ServiceCard)
- **Risco:** Quebra a regra arquitetural de "site auto-contido"; dificulta replicação para novos studios.
- **Ação:**
  1. Mover via `Move-Item` preservando estrutura
  2. Atualizar imports automaticamente (script PowerShell)
  3. Validar build + SSR
- **Esforço estimado:** 1-2h

---

### DEBT-003 — Remover HeroSection.legacy.tsx
- **Categoria:** Limpeza
- **Prioridade:** Baixa
- **Origem:** Fase 6.0
- **Problema:** `src/components/landing/HeroSection.legacy.tsx` já está marcado como legacy no nome, mas continua no projeto.
- **Risco:** Baixo (não está sendo importado), mas polui o repo.
- **Ação:** Confirmar não-uso e deletar.
- **Esforço estimado:** 5 min

---

### DEBT-004 — Eliminar src/config/studio.config.ts
- **Categoria:** Refactor
- **Prioridade:** Alta (pós-landing)
- **Origem:** Fase 6.0
- **Problema:** A rota `/` ainda importa `@/config/studio.config`, conflitando com o padrão novo `@/sites/ruah/config/*`. Existem duas fontes de configuração do studio.
- **Risco:** Dados desincronizados; quem edita um pode esquecer do outro.
- **Ação:**
  1. Mapear todos os consumidores de `@/config/studio*`
  2. Migrar cada consumidor para `@/sites/ruah`
  3. Deletar `src/config/studio.config.ts`
- **Esforço estimado:** 2-3h

---

### DEBT-005 — Avaliar destino de lib/sections/fetchServices.ts
- **Categoria:** Decisão arquitetural
- **Prioridade:** Média
- **Origem:** Fase 6.0
- **Problema:** `src/lib/sections/fetchServices.ts` é genérico ou específico do RUAH? Hoje está em local genérico, mas só serve à landing.
- **Decisão pendente:**
  - **Opção A:** Manter genérico → renomear para `src/lib/landing/fetchPublicServices.ts`
  - **Opção B:** Mover para `src/sites/ruah/lib/queries/fetchServices.ts` (site auto-contido)
- **Recomendação técnica:** Opção B (consistência com padrão site auto-contido).
- **Esforço estimado:** 30 min

---

### DEBT-006 — Reescrever rota / 100% via @/sites/ruah
- **Categoria:** Refactor
- **Prioridade:** Alta (pós-landing)
- **Origem:** Fase 6.0
- **Problema:** A rota `src/routes/index.tsx` mistura imports do legacy (`@/components/landing`, `@/config/studio.config`, `@/lib/sections`) com a estrutura nova.
- **Risco:** Dificulta manter padrão de site auto-contido; cria duas formas de fazer a mesma coisa.
- **Ação:** Após DEBT-002 e DEBT-004, reescrever rota importando apenas de `@/sites/ruah`.
- **Esforço estimado:** 1h

---

### DEBT-007 — Auditoria global de imports legacy
- **Categoria:** Auditoria
- **Prioridade:** Média
- **Origem:** Fase 6.0
- **Problema:** Não há mapa completo de quem importa:
  - `@/components/landing/*`
  - `@/types/sections`
  - `@/config/studio.config`
  - `@/lib/sections/*`
- **Ação:** Rodar script de varredura e gerar relatório `docs/IMPORTS_AUDIT.md`.
- **Esforço estimado:** 30 min

---

### DEBT-008 — Padronizar barrel exports
- **Categoria:** Padronização
- **Prioridade:** Baixa
- **Origem:** Fase 6.0
- **Problema:** Mistura de `export *`, `export type *` e exports nomeados em diferentes `index.ts` do projeto. Falta convenção única.
- **Ação:**
  1. Definir convenção oficial (preferência: exports nomeados explícitos)
  2. Aplicar em todos os barrels (`sites/ruah/index.ts`, `content/index.ts`, etc.)
- **Esforço estimado:** 1h

---

### DEBT-009 — Documentar Pattern "Site Auto-Contido"
- **Categoria:** Documentação
- **Prioridade:** Baixa
- **Origem:** Fase 6.0
- **Problema:** O padrão `src/sites/<studio>/` está sendo aplicado de forma orgânica, sem documento de referência. Próximos studios não terão blueprint claro.
- **Ação:** Criar `docs/SITE_PATTERN.md` documentando:
  - Estrutura de pastas obrigatória
  - O que vai em `config/`, `content/`, `lib/`, `components/`, `pages/`, `types/`
  - Como o `index.ts` (barrel) deve expor o site
  - Regras de SSR
  - Como integrar com Supabase (futuro)
- **Esforço estimado:** 2h

---

## 🆕 Como adicionar novos débitos

Use o template:

