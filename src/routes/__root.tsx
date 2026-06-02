/**
 * __root.tsx — Root Route do TanStack React Start
 * ----------------------------------------------------------------
 * Responsabilidades:
 *   1. Carregar branding + content + identity do studio
 *   2. Injetar CSS variables no <head> via SSR (zero FOUC)
 *   3. Aplicar a classe de tema no <html> (.theme-dark)
 *   4. Carregar fontes Google via preconnect + link
 *   5. Importar theme.css + base.css + animations.css + gallery.css + testimonials.css
 *   6. Resolver SEO com fallback identity (buildSeo)
 *   7. SEO completo: Open Graph + Twitter Card + favicon + theme-color
 *   8. Renderizar <Outlet />
 *   9. Tipar RouterContext global
 *
 * FONTE DA VERDADE ÚNICA: src/sites/ruah/**
 * ----------------------------------------------------------------
 */

import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'


import { branding } from '@/sites/ruah/config/branding'
import { content } from '@/sites/ruah/config/content'
import { identity } from '@/sites/ruah/config/identity'
import { buildLocalBusinessJsonLd } from '@/sites/ruah/config/seo/jsonLd'
import themeCss from '@/sites/ruah/styles/theme.css?url'
import baseCss from '@/sites/ruah/styles/base.css?url'
import animationsCss from '@/sites/ruah/styles/animations.css?url'
import galleryCss from '@/sites/ruah/styles/gallery.css?url'
import testimonialsCss from '@/sites/ruah/styles/testimonials.css?url'
import { buildBrandingCss, buildSeo } from '@/sites/ruah/utils'

// ============================================================
// Router Context
// ============================================================
export interface RouterContext {
  queryClient: QueryClient 
}

// CSS variables geradas a partir do branding
const brandingCss = buildBrandingCss(branding)

// Classe aplicada no <html>
const themeClass = `theme-${branding.theme}`

// SEO resolvido com fallback do identity (sempre definido)
const seo = buildSeo(content.seo, identity)
// JSON-LD Schema.org (LocalBusiness/HairSalon) — rich snippets Google
const localBusinessJsonLd = JSON.stringify(
  buildLocalBusinessJsonLd(seo.canonicalUrl),
).replace(/</g, '\\u003c')
// Logo oficial (usada como favicon, apple-touch-icon e og:image fallback)
const LOGO_PATH = '/ruah/images/logo/logo.jpg'
const OG_IMAGE = seo.ogImage ?? LOGO_PATH

// Theme color do navegador mobile (cor accent dourada do Ruah)
const THEME_COLOR = '#D4AF37'

// URL única de Google Fonts (3 famílias)
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Playfair+Display:wght@400;600;700;900&' +
  'family=Montserrat:wght@400;500;600;700&' +
  'family=Lato:wght@300;400;700&' +
  'display=swap'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },

      // SEO básico — sempre definido via buildSeo()
      { title: seo.title },
      { name: 'description', content: seo.description },
      ...(seo.keywords.length > 0
        ? [{ name: 'keywords', content: seo.keywords.join(', ') }]
        : []),

      // Theme color (barra de navegador mobile)
      { name: 'theme-color', content: THEME_COLOR },

      // Open Graph completo
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: identity.name },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: identity.name },
      ...(seo.canonicalUrl
        ? [{ property: 'og:url', content: seo.canonicalUrl }]
        : []),

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:description', content: seo.description },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:image:alt', content: identity.name },
    ],
    links: [
      // Favicon + apple-touch-icon (usa a logo oficial)
      { rel: 'icon', type: 'image/jpeg', href: LOGO_PATH },
      { rel: 'apple-touch-icon', href: LOGO_PATH },

      // Canonical URL (se configurada)
      ...(seo.canonicalUrl
        ? [{ rel: 'canonical', href: seo.canonicalUrl }]
        : []),

      // Preconnect Google Fonts
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },

      // CSS do Ruah — ordem importa
      { rel: 'stylesheet', href: themeCss },
      { rel: 'stylesheet', href: baseCss },
      { rel: 'stylesheet', href: animationsCss },
      { rel: 'stylesheet', href: galleryCss },
      { rel: 'stylesheet', href: testimonialsCss },
		],
		scripts: [
		  {
			type: 'application/ld+json',
			children: localBusinessJsonLd,
		  },
		],
	  }),
	  component: RootComponent,
  errorComponent: RootErrorBoundary,
  notFoundComponent: RootNotFound,
})

function RootComponent() {
  return (
    <html lang="pt-BR" className={themeClass}>
      <head>
        <HeadContent />
        <style
          id="ruah-branding-vars"
          dangerouslySetInnerHTML={{ __html: brandingCss }}
        />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorBoundary({ error }: { error: Error }) {
  return (
    <html lang="pt-BR" className={themeClass}>
      <head>
        <HeadContent />
        <style
          id="ruah-branding-vars"
          dangerouslySetInnerHTML={{ __html: brandingCss }}
        />
      </head>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '32rem',
              padding: '2rem',
              borderRadius: 'var(--radius-card)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h1>Algo deu errado</h1>
            <p>
              Tente recarregar a página. Se o problema persistir, entre em
              contato com o suporte.
            </p>
            {import.meta.env.DEV && (
              <pre
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'var(--color-surface-dark)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                {error.message}
              </pre>
            )}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return (
    <html lang="pt-BR" className={themeClass}>
      <head>
        <HeadContent />
        <style
          id="ruah-branding-vars"
          dangerouslySetInnerHTML={{ __html: brandingCss }}
        />
      </head>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
            <p>Página não encontrada.</p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--color-accent)',
                color: 'var(--color-surface-dark)',
                borderRadius: 'var(--radius-button)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.875rem',
              }}
            >
              Voltar ao início
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}