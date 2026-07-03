/**
 * __root.tsx — Root Route do TanStack React Start
 * ----------------------------------------------------------------
 * Responsabilidade: SHELL NEUTRO ABSOLUTO do app.
 *
 * O root NÃO conhece studio/site:
 *   - não importa @/config/active-studio
 *   - não injeta SEO/OG/Twitter do site
 *   - não injeta Google Fonts do site
 *   - não injeta styleHrefs do site
 *   - não injeta JSON-LD do site
 *   - não injeta brandingCss do site
 *   - não aplica classe de tema de SITE (o <body> usa systemThemeClass p/ boundaries globais)
 *
 * Cada zona de rota é dona do seu tema:
 *   - /           -> rota index.tsx injeta brandingCss do site + themeClass
  *   - /login etc  -> _auth.tsx aplica systemThemeClass
 *   - /admin      -> _authed.tsx aplica systemThemeClass
 *
 * Boundaries globais usam .theme-system com vars do sistema.
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

import { GlobalLoadingIndicator } from '@/features/utils/feedback'
import { systemThemeCssHref, systemBrandingCss, systemThemeClass } from '@/lib/core/system'
import '@/styles/app.css'

export interface RouterContext {
  queryClient: QueryClient
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    title?: string
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'FlowStudio' },
    ],
    links: [{ rel: 'stylesheet', href: systemThemeCssHref }],
  }),
  component: RootComponent,
  errorComponent: RootErrorBoundary,
  notFoundComponent: RootNotFound,
})

function SystemThemeVars() {
  return (
    <style
      id="system-branding-vars"
      dangerouslySetInnerHTML={{ __html: systemBrandingCss }}
    />
  )
}

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <SystemThemeVars />
      </head>
      <body className={systemThemeClass}>
        <GlobalLoadingIndicator />
        <Outlet />
        <Toaster theme="dark" position="top-center" richColors closeButton />
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorBoundary({ error }: { error: Error }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <SystemThemeVars />
      </head>
      <body>
        <div
          className={systemThemeClass}
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
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <SystemThemeVars />
      </head>
      <body>
        <div
          className={systemThemeClass}
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
