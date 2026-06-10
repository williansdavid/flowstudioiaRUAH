/**
 * System Branding — FlowStudio (NUCLEO)
 * ----------------------------------------------------------------
 * Identidade NEUTRA do SISTEMA (shell interno: login, admin,
 * error/notfound boundaries). NAO e identidade de studio.
 *
 * DOIS temas premium alternaveis:
 *   - systemDark  -> ".theme-system-dark"  (grafite quente + champagne)
 *   - systemLight -> ".theme-system-light" (off-white quente + champagne)
 *
 * Isolados de ".theme-dark"/".theme-light" (studios) via classe
 * dedicada. Sem colisao de cascata quando coexistem no DOM.
 *
 * Tipografia: stack NATIVA (system-ui). Zero Google Fonts no shell.
 *
 * REGRA DE OURO: nucleo NUNCA importa de sites/.
 * ----------------------------------------------------------------
 */

import type { BrandIdentity } from "../types"

const SYSTEM_FONT_STACK =
  "system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"

/** Tema escuro do sistema — premium dark coeso (grafite quente + champagne). */
export const systemDark: BrandIdentity = {
  colors: {
    primary: "#E0B859",       // Champagne luminoso e limpo
    primaryHover: "#EBC976",  // Champagne claro (hover)
    accent: "#E0B859",
    accentHover: "#EBC976",
    accentBright: "#F2D98C",  // Champagne brilhante (destaques)
  },
  surfaces: {
    background: "#081021",    // ERA "#0C0B0A" — navy frio cravado
    surface: "#1A1816",       // (inalterado por ora)
    surfaceAlt: "#13110F",    // (inalterado por ora)
    surfaceDark: "#070605",   // (inalterado por ora)
  },
  text: {
    heading: "#F7F5F0",       // Off-white quente — titulos
    body: "#C4BFB6",          // Bege-cinza claro — corpo
    muted: "#8A857C",         // Bege escurecido — labels discretas
    onDark: "#F7F5F0",
    onDarkMuted: "#8A857C",
  },
  ui: {
    border: "#2E2A25",        // Borda quente, visivel sem gritar
    borderAccent: "#E0B859",  // focus rings (champagne)
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
    pill: "9999px",
  },
  theme: "system-dark",
}


/** Tema claro do sistema — premium clean (off-white quente + champagne). */
export const systemLight: BrandIdentity = {
  colors: {
    primary: "#a67c34",        // champagne escurecido p/ contraste em fundo claro
    primaryHover: "#8c6829",
    accent: "#a67c34",
    accentHover: "#8c6829",
    accentBright: "#c9a55c",   // champagne sobre superficies escuras isoladas
  },
  surfaces: {
    background: "#faf9f7",     // off-white quente — fundo global clean
    surface: "#ffffff",        // branco puro — cards/painel de login
    surfaceAlt: "#f4f2ee",     // bloco secundario levemente quente
    surfaceDark: "#1c1a18",    // contraste escuro isolado (topbar/banner)
  },
  text: {
    heading: "#1c1a18",        // grafite quente — titulos
    body: "#44403a",           // marrom-grafite — corpo
    muted: "#78716c",          // stone-500 — labels discretas
    onDark: "#fafafa",         // texto sobre surfaceDark
    onDarkMuted: "#a1a1aa",
  },
  ui: {
    border: "#e7e3dc",         // borda suave quente
    borderAccent: "#a67c34",   // focus rings
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
    pill: "9999px",
  },
  theme: "system-light",
}
