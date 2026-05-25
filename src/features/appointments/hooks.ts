import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createAppointment } from "@/server/appointments/create-appointment";

import { appointmentsKeys, appointmentsListQuery } from "./queries";
import type {
  AdminAppointmentItem,
  CreateAppointmentInput,
} from "./types";

// ============================================
// READ
// ============================================

/**
 * Hook para consumir a lista de agendamentos.
 * Aproveita SSR prefetch via loader da rota.
 *
 * @example
 *  const { data, isLoading, error } = useAppointments();
 */
export function useAppointments() {
  return useQuery(appointmentsListQuery());
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para criar novo agendamento.
 *
 * - Invalida lista apos sucesso.
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
