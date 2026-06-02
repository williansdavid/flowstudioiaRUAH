/**
 * Core Barrel — FlowStudio AI
 * ----------------------------------------------------------------
 * Ponto unico de import do NUCLEO da plataforma.
 *
 * Aqui vivem os contratos (types) e utilitarios genericos
 * que TODOS os studios consomem. O nucleo NAO depende de
 * nenhum studio especifico.
 *
 * Uso:
 *   import type { BrandIdentity, StudioIdentity } from '@/lib/core'
 *   import { buildBrandingCss, buildSeo } from '@/lib/core'
 * ----------------------------------------------------------------
 */

// Types (contratos do studio)
export type {
  // Branding
  BrandColors,
  BrandSurfaces,
  BrandText,
  BrandUI,
  BrandTypography,
  BrandLogo,
  BrandShape,
  BrandTheme,
  BrandIdentity,
  // Identity
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
  // SEO
  SEOContent,
} from './types'

// Utils (helpers genericos)
export { buildBrandingCss, buildSeo } from './utils'
export type { ResolvedSeo } from './utils'
