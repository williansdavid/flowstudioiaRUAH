/**
 * buildBrandingCss — Ruah (FACHADA)
 * ----------------------------------------------------------------
 * Re-exporta a implementacao real do NUCLEO (lib/core).
 *
 * Mantemos esta fachada pra preservar imports existentes
 * (`@/sites/ruah/utils/buildBrandingCss`) sem breaking change.
 *
 * Nunca duplique logica aqui — sempre va ao nucleo.
 * ----------------------------------------------------------------
 */

export { buildBrandingCss } from '@/lib/core/utils/buildBrandingCss'
