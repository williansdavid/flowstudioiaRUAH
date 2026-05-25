import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createClient } from '@/server/clients/create-client';
import { updateClient } from '@/server/clients/update-client';

import { clientsKeys, clientsListQuery } from './queries';
import type {
  AdminClientItem,
  CreateClientInput,
  UpdateClientInput,
} from './types';

// ============================================
// READ
// ============================================

/**
 * Hook para listar todos os clientes (admin).
 *
 * @example
 *  const { data, isLoading, error } = useClients();
 */
export function useClients() {
  return useQuery(clientsListQuery());
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para criar novo cliente walk-in (sem profile).
 *
 * - Invalida lista após sucesso.
 * - Toasts automáticos.
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation<AdminClientItem, Error, CreateClientInput>({
    mutationFn: (input) => createClient({ data: input }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      toast.success('Cliente criado', {
        description: `"${created.displayName}" foi adicionado.`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar cliente', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar um cliente existente.
 *
 * - Aceita patch parcial.
 * - Invalida lista após sucesso.
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation<AdminClientItem, Error, UpdateClientInput>({
    mutationFn: (input) => updateClient({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      toast.success('Cliente atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cliente', {
        description: error.message,
      });
    },
  });
}
