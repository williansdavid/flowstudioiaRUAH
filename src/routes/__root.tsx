import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { getSession, type SessionUser } from '@/lib/auth/session';
import { studioConfig } from '@/config/studio.config';
import {
  buildBrandingTokens,
  brandingTokensToCss,
} from '@/lib/branding/applyBranding';
import { RouteProgressBar } from '@/components/feedback/RouteProgressBar';
import { NavigationOverlay } from '@/components/feedback/NavigationOverlay';
import appCss from '@/styles/globals.css?url';

export interface RouterContext {
  queryClient: QueryClient;
  user: SessionUser | null;
}

const brandingCss = brandingTokensToCss(
  buildBrandingTokens(studioConfig.branding),
);
const themeClass = `theme-${studioConfig.branding.theme}`;

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: studioConfig.seo.title },
      { name: 'description', content: studioConfig.seo.description },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: studioConfig.branding.faviconUrl },
      // Google Fonts — preconnect para performance
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      // Inter (UI) + Cormorant Garamond (display) — SSR-friendly
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap',
      },
    ],
  }),
  beforeLoad: async () => {
    try {
      const user = await getSession();
      return { user };
    } catch (err) {
      console.error('[__root] getSession falhou:', err);
      return { user: null };
    }
  },
  component: RootComponent,
  errorComponent: RootErrorBoundary,
  notFoundComponent: RootNotFound,
});

function RootComponent() {
  return (
    <html
      lang="pt-BR"
      className={themeClass}
      style={{ cssText: brandingCss } as React.CSSProperties}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <RouteProgressBar />
        <NavigationOverlay>
          <Outlet />
        </NavigationOverlay>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootErrorBoundary({ error }: { error: Error }) {
  return (
    <html
      lang="pt-BR"
      className={themeClass}
      style={{ cssText: brandingCss } as React.CSSProperties}
    >
      <head>
        <HeadContent />
        <title>{`Erro - ${studioConfig.name}`}</title>
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
          <div className="max-w-md rounded-lg bg-surface p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-fg">Algo deu errado</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Tente recarregar a pagina. Se o problema persistir, contate o suporte.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-4 overflow-auto rounded bg-surface-subtle p-3 text-xs text-fg">
                {error.message}
              </pre>
            )}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function RootNotFound() {
  return (
    <html
      lang="pt-BR"
      className={themeClass}
      style={{ cssText: brandingCss } as React.CSSProperties}
    >
      <head>
        <HeadContent />
        <title>{`Pagina nao encontrada - ${studioConfig.name}`}</title>
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-fg">404</h1>
            <p className="mt-2 text-sm text-fg-muted">Pagina nao encontrada.</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-600"
            >
              Voltar para o inicio
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
