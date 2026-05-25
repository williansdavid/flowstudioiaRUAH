import { queryOptions } from '@tanstack/react-query';
import { listClients } from '@/server/clients/list-clients';

/**
 * Query keys centralizadas para a feature "clients".
 *
 * Padrão hierárquico:
 *  - clientsKeys.all        → invalida TUDO da feature
 *  - clientsKeys.lists()    → invalida todas as listas
 *  - clientsKeys.list()     → invalida a lista canônica
 */
export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: () => [...clientsKeys.lists()] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
};

/**
 * queryOptions para listar TODOS os clientes (admin).
 *
 * @example SSR
 *  loader: ({ context }) => context.queryClient.ensureQueryData(clientsListQuery())
 *
 * @example Client
 *  const { data } = useQuery(clientsListQuery())
 */
export const clientsListQuery = () =>
  queryOptions({
    queryKey: clientsKeys.list(),
    queryFn: () => listClients(),
    staleTime: 30_000, // 30s — clientes mudam pouco entre navegações
  });
