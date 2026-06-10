// src/features/appointments/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  updateAppointmentStatus,
  type UpdateAppointmentStatusInput,
} from './server/updateAppointmentStatus';

const SUCCESS_MESSAGE: Record<UpdateAppointmentStatusInput['status'], string> = {
  pending: 'Agendamento reaberto.',
  confirmed: 'Agendamento confirmado.',
  completed: 'Agendamento concluído.',
  cancelled: 'Agendamento cancelado.',
  no_show: 'Marcado como não compareceu.',
};

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAppointmentStatusInput) =>
      updateAppointmentStatus({ data: input }),
    onSuccess: async (_data, variables) => {
      toast.success(SUCCESS_MESSAGE[variables.status]);
      await queryClient.invalidateQueries({
        queryKey: ['appointments', 'today'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar o agendamento.');
    },
  });
}
