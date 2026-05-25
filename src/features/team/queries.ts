import { queryOptions } from '@tanstack/react-query';
import { listTeamMembers } from '@/server/team/list-staff';

/**
 * Query keys centralizadas para a feature "team".
 *
 * Padrão hierárquico recomendado pelo TanStack Query:
 *  - teamKeys.all        → invalida TUDO da feature
 *  - teamKeys.lists()    → invalida todas as listas
 *  - teamKeys.list(...)  → invalida uma lista específica
 *
 * Uso:
 *  queryClient.invalidateQueries({ queryKey: teamKeys.all });
 */
export const teamKeys = {
  all: ['team'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: () => [...teamKeys.lists()] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * queryOptions para listar membros da equipe.
 *
 * Funciona em 3 cenários:
 *  1. SSR loader → router.preloadRoute / queryClient.ensureQueryData
 *  2. useQuery (componente client-side)
 *  3. useSuspenseQuery (componente que suspende durante fetch)
 *
 * @example SSR
 *  loader: ({ context }) => context.queryClient.ensureQueryData(teamListQuery())
 *
 * @example Client
 *  const { data } = useQuery(teamListQuery())
 */
export const teamListQuery = () =>
  queryOptions({
    queryKey: teamKeys.list(),
    queryFn: () => listTeamMembers(),
    staleTime: 30_000, // 30s — equipe muda pouco; evita refetch agressivo
  });
