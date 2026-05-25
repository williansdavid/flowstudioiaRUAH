import { useRouterState } from '@tanstack/react-router';

/**
 * useNavigationState
 *
 * Hook central de estado de navegacao do TanStack Router.
 *
 * Expoe um snapshot estavel do estado de transicao de rotas para ser
 * consumido por componentes de feedback (progress bar, overlay,
 * sidebar com spinner no item ativo, breadcrumbs, etc).
 *
 * Regras:
 * - SSR-safe: usa apenas selectors do useRouterState
 * - Sem efeitos colaterais
 * - Sem dependencias externas
 *
 * NOTA TECNICA (v1.170+):
 *  O TanStack Router removeu `pendingMatches` do RouterState publico
 *  (PRs #6676 e #6704 - refactor de signal-based reactivity).
 *  Caso seja necessario expor o destino da navegacao no futuro, usar
 *  `state.location.pathname` ou o hook `useLocation()`.
 *
 * @example
 *  const { isNavigating } = useNavigationState();
 *  if (isNavigating) { ... }
 */
export interface NavigationState {
  /** True quando o router esta carregando OU em transicao. Use isso na maioria dos casos. */
  isNavigating: boolean;
  /** True apenas durante isLoading (fetch de loaders). */
  isLoading: boolean;
  /** True apenas durante isTransitioning (React transition). */
  isTransitioning: boolean;
}

export function useNavigationState(): NavigationState {
  return useRouterState({
    select: (state) => {
      const isLoading = state.isLoading;
      const isTransitioning = state.isTransitioning;
      const isNavigating = isLoading || isTransitioning;

      return {
        isNavigating,
        isLoading,
        isTransitioning,
      };
    },
  });
}
