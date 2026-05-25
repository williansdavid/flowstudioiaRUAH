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

// Pre-calcula o branding 1x no boot do server (nao muda em runtime)
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
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-neutral-900">
              Algo deu errado
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Tente recarregar a pagina. Se o problema persistir, contate o suporte.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-4 overflow-auto rounded bg-neutral-100 p-3 text-xs text-neutral-800">
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
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-neutral-900">404</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Pagina nao encontrada.
            </p>
            <a
              href="/"
              className="mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
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
