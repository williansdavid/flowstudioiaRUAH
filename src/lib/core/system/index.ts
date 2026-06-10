/**
 * System module — barrel (NUCLEO)
 * ----------------------------------------------------------------
 * Fachada do branding/tema de SISTEMA. Consumido por _app.tsx,
 * _authed.tsx e boundaries do __root.
 *
 * DOIS temas premium:
 *   - systemDark  -> .theme-system-dark  -> systemDarkCss
 *   - systemLight -> .theme-system-light -> systemLightCss
 *
 * Default do shell = dark (systemBrandingCss = systemDarkCss),
 * mantido pra nao quebrar __root.tsx. A alternancia entre os dois
 * vem na camada de UI (toggle) — fora deste barrel.
 * ----------------------------------------------------------------
 */

import { buildBrandingCss } from '../utils/buildBrandingCss'
import { systemDark, systemLight } from './branding'

export { systemDark, systemLight } from './branding'

/** CSS do tema escuro do sistema (vars escopadas em .theme-system-dark). */
export const systemDarkCss: string = buildBrandingCss(systemDark)

/** CSS do tema claro do sistema (vars escopadas em .theme-system-light). */
export const systemLightCss: string = buildBrandingCss(systemLight)

/**
 * CSS de sistema injetado por padrao no head.
 * Contem AMBOS os temas — o `.theme-system-*` ativo na arvore decide
 * qual conjunto de vars vale. Sem JS, sem flash, SSR-safe.
 */
export const systemBrandingCss: string = `${systemDarkCss}${systemLightCss}`

/** Classe default do shell (dark). Toggle troca p/ 'theme-system-light'. */
export const systemThemeClass = `theme-${systemDark.theme}` as const

/** Classes disponiveis — uso na UI de alternancia. */
export const systemThemeClasses = {
  dark: `theme-${systemDark.theme}`,
  light: `theme-${systemLight.theme}`,
} as const

/** Href do CSS de regras base do sistema (injetar via styles[] no head). */
export { default as systemThemeCssHref } from './theme.css?url'
