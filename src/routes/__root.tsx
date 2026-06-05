/**
 * __root.tsx — Root Route do TanStack React Start
 * ----------------------------------------------------------------
 * Responsabilidades:
 *   1. Consumir dados/assets do studio ativo via @/config/active-studio
 *   2. Injetar CSS variables no <head> via SSR (zero FOUC)
 *   3. Aplicar a classe de tema no <html> (.theme-dark)
 *   4. Carregar fontes Google via preconnect + link
 *   5. Importar os CSS do studio (styleHrefs)
 *   6. SEO completo: Open Graph + Twitter Card + favicon + theme-color
 *   7. Serializar JSON-LD (LocalBusiness/HairSalon) para <script>
 *   8. Renderizar <Outlet />
 *   9. Tipar RouterContext global
 *
 * FONTE DA VERDADE ÚNICA: src/config/active-studio (→ src/sites/<studio>)
 * O núcleo NUNCA importa direto de src/sites/.
 * ----------------------------------------------------------------
 */
import { Toaster } from 'sonner'
import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { GlobalLoadingIndicator } from '@/components/feedback'
import '@/styles/app.css'

import {
  branding,
  content,
  identity,
  brandingCss,
  themeClass,
  seo,
  buildLocalBusinessJsonLd,
  styleHrefs,
} from '@/config/active-studio'

// ============================================================
// Router Context
// ============================================================
export interface RouterContext {
  queryClient: QueryClient
}

// JSON-LD Schema.org (LocalBusiness/HairSalon) — rich snippets Google.
// Serialização é responsabilidade do núcleo; o studio provê a função pura.
const localBusinessJsonLd = JSON.stringify(
  buildLocalBusinessJsonLd(seo.canonicalUrl),
).replace(/</g, '\\u003c')

// Logo oficial (consome branding via switch — fonte única da verdade)
const LOGO_URL = branding.logo.light
const LOGO_ALT = branding.logo.alt
const OG_IMAGE = seo.ogImage ?? LOGO_URL

// Theme color do navegador mobile (cor accent do studio)
const THEME_COLOR = branding.colors.accent

// URL única de Google Fonts (3 famílias)
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Playfair+Display:wght@400;600;700;900&' +
  'family=Montserrat:wght@400;500;600;700&' +
  'family=Lato:wght@300;400;700&' +
  'display=swap'

// __root.tsx — adicionar após os imports existentes
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    title?: string;
  }
}


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
      { property: 'og:image:alt', content: LOGO_ALT },
      ...(seo.canonicalUrl
        ? [{ property: 'og:url', content: seo.canonicalUrl }]
        : []),

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:description', content: seo.description },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:image:alt', content: LOGO_ALT },
    ],
    links: [
      // Favicon + apple-touch-icon (consome branding.logo.light)
      { rel: 'icon', type: 'image/jpeg', href: LOGO_URL },
      { rel: 'apple-touch-icon', href: LOGO_URL },

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

      // CSS do studio — ordem importa (vem de active-studio.styleHrefs)
      ...styleHrefs.map((href) => ({ rel: 'stylesheet', href })),
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
          id="studio-branding-vars"
          dangerouslySetInnerHTML={{ __html: brandingCss }}
        />
      </head>
      <body>
        <GlobalLoadingIndicator />
        <Outlet />
        <Toaster
          theme="dark"
          position="top-center"
          richColors
          closeButton
        />
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
          id="studio-branding-vars"
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
          id="studio-branding-vars"
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
