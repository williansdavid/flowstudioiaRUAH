import { queryOptions } from '@tanstack/react-query';
import { listServices } from '@/server/services/list-services';

/**
 * Query keys centralizadas para a feature "services".
 *
 * Padrão hierárquico:
 *  - servicesKeys.all        → invalida TUDO da feature
 *  - servicesKeys.lists()    → invalida todas as listas
 *  - servicesKeys.list()     → invalida a lista canônica
 */
export const servicesKeys = {
  all: ['services'] as const,
  lists: () => [...servicesKeys.all, 'list'] as const,
  list: () => [...servicesKeys.lists()] as const,
  details: () => [...servicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...servicesKeys.details(), id] as const,
};

/**
 * queryOptions para listar TODOS os serviços (admin).
 *
 * @example SSR
 *  loader: ({ context }) => context.queryClient.ensureQueryData(servicesListQuery())
 *
 * @example Client
 *  const { data } = useQuery(servicesListQuery())
 */
export const servicesListQuery = () =>
  queryOptions({
    queryKey: servicesKeys.list(),
    queryFn: () => listServices(),
    staleTime: 30_000, // 30s — serviços mudam pouco
  });
