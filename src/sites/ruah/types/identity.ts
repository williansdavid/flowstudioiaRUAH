/**
 * Studio Identity — Ruah (FACHADA)
 * ----------------------------------------------------------------
 * Re-exporta os contratos de identidade do NUCLEO (lib/core).
 *
 * Mantemos este arquivo como fachada pra preservar imports
 * existentes (`@/sites/ruah/types`) sem breaking change.
 *
 * Nunca declare types proprios aqui — sempre estenda do nucleo.
 * Se precisar customizar, abra discussao arquitetural antes.
 * ----------------------------------------------------------------
 */

export type {
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
} from '@/lib/core/types/identity'
