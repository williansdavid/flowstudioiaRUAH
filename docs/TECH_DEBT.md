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
