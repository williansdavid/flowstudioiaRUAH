import { useRouteContext } from '@tanstack/react-router';
import type { SessionUser } from '@/lib/auth/session';

/**
 * Hook principal de autenticação.
 * Retorna o usuário da sessão atual (ou null se não autenticado).
 *
 * O user vem do context do root route, populado no SSR via beforeLoad.
 * Sempre disponível em qualquer componente filho do root.
 */
export function useUser(): SessionUser | null {
  const { user } = useRouteContext({ from: '__root__' });
  return user;
}

/**
 * Helper booleano para checagens rápidas em componentes.
 *
 * @example
 * const isAuth = useIsAuthenticated();
 * {isAuth && <AdminMenu />}
 */
export function useIsAuthenticated(): boolean {
  return useUser() !== null;
}

/**
 * Hook para rotas/componentes que EXIGEM usuário autenticado.
 * Lança erro se chamado sem user — deve ser usado apenas dentro de
 * rotas protegidas (após guard de autenticação no beforeLoad da rota).
 *
 * @example
 * // Em /admin/dashboard.tsx (rota já protegida)
 * const user = useRequireUser();
 * // user é SessionUser garantido, não null
 */
export function useRequireUser(): SessionUser {
  const user = useUser();
  if (!user) {
    throw new Error(
      '[useRequireUser] Chamado fora de rota protegida. ' +
      'Adicione guard de autenticação no beforeLoad da rota.'
    );
  }
  return user;
}
