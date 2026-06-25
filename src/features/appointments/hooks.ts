// src/features/appointments/hooks.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
import {
  createQuickClient,
  type CreateQuickClientInput,
} from './server/createQuickClient';
import {
  getAvailableSlots,
  type GetAvailableSlotsInput,
  type DaySlots,
} from './server/getAvailableSlots';

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
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
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

export function useCreateQuickClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      phone: string; // Agora é obrigatório
      email?: string;
      birthDay?: number;
      birthMonth?: number;
    }) => {
      return createQuickClient({ data });
    },
    onSuccess: () => {
      toast.success('Cliente cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao cadastrar cliente');
    },
  });
}
interface UseAvailableSlotsParams {
  staffId: string | null;
  serviceId: string | null;
  startDate: string; // 'YYYY-MM-DD'
  days?: number;
  businessHours: GetAvailableSlotsInput['businessHours'];
}

export function useAvailableSlots({
  staffId,
  serviceId,
  startDate,
  days = 14,
  businessHours,
}: UseAvailableSlotsParams) {
  return useQuery<DaySlots[], Error>({
    queryKey: [
      'appointments',
      'slots',
      staffId,
      serviceId,
      startDate,
      days,
    ] as const,
    queryFn: () =>
      getAvailableSlots({
        data: {
          staffId: staffId!,
          serviceId: serviceId!,
          startDate,
          days,
          businessHours,
        },
      }),
    enabled: Boolean(staffId && serviceId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
