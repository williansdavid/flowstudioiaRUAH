/**
 * buildSeo — Ruah (FACHADA)
 * ----------------------------------------------------------------
 * Re-exporta a implementacao real do NUCLEO (lib/core).
 *
 * Mantemos esta fachada pra preservar imports existentes
 * (`@/sites/ruah/utils/buildSeo`) sem breaking change.
 *
 * Nunca duplique logica aqui — sempre va ao nucleo.
 * ----------------------------------------------------------------
 */

export { buildSeo } from '@/lib/core/utils/buildSeo'
export type { ResolvedSeo } from '@/lib/core/utils/buildSeo'
