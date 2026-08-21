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
      phone: string;
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
  // businessHours REMOVIDO — o server fn não usa mais
}

export function useAvailableSlots({
  staffId,
  serviceId,
  startDate,
  days = 14,
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
        },
      }),
    enabled: Boolean(staffId && serviceId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export { useCreateClientAppointment } from './hooks/useCreateClientAppointment';

// ============================================================
// HOOKS MULTI-SERVIÇO — criação e edição via RPC
// (create_appointment_multi_service / update_appointment_multi_service)
// ============================================================
import type { AppointmentStatus } from './types';
import { createAppointmentMulti, updateAppointmentMulti } from './server/createAppointmentMulti';

export interface MultiServiceItemInput {
  serviceId: string;
  quantity: number;
}

export interface CreateAppointmentMultiInput {
  clientId: string;
  staffId: string;
  startsAt: string;
  services: MultiServiceItemInput[];
  notes?: string | null;
  status?: AppointmentStatus;
  paymentMethodId?: string | null;
}

export interface UpdateAppointmentMultiInput {
  appointmentId: string;
  clientId: string;
  staffId: string;
  startsAt: string;
  services: MultiServiceItemInput[];
  notes?: string | null;
  status?: AppointmentStatus;
}

// Criação multi — chama a RPC create_appointment_multi_service
export function useCreateAppointmentMulti() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAppointmentMultiInput) => {
      const res = await createAppointmentMulti({ data: input });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dayTimeOff'] });
    },
  });
}

// Edição multi — chama a RPC update_appointment_multi_service
export function useUpdateAppointmentMulti() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAppointmentMultiInput) => {
      const res = await updateAppointmentMulti({ data: input });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dayTimeOff'] });
    },
  });
}