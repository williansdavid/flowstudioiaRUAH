import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createAppQueryClient } from '@/lib/query/client';
import { routeTree } from './routeTree.gen';

/**
 * ============================================
 * Router factory — TanStack Start
 * ============================================
 *
 * Contrato do framework:
 *  - O TanStack Start importa este arquivo e chama `getRouter()` durante SSR.
 *  - NÃO renomear `getRouter` — é parte do contrato do plugin Vite.
 *
 * Integração React Query (oficial):
 *  - Usa @tanstack/react-router-ssr-query
 *  - Faz dehydration/hydration automático entre server e client
 *  - Envolve a app com QueryClientProvider automaticamente (wrapQueryClient: true por padrão)
 *  - Suporta streaming de queries durante SSR
 *
 * IMPORTANTE: um QueryClient FRESCO por request (essencial em SSR para
 * evitar vazamento de cache entre usuários diferentes).
 */
export function getRouter() {
  const queryClient = createAppQueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0, // queries gerenciam staleness; router não cacheia loader
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // wrapQueryClient: true (default) — instala QueryClientProvider automaticamente
    // handleRedirects: true (default) — trata redirect() lançado de queries/mutations
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
