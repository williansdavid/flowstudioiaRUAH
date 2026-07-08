// src/config

/**
 * active-studio.ts — SWITCH do Studio Ativo (CAMADA NÚCLEO)
 * ----------------------------------------------------------------
 * Ponto ÚNICO de acoplamento entre núcleo e studios.
 *
 * O núcleo (__root.tsx e afins) importa SOMENTE deste arquivo.
 * Para trocar o studio ativo deste deploy, altere APENAS a linha
 * de reexport abaixo (ex.: '@/sites/outro-studio/studio').
 *
 * Contrato exportado (estável entre studios):
 *   branding, content, identity,
 *   brandingCss, themeClass, seo,
 *   buildLocalBusinessJsonLd, styleHrefs
 * ----------------------------------------------------------------
 */

export * from '@/sites/ruah/studio'
export const siteUrl = 'http://www.ruahbarbearia.com.br/'