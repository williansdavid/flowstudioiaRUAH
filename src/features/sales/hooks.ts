// src/features/sales/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { listProducts } from './server/listProducts';
import { listPaymentMethods } from './server/listPaymentMethods';
import { createSale } from './server/createSale';
import { getAppointmentSaleData } from './server/getAppointmentSaleData';
import type { CreateSaleInput } from './server/createSale';
import { listServicesForSale } from './server/listServicesForSale';
import { useCallback } from 'react';
import type { CartItem, SplitPayment } from './types';


export const salesKeys = {
  products: ['sales', 'products'] as const,
  services: ['sales', 'services'] as const,
  paymentMethods: ['sales', 'payment-methods'] as const,
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

export function useAppointmentSaleData(appointmentId: string | undefined) {
  return useQuery({
    queryKey: salesKeys.appointmentData(appointmentId ?? ''),
    queryFn: () => getAppointmentSaleData({ data: { appointmentId: appointmentId! } }),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinalizeSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Venda finalizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao finalizar venda.');
    },
  });
}

// ── PDV Cart — estado global em memória via React Query ──────────
export const PDV_CART_KEY = ['pdv', 'cart'] as const;

export interface PdvCartState {
  items: CartItem[];
  payments: SplitPayment[];
}

export function usePdvCart() {
  const queryClient = useQueryClient();

  const cart = useQuery<PdvCartState>({
    queryKey: PDV_CART_KEY,
    initialData: { items: [], payments: [] },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const setCart = useCallback(
    (updater: PdvCartState | ((prev: PdvCartState) => PdvCartState)) => {
      queryClient.setQueryData<PdvCartState>(PDV_CART_KEY, (prev) => {
        const base = prev ?? { items: [], payments: [] };
        return typeof updater === 'function' ? updater(base) : updater;
      });
    },
    [queryClient],
  );

  const clearCart = useCallback(() => {
    queryClient.setQueryData<PdvCartState>(PDV_CART_KEY, { items: [], payments: [] });
  }, [queryClient]);

  return { cart: cart.data!, setCart, clearCart };
}
// ── PDV Cart — bridge entre Zustand e React Query ─────────────────
export { usePdvStore, persistPdvState, loadPdvState, clearPdvState } from './stores/pdv-store';
