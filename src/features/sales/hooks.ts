// src/features/sales/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { listProducts } from './server/listProducts';
import { listPaymentMethods } from './server/listPaymentMethods';
import { getSaleDraft } from './server/getSaleDraft';
import { createSaleDraft } from './server/createSaleDraft';
import { createSale } from './server/createSale';
import { getAppointmentSaleData } from './server/getAppointmentSaleData';
import type { CreateSaleDraftInput } from './server/createSaleDraft';
import { deleteSaleDraft } from './server/deleteSaleDraft';
import { listServicesForSale } from './server/listServicesForSale';

export const salesKeys = {
  products: ['sales', 'products'] as const,
  services: ['sales', 'services'] as const,  // <-- adicionar
  paymentMethods: ['sales', 'payment-methods'] as const,
  draft: ['sales', 'draft'] as const,
  appointmentData: (appointmentId: string) => ['sales', 'appointment', appointmentId] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: salesKeys.products,
    queryFn: () => listProducts(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useServicesForSale() {
  return useQuery({
    queryKey: salesKeys.services,
    queryFn: () => listServicesForSale(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: salesKeys.paymentMethods,
    queryFn: () => listPaymentMethods(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaleDraft() {
  return useQuery({
    queryKey: salesKeys.draft,
    queryFn: () => getSaleDraft(),
    staleTime: 0,
    retry: false,
  });
}

export function useAppointmentSaleData(appointmentId: string | undefined) {
  return useQuery({
    queryKey: salesKeys.appointmentData(appointmentId ?? ''),
    queryFn: () => getAppointmentSaleData({ data: { appointmentId: appointmentId! } }),  // <-- corrigido
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSaleDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleDraftInput) => createSaleDraft({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.draft });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar rascunho da venda.');
    },
  });
}

export function useFinalizeSale() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: { saleId: string; payments: Array<{ paymentMethodId: string; amount: number }> }) =>
      createSale({ data: input }),
    onSuccess: () => {
      // Hard refresh completo — limpa TUDO
      queryClient.invalidateQueries();
      toast.success('Venda finalizada com sucesso!');
      router.invalidate().then(() => {
        router.navigate({ to: '/admin' });
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao finalizar venda.');
    },
  });
}


import { updateSaleDraft } from './server/updateSaleDraft';
import type { UpdateSaleDraftInput } from './server/updateSaleDraft';

export function useUpdateSaleDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSaleDraftInput) => updateSaleDraft({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.draft });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar rascunho.');
    },
  });
}

export function useDeleteSaleDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { saleId: string }) => deleteSaleDraft({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.draft });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover rascunho.');
    },
  });
}