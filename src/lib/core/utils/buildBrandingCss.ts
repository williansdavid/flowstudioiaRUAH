import type { BrandIdentity } from '../types/branding'

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

    // Feedback semantico
    ['--color-success', '#22C55E'],
    ['--color-danger', '#EF4444'],

    // Typography
    ['--font-display', typography.display],
    ['--font-heading', typography.heading],
    ['--font-body', typography.body],

    // Shape
    ['--radius-card', shape.card],
    ['--radius-button', shape.button],
    ['--radius-pill', shape.pill],

    // Profundidade
    ['--color-surface-2', `color-mix(in srgb, ${surfaces.surface} 65%, ${surfaces.surfaceDark})`],

    // Sombras suaves
    ['--shadow-sm', `0 2px 8px rgba(0,0,0,0.2)`],
    ['--shadow-md', `0 8px 24px rgba(0,0,0,0.25)`],
    ['--shadow-lg', `0 12px 40px rgba(0,0,0,0.25)`],
    ['--shadow-accent', `0 0 0 1px rgba(34,197,94,0.3), 0 8px 24px -6px rgba(0,0,0,0.25)`],

    // Gradiente diagonal do app
    ['--gradient-app', `radial-gradient(120% 120% at 0% 0%, ${surfaces.surface} 0%, ${surfaces.background} 45%, ${surfaces.surfaceDark} 100%)`],

    // Sidebar
    ['--color-sidebar-bg', `color-mix(in srgb, ${surfaces.surfaceDark} 88%, ${colors.primary})`],
    ['--color-sidebar-text', text.muted],
    ['--color-sidebar-active', colors.accentBright],
  ]

  const body = vars.map(([k, v]) => `  ${k}: ${v};`).join('\n')

  return `.theme-${theme} {\n${body}\n}\n`
}