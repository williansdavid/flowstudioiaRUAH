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
  ]

  const body = vars.map(([k, v]) => `  ${k}: ${v};`).join('\n')

  return `.theme-${theme} {\n${body}\n}\n`
}
