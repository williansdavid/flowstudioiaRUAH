/**
 * studio.ts — Entrypoint do Studio Ruah (CAMADA STUDIO)
 * ----------------------------------------------------------------
 * Superfície ÚNICA que o NÚCLEO consome deste studio.
 *
 * Consolida tudo que o `__root.tsx` precisa:
 *   - dados crus (branding, content, identity)
 *   - valores já computados (brandingCss, themeClass, seo)
 *   - builder de JSON-LD (função pura — núcleo serializa)
 *   - hrefs dos CSS do studio (transform ?url do Vite)
 *
 * REGRA: o núcleo importa SÓ via `@/config/active-studio`,
 * que reexporta este arquivo. Trocar de studio = trocar o
 * apontamento do switch, sem tocar no núcleo.
 *
 * FONTE DA VERDADE ÚNICA: src/sites/ruah/**
 * ----------------------------------------------------------------
 */

import { branding } from './config/branding'
import { content } from './config/content'
import { identity } from './config/identity'
import { buildLocalBusinessJsonLd } from './config/seo/jsonLd'
import { buildBrandingCss, buildSeo } from './utils'
import type { ResolvedSeo } from './utils'

import themeCss from './styles/theme.css?url'
import baseCss from './styles/base.css?url'
import animationsCss from './styles/animations.css?url'
import galleryCss from './styles/gallery.css?url'
import testimonialsCss from './styles/testimonials.css?url'

// ─────────────────────────── Dados crus ───────────────────────────
export { branding, content, identity, buildLocalBusinessJsonLd }

// ──────────────────────── Valores computados ──────────────────────

/** CSS variables geradas a partir do branding (injetado via <style>). */
export const brandingCss: string = buildBrandingCss(branding)

/** Classe de tema aplicada no <html> (ex.: "theme-dark"). */
export const themeClass: string = `theme-${branding.theme}`

/** SEO resolvido com fallback do identity (sempre definido). */
export const seo: ResolvedSeo = buildSeo(content.seo, identity)

// ─────────────────────── Assets de estilo ─────────────────────────

/**
 * Hrefs dos CSS do studio, NA ORDEM de aplicação (ordem importa).
 * Cada entrada é a URL final resolvida pelo transform `?url` do Vite.
 */
export const styleHrefs: readonly string[] = [
  themeCss,
  baseCss,
  animationsCss,
  galleryCss,
  testimonialsCss,
] as const
