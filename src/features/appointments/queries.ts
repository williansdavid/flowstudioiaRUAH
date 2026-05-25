import { queryOptions } from "@tanstack/react-query";
import { listAppointments } from "@/server/appointments/list-appointments";

/**
 * Query keys centralizadas para a feature "appointments".
 *
 * Padrao hierarquico:
 *  - appointmentsKeys.all     -> invalida TUDO da feature
 *  - appointmentsKeys.lists() -> invalida todas as listas
 *  - appointmentsKeys.list()  -> invalida a lista canonica
 */
export const appointmentsKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentsKeys.all, "list"] as const,
  list: () => [...appointmentsKeys.lists()] as const,
  details: () => [...appointmentsKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentsKeys.details(), id] as const,
};

/**
 * queryOptions para listar agendamentos visiveis ao usuario.
 *
 * @example SSR
 *  loader: ({ context }) =>
 *    context.queryClient.ensureQueryData(appointmentsListQuery())
 *
 * @example Client
 *  const { data } = useQuery(appointmentsListQuery())
 */
export const appointmentsListQuery = () =>
  queryOptions({
    queryKey: appointmentsKeys.list(),
    queryFn: () => listAppointments(),
    staleTime: 15_000, // 15s — agenda muda com frequencia
  });