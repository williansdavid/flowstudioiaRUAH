# 📍 FlowStudio AI — Checkpoint

> **Atualizado em:** 02/06/2026 (manhã)
> **Sprint atual:** ✅ Sprint 0 concluído → 🚀 Iniciando Sprint 1 (Dashboard)

---

## 🎯 Decisão arquitetural desta sessão

✅ **Admin é universal e compartilhado** — vive em `src/routes/admin/` + `src/features/` + `src/server/`. Cada studio consome o mesmo admin, alimentado por sua config + Supabase isolado.

✅ **Foco atual:** evoluir o **núcleo** do projeto. A pasta `src/sites/ruah/` está **congelada** nesta fase.

✅ **3 documentos oficiais criados:** `ARCHITECTURE.md`, `ROADMAP.md`, `CHECKPOINT.md`.

---

## ✅ Sprint 0 — Housekeeping (CONCLUÍDO em 02/06/2026)

### Removidos com sucesso

- ✅ `src/features/appointments/index.ts.bak`
- ✅ `src/server/appointments/_shared.ts.bak`
- ✅ `src/styles/_backup-20260526-122845/`
- ✅ `tailwind.config.ts.bak-20260526-141139`
- ✅ `src/data/` (pasta órfã — confirmado zero imports)

### Validações pós-limpeza

- ✅ `npm run typecheck` → zero erros
- ✅ `npm run build` → client + SSR verdes
- ✅ Entry SSR Netlify gerado normalmente

### Observações registradas (atacar no Sprint 8)

- ⚠️ Chunk principal de 593 kB — otimizar com `manualChunks` + lazy loading
- ℹ️ Warnings de unused imports em `node_modules/@tanstack/start-*` → ignorar (não é nosso código)

---

## 📊 Snapshot do projeto

### 🟢 Módulos completos

| Módulo | Feature | Server | UI | Rota |
|--------|---------|--------|----|----|
| **Auth** | ✅ | ✅ | ✅ login + 403 | ✅ |
| **Admin Layout** | — | — | ✅ sidebar + drawer | ✅ |
| **Clients** | ✅ | ✅ create/list/update | ✅ Completo | ✅ |
| **Services** | ✅ | ✅ create/list/update/toggle | ✅ Completo | ✅ |
| **Team/Staff** | ✅ | ✅ create/list/update/toggle | ✅ Completo | ✅ |
| **Calendar** | ✅ | — (usa appointments) | ✅ Completo | ✅ |

### 🟡 Módulos parciais

| Módulo | Estado | Falta |
|--------|--------|-------|
| **Appointments** | Server só create + list | update / cancel / reschedule / delete |
| **AI Chat** | Apenas index.ts + types.ts | Toda UI + lógica |
| **Leads** | Pasta existe | A investigar |

### 🔴 Módulos não iniciados

| Módulo | Rota | Feature | Server |
|--------|------|---------|--------|
| **Dashboard** | ✅ (placeholder) | ❌ | ❌ |
| **Finance** | ✅ (vazia) | ❌ | ❌ |
| **WhatsApp** | ✅ (vazia) | ❌ | ❌ |
| **Settings** | ✅ (vazia) | ❌ | ❌ |

---

## 🧹 Débito técnico restante

### Núcleo

✅ **Limpo** após Sprint 0.

### Zona Ruah (`src/sites/ruah/` — adiar)

- Arquivos `.bak` em vários components
- `HeroSection - Copia.tsx`
- `birdid-sign-plugin.exe` (30 MB em `styles/`!) ⚠️
- `base.csse`, `base.css.err`
- Registrado em `src/sites/ruah/docs/techdeb.md`

---

## ✅ Pontos fortes preservar

1. Sistema de **permissions granular** (`userHasPermission`)
2. **AdminLayout** filtra navegação por permissão automaticamente
3. **Feature-based** consistente (hooks, queries, types, components)
4. **Server functions** isoladas por domínio
5. **SSR guards** via `beforeLoad` em todas rotas admin
6. **Studio config** centralizada e bem separada do núcleo

---

## 🚨 Riscos ativos

| Risco | Mitigação |
|-------|-----------|
| Sem update/cancel em appointments → calendário "read-only" | Sprint 2 |
| Dashboard placeholder transmite imagem de produto incompleto | **Sprint 1 (próximo)** |
| Settings inexistente → admin precisa de deploy pra mudar horário | Sprint 4 |
| WhatsApp sem provider definido | Decidir antes do Sprint 5 |
| Finance inexistente → studio não vê faturamento | Sprint 3 |

---

## 🎯 Próximo passo — SPRINT 1: Dashboard funcional

**Objetivo:** Substituir placeholder de `/admin` por dashboard real com KPIs do Supabase.

**Entregas:**
- `src/features/dashboard/` (types, queries, hooks, components)
- `src/server/dashboard/get-summary.ts`
- Atualização de `src/routes/admin/index.tsx` com loader SSR + UI real

**KPIs alvo:**
- Agendamentos do dia
- Receita do mês
- Novos clientes (mês)
- Taxa de ocupação

---

## 📝 Histórico de checkpoints

| Data | Sprint | Evento |
|------|--------|--------|
| 02/06/2026 (manhã) | Pré-Sprint 0 | Diagnóstico completo + 3 documentos oficiais criados |
| 02/06/2026 (manhã) | ✅ Sprint 0 | Housekeeping concluído + commit + checkpoint atualizado |

---

**Fim do documento.**
