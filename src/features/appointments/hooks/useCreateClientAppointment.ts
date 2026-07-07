import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createClientAppointment,
  type CreateClientAppointmentInput,
} from '../server/createClientAppointment';

export function useCreateClientAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClientAppointmentInput) =>
      createClientAppointment({ data: input }),
    onSuccess: async () => {
      toast.success('Agendamento realizado com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível realizar o agendamento.');
    },
  });
}