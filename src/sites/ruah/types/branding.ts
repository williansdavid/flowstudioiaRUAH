/**
 * Brand Identity — Type Contract
 * ----------------------------------------------------------------
 * Define a estrutura semântica da identidade visual de um studio.
 *
 * Modelo semântico (não cor crua):
 *   - Tokens nomeados pela INTENÇÃO de uso, não pela cor.
 *   - Permite trocar tema completo editando apenas o config.
 *   - Espelhado em CSS variables no theme.css (etapa futura).
 *
 * Categorias:
 *   - brand        → cores da marca (primary, accent e variantes)
 *   - surfaces     → fundos de página/seções/cards
 *   - text         → hierarquia textual
 *   - ui           → bordas, divisores, foco
 *   - typography   → 3 famílias (display, heading, body)
 *   - logo         → variantes do logo
 *   - shape        → raios de borda (cards, botões, pills)
 *   - theme        → light | dark (modo base do studio)
 * ----------------------------------------------------------------
 */

export interface BrandColors {
  /** Cor primária da marca — headings, surfaces dark isoladas. */
  primary: string
  /** Cor primária em estado hover/active. */
  primaryHover: string

  /** Acento principal — linhas decorativas, ícones, CTAs. */
  accent: string
  /** Acento em hover — botões e elementos interativos. */
  accentHover: string
  /** Acento "bright" — texto/ícone sobre fundos escuros (footer). */
  accentBright: string
}

export interface BrandSurfaces {
  /** Fundo global da página. */
  background: string
  /** Fundo de cards e elementos elevados. */
  surface: string
  /** Fundo alternado (gradient sections, blocos secundários). */
  surfaceAlt: string
  /** Fundo dark isolado (footer, banners de contraste). */
  surfaceDark: string
}

export interface BrandText {
  /** Cor de headings e títulos sobre fundo claro. */
  heading: string
  /** Cor de parágrafos e corpo de texto. */
  body: string
  /** Cor de texto secundário / labels discretas. */
  muted: string
  /** Cor de texto sobre fundos escuros (footer, dark sections). */
  onDark: string
  /** Cor de texto muted sobre fundos escuros. */
  onDarkMuted: string
}

export interface BrandUI {
  /** Borda padrão de cards e divisores. */
  border: string
  /** Borda destacada (focus rings, elementos ativos). */
  borderAccent: string
}

export interface BrandTypography {
  /** Família para headlines grandes (hero, section titles). */
  display: string
  /** Família para subtítulos, labels, botões. */
  heading: string
  /** Família para parágrafos e corpo de texto. */
  body: string
}

export interface BrandLogo {
  /** Logo para fundos escuros. */
  dark: string
  /** Logo para fundos claros. */
  light: string
  /** Logo monocromático dourado (variação premium). */
  gold: string
  /** Texto alternativo do logo (acessibilidade). */
  alt: string
}

export interface BrandShape {
  /** Raio de borda de cards (lg). */
  card: string
  /** Raio de borda de botões (sm/none — Art Deco usa quinas). */
  button: string
  /** Raio de borda de elementos pill (full). */
  pill: string
}

export type BrandTheme = 'light' | 'dark'

export interface BrandIdentity {
  colors: BrandColors
  surfaces: BrandSurfaces
  text: BrandText
  ui: BrandUI
  typography: BrandTypography
  logo: BrandLogo
  shape: BrandShape
  /** Modo base do studio. Define defaults de surface/text. */
  theme: BrandTheme
}
