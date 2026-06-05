/**
 * buildBrandingCss (NUCLEO)
 * ----------------------------------------------------------------
 * Converte um objeto BrandIdentity em uma string CSS contendo
 * todas as CSS variables do tema, escopadas em `.theme-<mode>`.
 *
 * Uso:
 *   const css = buildBrandingCss(branding)
 *   // -> ".theme-dark { --color-primary: #1a3a3a; ... }"
 *
 * Por que funcao pura (nao componente)?
 *   - Roda em SSR sem dependencia de React.
 *   - Output e injetado via <style> no <head> do __root.
 *   - Permite caching trivial (mesmo input -> mesmo output).
 *
 * Convencao de nomes:
 *   branding.colors.primary       -> --color-primary
 *   branding.surfaces.background  -> --color-bg
 *   branding.text.heading         -> --color-text-heading
 *   branding.typography.display   -> --font-display
 *   branding.shape.card           -> --radius-card
 * ----------------------------------------------------------------
 */

import type { BrandIdentity } from '../types/branding'

/**
 * Gera string CSS com todas as variables do branding,
 * escopadas em `.theme-<mode>` (ex.: .theme-dark).
 */
export function buildBrandingCss(branding: BrandIdentity): string {
  const { colors, surfaces, text, ui, typography, shape, theme } = branding

  const vars: Array<[string, string]> = [
    // Brand colors
    ['--color-primary', colors.primary],
    ['--color-primary-hover', colors.primaryHover],
    ['--color-accent', colors.accent],
    ['--color-accent-hover', colors.accentHover],
    ['--color-accent-bright', colors.accentBright],

    // Surfaces
    ['--color-bg', surfaces.background],
    ['--color-surface', surfaces.surface],
    ['--color-surface-alt', surfaces.surfaceAlt],
    ['--color-surface-dark', surfaces.surfaceDark],

    // Text
    ['--color-text-heading', text.heading],
    ['--color-text-body', text.body],
    ['--color-text-muted', text.muted],
    ['--color-text-on-dark', text.onDark],
    ['--color-text-on-dark-muted', text.onDarkMuted],

    // UI
    ['--color-border', ui.border],
    ['--color-border-accent', ui.borderAccent],

    // Typography
    ['--font-display', typography.display],
    ['--font-heading', typography.heading],
    ['--font-body', typography.body],

    // Shape
    ['--radius-card', shape.card],
    ['--radius-button', shape.button],
    ['--radius-pill', shape.pill],
    // Shape
    ['--radius-card', shape.card],
    ['--radius-button', shape.button],
    ['--radius-pill', shape.pill],

    // ── Profundidade (derivada das cores do studio) ───────────────
    // Tom intermediário entre surface e surfaceDark — resolve o
    // problema de surface === surfaceAlt e permite camadas reais.
    ['--color-surface-2', `color-mix(in srgb, ${surfaces.surface} 65%, ${surfaces.surfaceDark})`],

    // Sombras calibradas para fundo escuro: preto + halo dourado sutil.
    ['--shadow-sm', `0 1px 2px 0 color-mix(in srgb, ${surfaces.surfaceDark} 70%, transparent)`],
    ['--shadow-md', `0 4px 12px -2px color-mix(in srgb, ${surfaces.surfaceDark} 80%, transparent)`],
    ['--shadow-lg', `0 12px 32px -8px color-mix(in srgb, ${surfaces.surfaceDark} 85%, transparent)`],
    ['--shadow-accent', `0 0 0 1px color-mix(in srgb, ${colors.accent} 30%, transparent), 0 8px 24px -6px color-mix(in srgb, ${surfaces.surfaceDark} 80%, transparent)`],

    // Gradiente diagonal do app — mesmo efeito da tela de login.
    ['--gradient-app', `radial-gradient(120% 120% at 0% 0%, ${surfaces.surface} 0%, ${surfaces.background} 45%, ${surfaces.surfaceDark} 100%)`],

  ]

  const body = vars.map(([k, v]) => `  ${k}: ${v};`).join('\n')

  return `.theme-${theme} {\n${body}\n}\n`
}
