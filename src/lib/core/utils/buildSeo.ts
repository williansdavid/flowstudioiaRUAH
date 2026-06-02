/**
 * buildSeo (NUCLEO) — Resolucao de metadados SEO com fallback
 * ----------------------------------------------------------------
 * Combina `content.seo` (opcional) com `identity` (sempre presente)
 * pra produzir um objeto SEO 100% definido, consumido pelo
 * head() do TanStack Router no SSR.
 *
 * Filosofia:
 *   - content.seo e OPCIONAL no type (sections opcionais)
 *   - identity e OBRIGATORIO (fonte unica do negocio)
 *   - Esta funcao garante que sempre haja title/description validos
 *
 * Uso:
 *   const seo = buildSeo(content.seo, identity)
 *   seo.title       // sempre string
 *   seo.description // sempre string
 *   seo.keywords    // sempre string[] (pode ser vazio)
 * ----------------------------------------------------------------
 */

import type { SEOContent } from '../types/seo'
import type { StudioIdentity } from '../types/identity'

export interface ResolvedSeo {
  /** Title final (content.seo.title ou identity.name) */
  title: string
  /** Description final (content.seo.description ou identity.description) */
  description: string
  /** Keywords (content.seo.keywords ou array vazio) */
  keywords: string[]
  /** OG image (content.seo.ogImage ou undefined) */
  ogImage?: string
  /** Canonical URL (content.seo.canonicalUrl ou undefined) */
  canonicalUrl?: string
}

export function buildSeo(
  seo: SEOContent | undefined,
  identity: StudioIdentity,
): ResolvedSeo {
  return {
    title: seo?.title ?? identity.name,
    description: seo?.description ?? identity.description,
    keywords: seo?.keywords ?? [],
    ogImage: seo?.ogImage,
    canonicalUrl: seo?.canonicalUrl,
  }
}
