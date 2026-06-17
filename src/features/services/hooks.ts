// src/features/services/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listServices } from './server/listServices';
import { createService, type CreateServiceInput } from './server/createService';
import { updateService, type UpdateServiceInput } from './server/updateService';
import {
  deactivateService,
  type DeactivateServiceInput,
} from './server/deactivateService';
import type { ServiceItem } from './types';

const SERVICES_LIST_KEY = ['services', 'list'] as const;

export function useServices() {
  return useQuery<ServiceItem[], Error>({
    queryKey: SERVICES_LIST_KEY,
    queryFn: () => listServices(),
    staleTime: 30_000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService({ data: input }),
    onSuccess: async () => {
      toast.success('Serviço criado.');
      await queryClient.invalidateQueries({ queryKey: SERVICES_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível criar o serviço.');
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateServiceInput) => updateService({ data: input }),
    onSuccess: async () => {
      toast.success('Serviço atualizado.');
      await queryClient.invalidateQueries({ queryKey: SERVICES_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar o serviço.');
    },
  });
}

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeactivateServiceInput) =>
      deactivateService({ data: input }),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.isActive ? 'Serviço reativado.' : 'Serviço desativado.',
      );
      await queryClient.invalidateQueries({ queryKey: SERVICES_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível alterar o status.');
    },
  });
}
