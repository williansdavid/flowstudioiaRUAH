import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

import { createAppointment } from "@/server/appointments/create-appointment";
import { getDefaultListRange } from "@/lib/date";

import { appointmentsKeys, appointmentsListQuery } from "./queries";
import type {
  AdminAppointmentItem,
  CreateAppointmentInput,
  ListAppointmentsInput,
} from "./types";

// ============================================
// READ
// ============================================

/**
 * Hook para consumir a lista de agendamentos.
 * Aproveita SSR prefetch via loader da rota.
 *
 * @param params - range opcional. Se omitido, usa default "proximos 30 dias".
 *
 * @example Default (proximos 30 dias)
 *  const { data, isLoading } = useAppointments();
 *
 * @example Calendario (dia especifico)
 *  const range = useMemo(() => getDayRange(date), [date]);
 *  const { data, isLoading } = useAppointments(range);
 */
export function useAppointments(params?: ListAppointmentsInput) {
  // Estabiliza o range default pra nao recriar a cada render
  const stableParams = useMemo<ListAppointmentsInput>(
    () => params ?? getDefaultListRange(),
    // Quando params e fornecido, ele controla a identidade
    // Quando params e undefined, calculamos uma unica vez por mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params?.from, params?.to, params?.staffId],
  );

  return useQuery(appointmentsListQuery(stableParams));
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para criar novo agendamento.
 *
 * - Invalida TODAS as listas (qualquer range) apos sucesso.
 * - Toasts automaticos (sucesso + erro).
 * - endsAt e price sao resolvidos server-side a partir do servico.
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AdminAppointmentItem, Error, CreateAppointmentInput>({
    mutationFn: (input) => createAppointment({ data: input }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.lists() });
      toast.success("Agendamento criado", {
        description: `${created.clientName} - ${created.serviceName}`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento", {
        description: error.message,
      });
    },
  });
}
