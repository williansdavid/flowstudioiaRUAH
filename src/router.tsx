import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

/**
 * Factory do router exigida pelo TanStack Start (>= 1.168).
 * O framework importa este arquivo e chama `getRouter()` durante SSR.
 *
 * NÃO renomear — o nome `getRouter` é parte do contrato do framework.
 */
export function getRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, user: null },
    defaultPreload: 'intent',
    scrollRestoration: true,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
