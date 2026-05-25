# 🔧 Tech Debt — FlowStudio AI

> Registro de débitos técnicos conhecidos e priorizados.  
> Resolver em sprints dedicadas, sem comprometer o MVP.

---

## Legenda de Prioridade

- 🔴 **HIGH** — Bloqueia funcionalidades ou produção
- 🟡 **MEDIUM** — Afeta DX ou pode causar problemas futuros
- 🟢 **LOW** — Cosmético ou melhoria opcional

---

## Status: Aberto

### 🟢 [LOW] DEBT-001 — Upgrade Vite 5 → 7 + TanStack Start latest

- **Identificado em**: CHECKPOINT 01 (21/05/2026)
- **Sintoma**: Warning `vite invalid: ">=7.0.0"` ao rodar `npm ls`
- **Causa**: TanStack Start 1.166+ pede Vite 7+ como peer dep
- **Impacto atual**: ZERO em runtime (peer dep optional)
- **Solução proposta**:
  - Migrar config Vite 5 → 7 (breaking changes em config)
  - Atualizar TanStack Start para latest
  - Validar plugins compatíveis (`@vitejs/plugin-react`, `vite-tsconfig-paths`)
  - Testar SSR e build completo
- **Esforço estimado**: 4-8h
- **Quando resolver**: Sprint de upgrades (~6 meses)
- **Bloqueia produção?**: ❌ Não

---

### 🟢 [LOW] DEBT-002 — Vulnerabilidades npm (2 low, 2 moderate)

- **Identificado em**: CHECKPOINT 01 (21/05/2026)
- **Sintoma**: `npm audit` reporta 4 vulnerabilidades
- **Causa**: Dependências transitivas
- **Impacto atual**: Baixo (em devDependencies)
- **Solução proposta**:
  - Rodar `npm audit` para detalhar quais pacotes
  - Avaliar caso a caso (não rodar `--force`, quebra a stack)
  - Atualizar em conjunto com DEBT-001
- **Esforço estimado**: 1-2h
- **Quando resolver**: Junto com DEBT-001
- **Bloqueia produção?**: ❌ Não

---

## Status: Resolvido

> Nenhum até o momento.

---

## Como adicionar novos débitos

Use o template:

```markdown
### 🔴/🟡/🟢 [HIGH/MEDIUM/LOW] DEBT-XXX — Título curto

- **Identificado em**: CHECKPOINT XX (DATA)
- **Sintoma**: O que se observa
- **Causa**: Por que acontece
- **Impacto atual**: O que afeta hoje
- **Solução proposta**: Como resolver
- **Esforço estimado**: Horas
- **Quando resolver**: Prazo / sprint
- **Bloqueia produção?**: Sim / Não
```
### 🟡 [MEDIUM] DEBT-003 — Padronizar nomenclatura feature staff
- Sintoma: feature chamada `team` mas types/server/banco usam `staff`
- Solucao: renomear `features/team` → `features/staff` + types/permissao
- Esforco: 30-45 min
- Quando: antes de adicionar 2+ devs ou em sprint de polimento

### 🟢 [LOW] DEBT-004 — Limpeza de arquivos legacy
- `features/staff` vazia (deletar)
- `routes/admin/route.tsx.backup` (deletar)
- Esforco: 5 min
- Quando: qualquer momento
### 🟡 [MEDIUM] DEBT-003 — Padronizar nomenclatura feature `team` vs `staff`
- **Sintoma:** feature em `src/features/team/` mas types/server/banco usam `staff`.
- **Causa:** divergencia historica entre UI ("Equipe") e camada tecnica.
- **Solucao:** renomear `features/team` -> `features/staff`, types `TeamMember` -> `StaffMember`, permissao `team.manage` -> `staff.manage`. UI continua "Equipe" (label PT-BR).
- **Esforco:** 30-45 min (refactor mecanico).
- **Quando:** antes de adicionar 2+ devs OU em sprint de polimento. Nao bloqueia features.
- **Risco se postergar:** baixo (cosmetico).

### 🟢 [LOW] DEBT-005 — Bundle client acima de 500kB
- **Sintoma:** `index-*.js` ~566kB (175kB gzip) no build de producao.
- **Causa:** sem code-splitting agressivo, lazy loading de rotas pesadas pendente.
- **Solucao:** configurar `build.rollupOptions.output.manualChunks` no Vite + lazy de views futuras (calendario, charts).
- **Esforco:** 1h.
- **Quando:** apos calendario de agendamentos ou primeiro modulo financeiro.
- **Risco se postergar:** baixo no MVP, medio em producao com 3G.