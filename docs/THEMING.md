# 🎨 FlowStudio AI — Sistema de Temas (White-Label)

> Documento oficial de arquitetura do sistema de temas.
> Última atualização: 2026-05-26

---

## 1. Visão geral

O FlowStudio AI é uma plataforma **white-label** com deploy isolado por studio.
Cada studio tem seu próprio deploy Netlify + Supabase + identidade visual.

A identidade visual é controlada por **um único arquivo de tema CSS**, ativado
no momento do build via `src/styles/tokens.css`.

**Regra de ouro:** apenas **UM** tema ativo por deploy. Sem troca em runtime.

---

## 2. Temas disponíveis

| Tema | Identidade | Uso recomendado |
|------|------------|-----------------|
| **soft** | Rose Nude (quente, feminino, acolhedor) | Salões femininos, estética, beleza |
| **classic** | Luxe Gold (dourado premium, atemporal) | Salões sofisticados, barbearias premium |
| **premium** | Dark Platinum (dark luxo, moderno) | Barbearias modernas, studios masculinos |

Arquivos: `src/styles/themes/{soft,classic,premium}.css`

---

## 3. Como trocar o tema de um studio

### Passo 1 — Editar `src/styles/tokens.css`

Deixe **apenas uma** linha `@import` ativa:

```css
/* @import './themes/classic.css'; */
@import './themes/soft.css';
/* @import './themes/premium.css'; */
