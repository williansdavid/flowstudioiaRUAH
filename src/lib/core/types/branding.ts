/**
 * Brand Identity — Type Contract (NUCLEO)
 * ----------------------------------------------------------------
 * Contrato formal da identidade visual de um studio.
 * Vive no NUCLEO (lib/core) porque qualquer studio precisa
 * implementar essa shape pra ser plugavel.
 *
 * Modelo semantico (nao cor crua):
 *   - Tokens nomeados pela INTENCAO de uso, nao pela cor.
 *   - Permite trocar tema completo editando apenas o config.
 *   - Espelhado em CSS variables via buildBrandingCss().
 *
 * Categorias:
 *   - colors       -> cores da marca (primary, accent e variantes)
 *   - surfaces     -> fundos de pagina/secoes/cards
 *   - text         -> hierarquia textual
 *   - ui           -> bordas, divisores, foco
 *   - typography   -> 3 familias (display, heading, body)
 *   - logo         -> variantes do logo
 *   - shape        -> raios de borda (cards, botoes, pills)
 *   - theme        -> light | dark (modo base do studio)
 * ----------------------------------------------------------------
 */

export interface BrandColors {
  /** Cor primaria da marca — headings, surfaces dark isoladas. */
  primary: string
  /** Cor primaria em estado hover/active. */
  primaryHover: string

  /** Acento principal — linhas decorativas, icones, CTAs. */
  accent: string
  /** Acento em hover — botoes e elementos interativos. */
  accentHover: string
  /** Acento "bright" — texto/icone sobre fundos escuros (footer). */
  accentBright: string
}

export interface BrandSurfaces {
  /** Fundo global da pagina. */
  background: string
  /** Fundo de cards e elementos elevados. */
  surface: string
  /** Fundo alternado (gradient sections, blocos secundarios). */
  surfaceAlt: string
  /** Fundo dark isolado (footer, banners de contraste). */
  surfaceDark: string
}

export interface BrandText {
  /** Cor de headings e titulos sobre fundo claro. */
  heading: string
  /** Cor de paragrafos e corpo de texto. */
  body: string
  /** Cor de texto secundario / labels discretas. */
  muted: string
  /** Cor de texto sobre fundos escuros (footer, dark sections). */
  onDark: string
  /** Cor de texto muted sobre fundos escuros. */
  onDarkMuted: string
}

export interface BrandUI {
  /** Borda padrao de cards e divisores. */
  border: string
  /** Borda destacada (focus rings, elementos ativos). */
  borderAccent: string
}

export interface BrandTypography {
  /** Familia para headlines grandes (hero, section titles). */
  display: string
  /** Familia para subtitulos, labels, botoes. */
  heading: string
  /** Familia para paragrafos e corpo de texto. */
  body: string
}

export interface BrandLogo {
  /** Logo para fundos escuros. */
  dark: string
  /** Logo para fundos claros. */
  light: string
  /** Logo monocromatico dourado (variacao premium). */
  gold: string
  /** Texto alternativo do logo (acessibilidade). */
  alt: string
}

export interface BrandShape {
  /** Raio de borda de cards (lg). */
  card: string
  /** Raio de borda de botoes (sm/none — Art Deco usa quinas). */
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
