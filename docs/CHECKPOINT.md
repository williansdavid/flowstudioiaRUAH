# 📍 FlowStudio AI — Checkpoint

> **Atualizado em:** 02/06/2026 (manhã)
> **Sprint atual:** Sprint 0 — Housekeeping
> **Próxima sessão:** Iniciar Sprint 1 (Dashboard)

---

## 🎯 Decisão arquitetural desta sessão

✅ **Admin é universal e compartilhado** — vive em `src/routes/admin/` + `src/features/` + `src/server/`. Cada studio consome o mesmo admin, alimentado por sua config + Supabase isolado.

✅ **Foco atual:** evoluir o **núcleo** do projeto. A pasta `src/sites/ruah/` está **congelada** nesta fase.

✅ **3 documentos oficiais criados:** `ARCHITECTURE.md`, `ROADMAP.md`, `CHECKPOINT.md`.

---

## 📊 Snapshot do projeto

### 🟢 Módulos completos

| Módulo | Feature | Server | UI | Rota |
|--------|---------|--------|----|----|
| **Auth** | ✅ | ✅ | ✅ login + 403 | ✅ |
| **Admin Layout** | — | — | ✅ sidebar + drawer | ✅ |
| **Clients** | ✅ hooks/queries/types | ✅ create/list/update | ✅ List/Form/Filters/Badge | ✅ |
| **Services** | ✅ | ✅ create/list/update/toggle | ✅ List/Form/Filters | ✅ |
| **Team/Staff** | ✅ | ✅ create/list/update/toggle | ✅ List/Form/Filters/TempPwd | ✅ |
| **Calendar** | ✅ types/slot-mapping | — (usa appointments) | ✅ Grid/Day/Week/Slot/etc | ✅ |

### 🟡 Módulos parciais

| Módulo | Estado | Falta |
|--------|--------|-------|
| **Appointments** | Server tem só create + list | update / cancel / reschedule / delete |
| **AI Chat** | Apenas index.ts + types.ts | Toda UI + lógica |
| **Leads** | Pasta existe (sem detalhes) | A investigar |

### 🔴 Módulos não iniciados

| Módulo | Rota | Feature | Server |
|--------|------|---------|--------|
| **Dashboard** | ✅ (placeholder) | ❌ | ❌ |
| **Finance** | ✅ (vazia) | ❌ | ❌ |
| **WhatsApp** | ✅ (vazia) | ❌ | ❌ |
| **Settings** | ✅ (vazia) | ❌ | ❌ |

---

## 🧹 Débito técnico ativo

### No núcleo (atacar no Sprint 0)

- [ ] `src/features/appointments/index.ts.bak`
- [ ] `src/server/appointments/_shared.ts.bak`
- [ ] `src/data/` pasta vazia (avaliar)
- [ ] `src/styles/_backup-20260526-122845/`
- [ ] `tailwind.config.ts.bak-20260526-141139` (raiz)

### Fora do núcleo (zona Ruah — adiar)

- Arquivos `.bak` em `src/sites/ruah/` (vários)
- `HeroSection - Copia.tsx`
- `birdid-sign-plugin.exe` (30 MB em styles!) ⚠️
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
| Sem update/cancel em appointments → calendário fica "read-only" | Sprint 2 |
| Dashboard placeholder transmite imagem de produto incompleto | Sprint 1 |
| Settings inexistente → admin precisa de deploy pra mudar horário | Sprint 4 |
| WhatsApp sem provider definido | Decidir antes do Sprint 5 |
| Finance inexistente → studio não vê faturamento | Sprint 3 |

---

## 🎯 Próximo passo (executar agora)

**SPRINT 0 — Housekeeping do núcleo**

Comandos PowerShell (executar na raiz do projeto):

```powershell
cd 'C:\FlowStudio AI'
```

```powershell
Remove-Item "src\features\appointments\index.ts.bak" -Force
Remove-Item "src\server\appointments\_shared.ts.bak" -Force
Remove-Item "src\styles\_backup-20260526-122845" -Recurse -Force
Remove-Item "tailwind.config.ts.bak-20260526-141139" -Force
```

```powershell
# Validar pasta data antes de remover
Get-ChildItem "src\data" -Recurse
```

```powershell
# Após remover, validar
npm run typecheck
```

```powershell
npm run build
```

---

## 📝 Histórico de checkpoints

| Data | Sprint | Evento |
|------|--------|--------|
| 02/06/2026 | Pré-Sprint 0 | Diagnóstico completo + 3 documentos criados |

---

**Fim do documento.**
