// src/features/staff/hooks.ts

import {
  resendStaffInvite,
  type ResendStaffInviteInput,
  type ResendStaffInviteResult,
} from './server/resendStaffInvite';

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStaffWorkingHours } from './server/getStaffWorkingHours';
import { listStaff } from './server/listStaff';
import {
  updateStaffWorkingHours,
  type UpdateStaffWorkingHoursInput,
} from './server/updateStaffWorkingHours';
import { listTimeOff, type TimeOffItem } from './server/listTimeOff';
import {
  createTimeOff,
  type CreateTimeOffInput,
  type CreateTimeOffResult,
} from './server/createTimeOff';
import {
  updateTimeOff,
  type UpdateTimeOffInput,
  type UpdateTimeOffResult,
} from './server/updateTimeOff';
import {
  deleteTimeOff,
  type DeleteTimeOffResult,
} from './server/deleteTimeOff';

import {
  createStaff,
  type CreateStaffInput,
  type CreateStaffResult,
} from './server/createStaff';

// ===== query =====
export const staffTimeOffQuery = (staffId: string) =>
  queryOptions({
    queryKey: ['staff', staffId, 'time-off'],
    queryFn: () => listTimeOff({ data: { staffId } }),
  });

export function useStaffTimeOff(staffId: string) {
  return useQuery(staffTimeOffQuery(staffId));
}

// ===== create =====
export function useCreateTimeOff(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation<CreateTimeOffResult, Error, CreateTimeOffInput>({
    mutationFn: (input) => createTimeOff({ data: input }),
    onSuccess: (res) => {
      if (res.ok) {
        void queryClient.invalidateQueries({
          queryKey: ['staff', staffId, 'time-off'],
        });
        toast.success('Folga adicionada.');
      }
      // CONFLICT/FORBIDDEN: tratado na UI (não invalida, não toast genérico)
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar folga.'),
  });
}

// ===== update =====
export function useUpdateTimeOff(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation<UpdateTimeOffResult, Error, UpdateTimeOffInput>({
    mutationFn: (input) => updateTimeOff({ data: input }),
    onSuccess: (res) => {
      if (res.ok) {
        void queryClient.invalidateQueries({
          queryKey: ['staff', staffId, 'time-off'],
        });
        toast.success('Folga atualizada.');
      }
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar folga.'),
  });
}

// ===== delete =====
export function useDeleteTimeOff(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation<DeleteTimeOffResult, Error, { id: string }>({
    mutationFn: ({ id }) => deleteTimeOff({ data: { id } }),
    onSuccess: (res) => {
      if (res.ok) {
        void queryClient.invalidateQueries({
          queryKey: ['staff', staffId, 'time-off'],
        });
        toast.success('Folga removida.');
      } else {
        toast.error('Não foi possível remover esta folga.');
      }
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Falha ao remover folga.'),
  });
}

export type { TimeOffItem };

export const staffListQuery = () =>
  queryOptions({
    queryKey: ['staff', 'list'],
    queryFn: () => listStaff(),
  });

export function useStaffList() {
  return useQuery(staffListQuery());
}

export const staffWorkingHoursQuery = (staffId: string) =>
  queryOptions({
    queryKey: ['staff', staffId, 'working-hours'],
    queryFn: () => getStaffWorkingHours({ data: { staffId } }),
  });

export function useUpdateStaffWorkingHours(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStaffWorkingHoursInput) =>
      updateStaffWorkingHours({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['staff', staffId, 'working-hours'],
      });
      toast.success('Horários salvos com sucesso.');
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Falha ao salvar horários.',
      );
    },
  });
}
// ===== create staff =====
export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation<CreateStaffResult, Error, CreateStaffInput>({
    mutationFn: (input) => createStaff({ data: input }),
    onSuccess: (res) => {
      if (res.ok) {
        void queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
        toast.success('Profissional cadastrado.');
      }
      // FORBIDDEN / EMAIL_TAKEN / UNKNOWN: tratados na UI (StaffFormModal).
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : 'Falha ao cadastrar profissional.',
      ),
  });
}
// adicionar ao bloco de imports do createStaff:
import {
  updateStaff,
  type UpdateStaffInput,
  type UpdateStaffResult,
} from './server/updateStaff';
// ===== update staff =====
export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation<UpdateStaffResult, Error, UpdateStaffInput>({
    mutationFn: (input) => updateStaff({ data: input }),
    onSuccess: (res) => {
      if (res.ok) {
        void queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
        toast.success('Profissional atualizado.');
      }
      // FORBIDDEN / NOT_FOUND / UNKNOWN: tratados na UI (StaffFormModal).
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : 'Falha ao atualizar profissional.',
      ),
  });
}
// ===== resend invite =====
export function useResendStaffInvite() {
  return useMutation<ResendStaffInviteResult, Error, ResendStaffInviteInput>({
    mutationFn: (input) => resendStaffInvite({ data: input }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success('Convite reenviado.');
      } else if (res.reason === 'ALREADY_ACTIVE') {
        toast.info('Este profissional já ativou o acesso.');
      } else if (res.reason === 'FORBIDDEN') {
        toast.error('Você não tem permissão para reenviar convites.');
      } else {
        toast.error(res.message || 'Falha ao reenviar convite.');
      }
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : 'Falha ao reenviar convite.',
      ),
  });
}
