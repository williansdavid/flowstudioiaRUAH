import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createTeamMember } from '@/server/team/create-staff';
import { updateTeamMember } from '@/server/team/update-staff';
import { toggleTeamMemberActive } from '@/server/team/toggle-staff-active';

import { teamKeys, teamListQuery } from './queries';
import type {
  CreateStaffInput,
  CreateStaffResult,
  UpdateStaffInput,
} from './types';

// ============================================
// READ
// ============================================

/**
 * Hook para listar todos os membros da equipe.
 *
 * @example
 *  const { data, isLoading, error } = useTeamMembers();
 */
export function useTeamMembers() {
  return useQuery(teamListQuery());
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para criar novo membro (admin ou staff).
 *
 * - Invalida lista após sucesso.
 * - Retorna senha temporária no `data` da mutação (mostrar pro admin copiar).
 * - Toasts automáticos.
 *
 * @example
 *  const mutation = useCreateTeamMember();
 *  mutation.mutate({ data: { email, fullName, role, ... } }, {
 *    onSuccess: (result) => console.log('Temp pass:', result.tempPassword)
 *  });
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation<CreateStaffResult, Error, CreateStaffInput>({
    mutationFn: (input) => createTeamMember({ data: input }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success('Membro criado com sucesso', {
        description: `Senha temporária gerada para ${result.email}`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar membro', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar dados de um membro (profile + staff).
 *
 * - Aceita updates parciais.
 * - Invalida lista após sucesso.
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation<{ success: true }, Error, UpdateStaffInput>({
    mutationFn: (input) => updateTeamMember({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success('Membro atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar membro', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para ativar/desativar membro (soft-delete).
 *
 * Faz optimistic update: atualiza a UI imediatamente e reverte em caso de erro.
 */
export function useToggleTeamMemberActive() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: true },
    Error,
    { profileId: string; isActive: boolean },
    { previousList: unknown }
  >({
    mutationFn: (input) => toggleTeamMemberActive({ data: input }),

    // ── Optimistic update ──
    onMutate: async ({ profileId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.lists() });

      const previousList = queryClient.getQueryData(teamKeys.list());

      queryClient.setQueryData<
        Array<{ profileId: string; isActive: boolean }>
      >(teamKeys.list(), (old) => {
        if (!old) return old;
        return old.map((m) =>
          m.profileId === profileId ? { ...m, isActive } : m,
        );
      });

      return { previousList };
    },

    onError: (error, _vars, context) => {
      // Reverte
      if (context?.previousList) {
        queryClient.setQueryData(teamKeys.list(), context.previousList);
      }
      toast.error('Erro ao atualizar status', {
        description: error.message,
      });
    },

    onSuccess: (_data, { isActive }) => {
      toast.success(isActive ? 'Membro reativado' : 'Membro desativado');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}
