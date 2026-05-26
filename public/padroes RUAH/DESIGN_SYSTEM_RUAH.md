# 🎨 Design System — RUAH Barber Lounge

> Documento oficial de identidade visual do studio **RUAH**.  
> Base white-label do FlowStudio AI — este arquivo é específico do cliente RUAH.  
> Outros studios terão seu próprio arquivo (`DESIGN_SYSTEM_<STUDIO>.md`).

---

## 1. Personalidade da Marca

**Conceito:** Neutro premium masculino com acento dourado.

- **Tom:** sóbrio, autêntico, confiante, lounge
- **Inspiração física:** parede de cimento queimado + cadeiras pretas + detalhes dourados + iluminação quente pontual
- **Referência de mercado:** Aesop, barbearias premium old-school, hotéis boutique
- **NÃO É:** moderno colorido, jovem energético, feminino delicado, corporativo frio

---

## 2. Paleta de Cores

### 2.1 Brand (Dourado RUAH)

Cor de assinatura. Usada em: logo, CTAs primários, item ativo do menu, focus rings, ícones de destaque.

| Token | Hex | Uso |
|---|---|---|
| `brand-50`  | `#FBF7EC` | Fundos sutis, hover de itens dourados |
| `brand-100` | `#F5EBC9` | Backgrounds suaves de badge brand |
| `brand-300` | `#E5C97A` | Bordas decorativas, estados disabled de brand |
| `brand-500` | `#C9A24B` | **Cor principal da marca** |
| `brand-600` | `#A8842F` | Hover de botões primários |
| `brand-700` | `#7E6320` | Pressed / active de botões |
| `brand-900` | `#3D2F0E` | Texto dourado sobre fundo claro |

### 2.2 Neutros (Grafite Premium)

Inspirado no cimento queimado das paredes do studio.

| Token | Hex | Uso |
|---|---|---|
| `neutral-50`  | `#FAFAFA` | Fundo de página alternativo |
| `neutral-100` | `#F4F4F5` | Cards leves, zebra de tabela |
| `neutral-200` | `#E4E4E7` | Borders default |
| `neutral-300` | `#D4D4D8` | Borders fortes, dividers |
| `neutral-400` | `#A1A1AA` | Placeholders, texto muted |
| `neutral-500` | `#71717A` | Texto secundário |
| `neutral-700` | `#3F3F46` | Texto primário |
| `neutral-900` | `#18181B` | Headings, sidebar fundo |
| `neutral-950` | `#0A0A0B` | Preto profundo — sidebar, logo bg |

### 2.3 Surfaces

| Token | Valor | Uso |
|---|---|---|
| `surface-default` | `#FFFFFF` | Fundo principal (admin claro) |
| `surface-muted`   | `#F7F7F8` | Fundo de seções, cards sutis |
| `surface-subtle`  | `#EFEFF1` | Separadores |
| `surface-raised`  | `#FFFFFF` + shadow | Cards elevados, modais |
| `surface-dark`    | `#0A0A0B` | Sidebar, header dark, footer landing |

### 2.4 Status (Calendário / Agendamentos)

Paleta **dessaturada terrosa** — não compete com o dourado.

| Status | Texto | Background | Uso |
|---|---|---|---|
| `pending`   | `#D97706` | `#FEF3C7` | Aguardando confirmação |
| `confirmed` | `#0E7490` | `#CFFAFE` | Confirmado |
| `completed` | `#15803D` | `#DCFCE7` | Concluído |
| `cancelled` | `#B91C1C` | `#FEE2E2` | Cancelado |
| `no_show`   | `#475569` | `#E2E8F0` | Não compareceu |

### 2.5 Feedback (Toasts / Alerts)

| Tipo | Cor |
|---|---|
| `success` | `#15803D` |
| `error`   | `#B91C1C` |
| `warning` | `#D97706` |
| `info`    | `#0E7490` |

---

## 3. Tipografia

### 3.1 Famílias

| Uso | Font Stack | Justificativa |
|---|---|---|
| **Display / Hero** | `'Cormorant Garamond', 'Playfair Display', serif` | Headings premium da landing — remete ao gótico/lounge do logo |
| **Body / UI** | `'Inter', system-ui, -apple-system, sans-serif` | Legibilidade impecável no admin |
| **Mono** | `'JetBrains Mono', monospace` | Códigos, IDs, debug |

> **Nota:** o display serif fica restrito à **landing pública**. O admin usa Inter em tudo para garantir performance e clareza operacional.

### 3.2 Escala (mobile-first)

| Token | Tamanho | Line-height | Uso |
|---|---|---|---|
| `text-xs`   | 12px | 1.4 | Labels, badges, captions |
| `text-sm`   | 14px | 1.5 | Texto secundário, tabelas |
| `text-base` | 16px | 1.6 | Texto padrão |
| `text-lg`   | 18px | 1.5 | Subtítulos |
| `text-xl`   | 20px | 1.4 | H4 |
| `text-2xl`  | 24px | 1.3 | H3 |
| `text-3xl`  | 30px | 1.2 | H2 |
| `text-4xl`  | 36px | 1.1 | H1 admin |
| `text-5xl`  | 48px | 1.05 | Hero landing (mobile) |
| `text-6xl`  | 64px | 1.0 | Hero landing (desktop) |

### 3.3 Pesos

- `font-normal` (400) — texto corrido
- `font-medium` (500) — labels, botões
- `font-semibold` (600) — headings, ênfase
- `font-bold` (700) — hero, brand statements

---

## 4. Espaçamento

Sistema baseado em **4px** (Tailwind default).

| Token | px | Uso típico |
|---|---|---|
| `space-1` | 4  | Gaps internos mínimos |
| `space-2` | 8  | Padding de badge, gap de ícone+texto |
| `space-3` | 12 | Gap entre itens de lista compacta |
| `space-4` | 16 | Padding padrão de card mobile |
| `space-6` | 24 | Padding padrão de card desktop |
| `space-8` | 32 | Separação entre seções |
| `space-12`| 48 | Separação entre blocos da landing |
| `space-16`| 64 | Espaçamento hero |
| `space-24`| 96 | Espaçamento hero desktop |

---

## 5. Border Radius

| Token | px | Uso |
|---|---|---|
| `rounded-sm`  | 4  | Inputs, badges |
| `rounded-md`  | 6  | Botões, selects |
| `rounded-lg`  | 8  | Cards |
| `rounded-xl`  | 12 | Cards destaque, modais |
| `rounded-2xl` | 16 | Hero blocks |
| `rounded-full`| 9999 | Avatares, badges circulares |

---

## 6. Sombras (Elevations)

```css
shadow-sm:   0 1px 2px rgba(0,0,0,0.04)
shadow-md:   0 4px 8px rgba(0,0,0,0.06)
shadow-lg:   0 8px 24px rgba(0,0,0,0.08)
shadow-xl:   0 16px 40px rgba(0,0,0,0.12)
shadow-gold: 0 4px 20px rgba(201, 162, 75, 0.25)  /* hover de CTA dourado */
```

---

## 7. Componentes Base

### 7.1 Button

**Variantes:**
- `primary` → fundo `brand-500`, texto `neutral-950`, hover `brand-600` + `shadow-gold`
- `secondary` → fundo `neutral-900`, texto `white`, hover `neutral-700`
- `outline` → border `neutral-300`, texto `neutral-900`, hover bg `neutral-50`
- `ghost` → sem fundo, hover bg `neutral-100`
- `destructive` → fundo `#B91C1C`, texto `white`

**Tamanhos:** `sm` (32px), `md` (40px — default), `lg` (48px)

**Estados:** default, hover, focus (ring `brand-500` 2px), active, disabled (opacity 0.5)

### 7.2 Input / Select / Textarea

- Border: `neutral-300`
- Background: `white`
- Focus: border `brand-500` + ring `brand-500/20`
- Placeholder: `neutral-400`
- Disabled: bg `neutral-100`, text `neutral-400`
- Erro: border `#B91C1C` + helper text vermelho

### 7.3 Card

- Background: `white`
- Border: `neutral-200`
- Radius: `rounded-lg`
- Padding: `space-4` mobile / `space-6` desktop
- Shadow: `shadow-sm` default, `shadow-md` em hover (quando clicável)

### 7.4 Badge

- Padding: `4px 10px`
- Radius: `rounded-full`
- Font: `text-xs font-medium`
- Cores: consome paleta de **status**

---

## 8. Layout Admin

### 8.1 Sidebar

- Background: `surface-dark` (`#0A0A0B`)
- Largura: 240px desktop, drawer mobile
- Texto inativo: `neutral-400`
- Texto ativo: `brand-500` (dourado)
- Background do item ativo: `rgba(201, 162, 75, 0.10)`
- Border lateral do item ativo: 3px sólido `brand-500`
- Logo no topo
- Border direita: `neutral-900`

### 8.2 Header

- Background: `white`
- Border-bottom: `neutral-200`
- Altura: 64px
- Avatar + nome do usuário à direita
- Notificações com badge `brand-500`

### 8.3 Tabela

- Header bg: `neutral-50`
- Header text: `neutral-700`, `text-sm font-semibold`, uppercase opcional
- Row hover: `neutral-50`
- Zebra: opcional `neutral-50` em linhas pares
- Border: `neutral-200`
- Cell padding: `12px 16px`

---

## 9. Landing Page Pública

A landing **herda os tokens** mas usa um tom mais "editorial":

- **Hero:** fundo escuro (`surface-dark`) com overlay de foto do studio + título em serif display dourado
- **Seções:** alterna `surface-default` (branco) e `surface-muted` (cinza claro)
- **CTAs principais:** botão primário dourado grande (`lg`)
- **Botão WhatsApp:** verde WhatsApp `#25D366` (exceção semântica)
- **Tipografia:** títulos em Cormorant Garamond, corpo em Inter
- **Imagens:** tratamento com leve overlay escuro para legibilidade do texto
- **Footer:** `surface-dark` com texto `neutral-400` e logo dourado

### Blocos obrigatórios da landing:
1. Header transparente sobre hero
2. Hero com foto + slogan + CTA
3. Sobre o studio (texto institucional)
4. Serviços em cards
5. Equipe (cards com foto)
6. Galeria
7. Localização + mapa
8. Captura de lead / WhatsApp
9. Footer

---

## 10. Princípios Visuais

1. **Contraste forte e intencional.** Preto, branco e dourado. Sem tons médios sem propósito.
2. **Dourado é pontual.** Nunca preenche grandes áreas. É assinatura, não fundo.
3. **Espaços generosos.** Lounge = respiração. Padding > densidade.
4. **Tipografia faz o trabalho pesado.** Hierarquia clara antes de decoração.
5. **Sombras suaves.** Nada de sombra dramática. Premium é discreto.
6. **Mobile-first sempre.** Desktop é progressive enhancement.

---

## 11. White-Label — Pontos de Sobrescrita

Quando um novo studio entrar, **apenas estes tokens mudam**:

```ts
// studio.config.ts
{
  brand: {
    50: '...',
    500: '...',  // ← cor principal
    600: '...',  // ← hover
    700: '...',
    900: '...',
  },
  displayFont: 'Cormorant Garamond',  // opcional override
  logo: '/logos/<studio>.svg',
  name: 'RUAH BARBER LOUNGE',
  slogan: 'Trazendo a essência, autenticidade, estilo e confiança',
}
```

**Todo o resto (neutros, status, espaçamentos, componentes) permanece igual.**

---

## 12. Versão

- **v1.0** — 26/05/2026 — Versão inicial RUAH
- Mantenedor: Willians + FlowStudio AI Architect
- Stack: Tailwind CSS + CSS Variables + TypeScript tokens
