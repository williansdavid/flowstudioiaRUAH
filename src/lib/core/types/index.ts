/**
 * Core Types Barrel
 * ----------------------------------------------------------------
 * Ponto unico de exportacao dos contratos do NUCLEO.
 * Sempre importar via: `@/lib/core/types`
 * ----------------------------------------------------------------
 */

// Branding
export type {
  BrandColors,
  BrandSurfaces,
  BrandText,
  BrandUI,
  BrandTypography,
  BrandLogo,
  BrandShape,
  BrandTheme,
  BrandIdentity,
} from './branding'

// Identity
export type {
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
} from './identity'

// SEO
export type { SEOContent } from './seo'
