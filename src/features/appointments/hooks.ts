// src/features/appointments/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  updateAppointmentStatus,
  type UpdateAppointmentStatusInput,
} from './server/updateAppointmentStatus';
import {
  createAppointment,
  type CreateAppointmentInput,
} from './server/createAppointment';
import {
  updateAppointment,
  type UpdateAppointmentInput,
} from './server/updateAppointment';
import {
  deleteAppointment,
  type DeleteAppointmentInput,
} from './server/deleteAppointment';

const APPOINTMENTS_TODAY_KEY = ['appointments', 'today'] as const;

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
        queryKey: APPOINTMENTS_TODAY_KEY,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar o agendamento.');
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      createAppointment({ data: input }),
    onSuccess: async () => {
      toast.success('Agendamento criado.');
      await queryClient.invalidateQueries({
        queryKey: APPOINTMENTS_TODAY_KEY,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível criar o agendamento.');
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) =>
      updateAppointment({ data: input }),
    onSuccess: async () => {
      toast.success('Agendamento atualizado.');
      await queryClient.invalidateQueries({
        queryKey: APPOINTMENTS_TODAY_KEY,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar o agendamento.');
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteAppointmentInput) =>
      deleteAppointment({ data: input }),
    onSuccess: async () => {
      toast.success('Agendamento cancelado.');
      await queryClient.invalidateQueries({
        queryKey: APPOINTMENTS_TODAY_KEY,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível cancelar o agendamento.');
    },
  });
}
import {
  createQuickClient,
  type CreateQuickClientInput,
} from './server/createQuickClient';

export function useCreateQuickClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuickClientInput) =>
      createQuickClient({ data: input }),
    onSuccess: async () => {
      toast.success('Cliente cadastrado.');
      await queryClient.invalidateQueries({
        queryKey: ['appointments', 'clients'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível cadastrar o cliente.');
    },
  });
}
