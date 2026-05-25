import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createService } from '@/server/services/create-service';
import { updateService } from '@/server/services/update-service';
import { toggleServiceActive } from '@/server/services/toggle-service-active';

import { servicesKeys, servicesListQuery } from './queries';
import type {
  AdminServiceItem,
  CreateServiceInput,
  UpdateServiceInput,
} from './types';

// ============================================
// READ
// ============================================

/**
 * Hook para listar todos os serviços (admin).
 *
 * @example
 *  const { data, isLoading, error } = useServices();
 */
export function useServices() {
  return useQuery(servicesListQuery());
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para criar novo serviço.
 *
 * - Invalida lista após sucesso.
 * - Toasts automáticos.
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation<AdminServiceItem, Error, CreateServiceInput>({
    mutationFn: (input) => createService({ data: input }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success('Serviço criado', {
        description: `"${created.name}" foi adicionado.`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar serviço', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar um serviço existente.
 *
 * - Aceita patch parcial.
 * - Invalida lista após sucesso.
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation<AdminServiceItem, Error, UpdateServiceInput>({
    mutationFn: (input) => updateService({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success('Serviço atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar serviço', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para ativar/desativar serviço (soft toggle).
 *
 * - Server function retorna shape enxuto { id, isActive }.
 * - Optimistic update: atualiza isActive no cache antes da resposta.
 * - Em caso de erro, rollback para estado anterior.
 */
export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; isActive: boolean },
    Error,
    { id: string; isActive: boolean },
    { previousList: AdminServiceItem[] | undefined }
  >({
    mutationFn: (input) => toggleServiceActive({ data: input }),

    // ── Optimistic update ──
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: servicesKeys.lists() });

      const previousList = queryClient.getQueryData<AdminServiceItem[]>(
        servicesKeys.list(),
      );

      queryClient.setQueryData<AdminServiceItem[]>(
        servicesKeys.list(),
        (old) => {
          if (!old) return old;
          return old.map((s) => (s.id === id ? { ...s, isActive } : s));
        },
      );

      return { previousList };
    },

    onError: (error, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(servicesKeys.list(), context.previousList);
      }
      toast.error('Erro ao atualizar status', {
        description: error.message,
      });
    },

    onSuccess: (_result, { isActive }) => {
      toast.success(isActive ? 'Serviço reativado' : 'Serviço desativado');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
}
