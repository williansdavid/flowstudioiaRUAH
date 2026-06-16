/**
 * Core Utils Barrel
 * ----------------------------------------------------------------
 * Ponto unico de exportacao dos utilitarios do NUCLEO.
 * Sempre importar via: `@/lib/core/utils`
 * ----------------------------------------------------------------
 */
export { normalizePhoneBR, PhoneNormalizeError } from './phone'
export { phoneBRSchema, phoneBROptionalSchema } from './phone'
export { formatPhoneBR, maskPhoneBRInput } from './phone'
export { buildBrandingCss } from './buildBrandingCss'

export { buildSeo } from './buildSeo'
export type { ResolvedSeo } from './buildSeo'
