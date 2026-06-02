/**
 * SEO Content — Type Contract (NUCLEO)
 * ----------------------------------------------------------------
 * Metadados de SEO da landing publica.
 *
 * Consumido pelo head() do TanStack Router em runtime SSR.
 * Cada studio define seu proprio bloco SEO, mantendo
 * isolamento total e personalizacao por deploy.
 *
 * Se ausente em content.ts, a rota usa fallback generico
 * derivado de identity.ts (nome do studio, descricao, etc.).
 * Resolucao do fallback: lib/core/utils/buildSeo.ts
 * ----------------------------------------------------------------
 */

export interface SEOContent {
  /** Title da pagina (ex.: "Barbearia Ruah | Premium em Botucatu") */
  title: string

  /** Meta description (ate ~155 caracteres pra Google) */
  description: string

  /** Keywords pra SEO (uso limitado em 2026, mas mantemos) */
  keywords?: string[]

  /** Imagem Open Graph (1200x630 ideal). Path absoluto desde /public */
  ogImage?: string

  /** URL canonica da landing (preenchida no deploy) */
  canonicalUrl?: string
}
