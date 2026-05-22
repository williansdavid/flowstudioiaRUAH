# 📐 Guia de Seções da Landing — FlowStudio AI

> Referência rápida para configurar, editar e estender as seções da landing pública do studio.

---

## 🗂 Arquitetura em 3 camadas

| Arquivo | Responsabilidade |
|---|---|
| `studio.config.ts` | **CONTEÚDO** (textos, imagens, telefones do studio) |
| `studio.sections.ts` | **LAYOUT** (quais seções, em que ordem, qual variante) |
| `SectionsRenderer.tsx` | **RENDER** (resolve variante → componente) |

**Regra de ouro:**

- Mudou **texto/imagem** → editar `studio.config.ts`
- Mudou **layout/ordem/variante** → editar `studio.sections.ts`
- Criou **nova variante visual** → editar `SectionsRenderer.tsx` + criar componente

---

## 📁 Arquivos-chave

| Arquivo | Função |
|---|---|
| `src/config/studio.config.ts` | Conteúdo do studio |
| `src/config/studio.sections.ts` | Ordem + variantes + props de layout |
| `src/types/sections.ts` | Contratos TypeScript |
| `src/components/landing/SectionsRenderer.tsx` | Resolve variante → componente React |
| `src/components/landing/<section>/` | Implementações de cada variante |

---

## 🔄 Fluxo de dados

`studio.config.ts` + `studio.sections.ts` → **loader** (merge runtime) → `SectionsRenderer` → `<Component variant="..." />`

O **loader** mescla conteúdo do `studio.config.ts` nas props das seções em runtime:

- **Layout** declarativo em `studio.sections.ts`
- **Conteúdo** centralizado em `studio.config.ts`

---

## 🎨 Catálogo de Seções

### 1. HERO — `id: "hero"`

**Variantes disponíveis:**

| Variant | Componente | Quando usar |
|---|---|---|
| `fullscreen` | `HeroFullscreen` | Imagem cobrindo tela inteira com overlay (padrão) |
| `split` | `HeroSplit` | Texto de um lado, imagem do outro |
| `minimal` | `HeroMinimal` | Apenas texto centralizado |

**Props:**

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `eyebrow` | `string` | não | Texto pequeno acima do título |
| `title` | `string` | **sim** | Título principal |
| `subtitle` | `string` | não | Subtítulo |
| `description` | `string` | não | Parágrafo descritivo |
| `alignment` | `Alignment` | não | Alinhamento do texto |
| `height` | `SectionHeight` | não | Altura da seção |
| `background` | `BackgroundImage` | não | Imagem de fundo + overlay |
| `primaryCta` | `CtaConfig` | não | Botão principal |
| `secondaryCta` | `CtaConfig` | não | Botão secundário |
| `sideImage` | `{ src, alt?, position? }` | não | Imagem lateral (usado no `split`) |

---

### 2. SOBRE — `id: "about"`

**Variantes:** `text-only` · `text-image` · `stats`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | **sim** |
| `alignment` | `Alignment` | não |
| `image` | `{ src, alt?, position? }` | não |
| `stats` | `Array<{ label, value }>` | não |
| `cta` | `CtaConfig` | não |

---

### 3. SERVIÇOS — `id: "services"`

**Variantes:** `grid` · `list` · `cards-featured`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | não |
| `source` | `supabase` ou `static` | não |
| `items` | `Array<{ name, description?, price?, duration?, image? }>` | não |
| `columns` | `2`, `3` ou `4` | não |
| `showPrice` | `boolean` | não |
| `showDuration` | `boolean` | não |
| `cta` | `CtaConfig` | não |

---

### 4. EQUIPE — `id: "team"`

**Variantes:** `grid` · `carousel` · `list`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | não |
| `source` | `supabase` ou `static` | não |
| `items` | `Array<{ name, role?, photo?, bio?, instagram? }>` | não |
| `columns` | `2`, `3` ou `4` | não |

---

### 5. GALERIA — `id: "gallery"`

**Variantes:** `grid` · `masonry` · `carousel`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | não |
| `images` | `Array<{ src, alt?, caption? }>` | **sim** |
| `columns` | `2`, `3` ou `4` | não |
| `showCaptions` | `boolean` | não |

---

### 6. DEPOIMENTOS — `id: "testimonials"`

**Variantes:** `grid` · `carousel` · `featured`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | não |
| `items` | `Array<{ name, role?, photo?, rating?, message }>` | **sim** |
| `columns` | `2` ou `3` | não |

---

### 7. CONTATO — `id: "contact"`

**Variantes:** `form-map` · `form-only` · `whatsapp-cta`

| Prop | Tipo | Obrigatório |
|---|---|---|
| `eyebrow` | `string` | não |
| `title` | `string` | **sim** |
| `description` | `string` | não |
| `showMap` | `boolean` | não |
| `mapEmbedUrl` | `string` | não |
| `showAddress` | `boolean` | não |
| `showPhone` | `boolean` | não |
| `showWhatsapp` | `boolean` | não |
| `showInstagram` | `boolean` | não |
| `leadFormFields` | `Array<'name' \| 'phone' \| 'email' \| 'service' \| 'message'>` | não |
| `whatsappCta` | `CtaConfig` | não |

---

## 🧱 Tipos compartilhados

**CtaConfig:** `{ label: string; href: string; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; external?: boolean; }`

**BackgroundImage:** `{ src: string; alt?: string; position?: string; overlay?: { enabled: boolean; color?: string; opacity?: number; } }`

**Alignment:** `'left' | 'center' | 'right'`

**SectionHeight:** `'auto' | 'sm' | 'md' | 'lg' | 'fullscreen'`

---

## 🍳 Receitas práticas

### Trocar variante do Hero

Em `studio.sections.ts`, alterar o campo `variant` da seção `hero` de `fullscreen` para `split` (ou outra disponível).

### Desativar uma seção

Em `studio.sections.ts`, definir `enabled: false` na seção desejada. Ela não será renderizada.

### Reordenar seções

Em `studio.sections.ts`, alterar o array `order`, por exemplo: `['hero', 'services', 'about', 'contact']`.

### Adicionar nova variante (ex: HeroVideo)

1. Criar componente em `src/components/landing/hero/HeroVideo.tsx`
2. Exportar no barrel `src/components/landing/hero/index.ts`
3. Adicionar `'video'` ao tipo `HeroVariant` em `src/types/sections.ts`
4. Registrar no `variantsMap` dentro de `SectionsRenderer.tsx`
5. Usar a variante em `studio.sections.ts` com `variant: 'video'`

---

## ✅ Status atual das seções

| Seção | Variante ativa | Componente | Status |
|---|---|---|---|
| `hero` | `fullscreen` | `HeroFullscreen` | ✅ Migrado para SectionsRenderer |
| `services` | — | inline na rota | 🟡 Pendente migração |
| `about` | — | inline na rota | 🟡 Pendente migração |
| `team` | — | — | ⚪ Não implementado |
| `gallery` | — | — | ⚪ Não implementado |
| `testimonials` | — | — | ⚪ Não implementado |
| `contact` | — | — | ⚪ Não implementado |

---

## 🛡 Regras arquiteturais

- ❌ **NUNCA** colocar conteúdo do studio diretamente dentro de um componente de seção
- ❌ **NUNCA** importar `studio.config.ts` dentro de componentes `landing/<section>/`
- ✅ **SEMPRE** receber dados via `props` (componentes stateless)
- ✅ **SEMPRE** registrar nova variante no `variantsMap` antes de usar
- ✅ **SEMPRE** rodar `npx tsc --noEmit` após editar tipos

---

_Última atualização: maio/2026 — Fase 2 (Hero plugável) concluída._
