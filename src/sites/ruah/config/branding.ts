/**
 * Studio Branding — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Identidade visual oficial do studio Ruah.
 * Estilo: Art Deco Contemporary — dark-first (verde militar + dourado).
 *
 * Modelo semântico:
 *   - Nenhum componente deve usar cor crua (#xxxxxx).
 *   - Todos os tokens são acessados via `branding.colors.accent`,
 *     `branding.text.heading`, etc.
 *   - Em etapa futura, esses tokens serão expostos como CSS
 *     variables em `src/sites/ruah/styles/theme.css`.
 *
 * Paleta oficial (validada contra docs/barber exemplo):
 *   - Verde militar profundo  #1a3a3a   primary / background
 *   - Verde militar claro     #2d5a5a   surfaces / cards / border
 *   - Verde militar escuro    #0f2020   surfaceDark / contraste
 *   - Dourado quente          #d4a574   accent / linhas / CTAs
 *   - Dourado bright          #facc15   ícones sobre fundo escuro
 *   - Marfim                  #f5f1e8   texto principal
 *   - Cinza neutro quente     #b8b4a8   texto muted
 *
 * Fontes (Google Fonts):
 *   - Playfair Display → headlines grandes (display)
 *   - Montserrat       → subtítulos, labels, botões (heading)
 *   - Lato             → corpo de texto (body)
 *
 * Tema base: dark (todo o studio opera em modo escuro premium).
 *
 * Assets atuais em /public/ruah/images/logo/.
 * Por ora, as 3 variantes (dark/light/gold) apontam para o mesmo
 * logo.jpg. Quando Willians gerar as variantes SVG definitivas,
 * basta trocar os paths abaixo — nenhum componente precisa mudar.
 * ----------------------------------------------------------------
 */

import type { BrandIdentity } from '../types'

export const branding: BrandIdentity = {
  colors: {
    // Brand
    primary: '#1a3a3a',        // Verde militar — base da marca
    primaryHover: '#0f2020',   // Verde mais profundo — estados ativos

    // Accent (dourado quente)
    accent: '#d4a574',         // Dourado — linhas, ícones, CTAs principais
    accentHover: '#b8935f',    // Dourado escurecido — hover de botões
    accentBright: '#facc15',   // Dourado bright — texto/ícone sobre fundo escuro
  },

  surfaces: {
    background: '#1a3a3a',     // Fundo global — verde militar profundo
    surface: '#2d5a5a',        // Cards — verde militar claro
    surfaceAlt: '#2d5a5a',     // Seções alternadas — mesmo tom de card
    surfaceDark: '#0f2020',    // Footer e blocos de contraste extremo
  },

  text: {
    heading: '#f5f1e8',        // Marfim — títulos sobre fundo escuro
    body: '#f5f1e8',           // Marfim — parágrafos
    muted: '#b8b4a8',          // Cinza neutro quente — labels discretas
    onDark: '#f5f1e8',         // Marfim — texto no footer/contraste
    onDarkMuted: '#b8b4a8',    // Cinza quente — copyright, links discretos
  },

  ui: {
    border: '#2d5a5a',         // Verde militar claro — bordas de cards
    borderAccent: '#d4a574',   // Dourado — bordas destacadas e focus rings
  },

  typography: {
    display: '"Playfair Display", Georgia, serif',
    heading: '"Montserrat", system-ui, sans-serif',
    body: '"Lato", system-ui, sans-serif',
  },

  logo: {
    dark:  '/ruah/images/logo/logo.jpeg',
    light: '/ruah/images/logo/logo.jpeg',
    gold:  '/ruah/images/logo/logo.jpeg',
    alt:   'Ruah Barber Lounge',
  },

  shape: {
    card: '0.5rem',            // rounded-lg
    button: '0.125rem',        // rounded-sm — Art Deco prefere quinas
    pill: '9999px',            // rounded-full — social icons
  },

  theme: 'dark',
}
