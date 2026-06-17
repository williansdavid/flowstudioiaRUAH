/**
 * System Branding — FlowStudio (NUCLEO)
 * ----------------------------------------------------------------
 * Identidade NEUTRA do SISTEMA (shell interno: login, admin,
 * error/notfound boundaries). NAO e identidade de studio.
 *
 * DOIS temas premium alternaveis:
 *   - systemDark  -> ".theme-system-dark"  (grafite quente + laranja acetinado)
 *   - systemLight -> ".theme-system-light" (off-white quente + champagne)
 *
 * Isolados de ".theme-dark"/".theme-light" (studios) via classe
 * dedicada. Sem colisao de cascata quando coexistem no DOM.
 *
 * Tipografia: stack NATIVA (system-ui). Zero Google Fonts no shell.
 *
 * REGRA DE OURO: nucleo NUNCA importa de sites/.
 *
 * ----------------------------------------------------------------
 * GUIA RÁPIDO — BOTÕES DO ADMIN:
 *   Fundo do botão principal (primary)       → colors.accent
 *   Fundo hover do botão principal           → colors.accentHover
 *   Letra do botão principal                 → surfaces.surfaceDark
 *   Borda do botão secundário (ghost)        → ui.border
 *   Letra do botão secundário (ghost)        → text.body
 *   Borda hover / focus ring                 → ui.borderAccent
 *   Arredondamento de TODOS os botões        → shape.button
 *   Cor do botão Danger (vermelho)           → buildBrandingCss.ts → --color-danger
 *   Cor do botão Success (verde)             → buildBrandingCss.ts → --color-success
 * ----------------------------------------------------------------
 */

import type { BrandIdentity } from "../types"

const SYSTEM_FONT_STACK =
  "system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"

/** Tema escuro do sistema — premium dark coeso (grafite quente + laranja acetinado). */
export const systemDark: BrandIdentity = {
  colors: {
    primary: "#E8824A",       // Laranja acetinado — base da marca do sistema
    primaryHover: "#D4703A",  // Laranja escurecido — estados ativos

    accent: "#E8824A",
    // ↑ Button primary → fundo | botão "+ AGENDAMENTO" e similares
    // ↑ Scrollbar hover | seleção de texto

    accentHover: "#D4703A",
    // ↑ Button primary → fundo no hover

    accentBright: "#F0A070",
    // ↑ Destaques sobre fundos escuros (sidebar item ativo, ícones)
  },

  surfaces: {
    background: "#081021",    // Navy frio — fundo global do admin
    surface: "#1A1816",       // Grafite quente — cards e painéis
    surfaceAlt: "#13110F",    // Grafite mais escuro — blocos secundários

    surfaceDark: "#070605",
    // ↑ Button primary → cor da LETRA
  },

  text: {
    heading: "#F7F5F0",       // Off-white quente — títulos

    body: "#C4BFB6",
    // ↑ Button ghost → cor da LETRA

    muted: "#8A857C",         // Bege escurecido — labels discretas
    onDark: "#F7F5F0",
    onDarkMuted: "#8A857C",
  },

  ui: {
    border: "#2E2A25",
    // ↑ Button ghost → BORDA

    borderAccent: "#E8824A",
    // ↑ Button ghost → borda no hover | focus ring global
  },

  typography: {
    display: SYSTEM_FONT_STACK,
    heading: SYSTEM_FONT_STACK,
    body: SYSTEM_FONT_STACK,
  },

  logo: {
    dark: "",
    light: "",
    gold: "",
    alt: "FlowStudio",
  },

  shape: {
    card: "0.75rem",

    button: "0.5rem",
    // ↑ Arredondamento de TODOS os botões do sistema admin

    pill: "9999px",
  },

  theme: "system-dark",
}

/** Tema claro do sistema — premium clean (off-white quente + champagne). */
export const systemLight: BrandIdentity = {
  colors: {
    primary: "#a67c34",
    primaryHover: "#8c6829",

    accent: "#a67c34",
    // ↑ Button primary → fundo (tema claro)

    accentHover: "#8c6829",
    // ↑ Button primary → fundo no hover (tema claro)

    accentBright: "#c9a55c",
    // ↑ Destaques sobre superfícies escuras isoladas
  },

  surfaces: {
    background: "#faf9f7",    // Off-white quente — fundo global
    surface: "#ffffff",       // Branco puro — cards/painel de login
    surfaceAlt: "#f4f2ee",    // Bloco secundário levemente quente

    surfaceDark: "#1c1a18",
    // ↑ Button primary → cor da LETRA (tema claro)
  },

  text: {
    heading: "#1c1a18",       // Grafite quente — títulos

    body: "#44403a",
    // ↑ Button ghost → cor da LETRA (tema claro)

    muted: "#78716c",         // Stone-500 — labels discretas
    onDark: "#fafafa",
    onDarkMuted: "#a1a1aa",
  },

  ui: {
    border: "#e7e3dc",
    // ↑ Button ghost → BORDA (tema claro)

    borderAccent: "#a67c34",
    // ↑ Button ghost → borda no hover | focus ring (tema claro)
  },

  typography: {
    display: SYSTEM_FONT_STACK,
    heading: SYSTEM_FONT_STACK,
    body: SYSTEM_FONT_STACK,
  },

  logo: {
    dark: "",
    light: "",
    gold: "",
    alt: "FlowStudio",
  },

  shape: {
    card: "0.75rem",

    button: "0.5rem",
    // ↑ Arredondamento de TODOS os botões do sistema admin

    pill: "9999px",
  },

  theme: "system-light",
}