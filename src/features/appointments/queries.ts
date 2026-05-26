import { queryOptions } from "@tanstack/react-query";
import { listAppointments } from "@/server/appointments/list-appointments";
import { getDefaultListRange } from "@/lib/date";
import type { ListAppointmentsInput } from "./types";

/**
 * Query keys centralizadas para a feature "appointments".
 *
 * Padrao hierarquico (versionado por params do range):
 *  - appointmentsKeys.all              -> invalida TUDO da feature
 *  - appointmentsKeys.lists()          -> invalida TODAS as listas (qualquer range)
 *  - appointmentsKeys.list(params)     -> invalida lista de um range especifico
 *  - appointmentsKeys.detail(id)       -> invalida um agendamento especifico
 *
 * IMPORTANTE: ao invalidar apos mutation, use appointmentsKeys.lists()
 * (sem params) pra refazer TODAS as listas em cache, independente do range.
 */
export const appointmentsKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentsKeys.all, "list"] as const,
  list: (params: ListAppointmentsInput) =>
    [...appointmentsKeys.lists(), params] as const,
  details: () => [...appointmentsKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentsKeys.details(), id] as const,
};

/**
 * queryOptions para listar agendamentos no range fornecido.
 *
 * @param params - range obrigatorio { from, to, staffId? }
 *
 * @example SSR
 *  loader: ({ context }) =>
 *    context.queryClient.ensureQueryData(
 *      appointmentsListQuery(getDefaultListRange())
 *    )
 *
 * @example Client
 *  const range = useMemo(() => getDayRange(selectedDate), [selectedDate]);
 *  const { data } = useQuery(appointmentsListQuery(range));
 */
export const appointmentsListQuery = (params: ListAppointmentsInput) =>
  queryOptions({
    queryKey: appointmentsKeys.list(params),
    queryFn: () => listAppointments({ data: params }),
    staleTime: 15_000, // 15s — agenda muda com frequencia
  });

/**
 * Reexport util pra callers que so querem "proximos 30 dias".
 */
export { getDefaultListRange };
