// src/features/products/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listProducts } from './server/listProducts';  // ← local, não do sales
import { createProduct, type CreateProductInput } from './server/createProduct';
import { updateProduct, type UpdateProductInput } from './server/updateProduct';
import {
  deactivateProduct,
  type DeactivateProductInput,
} from './server/deactivateProduct';
import type { ProductItem } from './types';

const PRODUCTS_LIST_KEY = ['products', 'list'] as const;

export function useProducts() {
  return useQuery<ProductItem[], Error>({
    queryKey: PRODUCTS_LIST_KEY,
    queryFn: () => listProducts(),
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct({ data: input }),
    onSuccess: async () => {
      toast.success('Produto criado.');
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível criar o produto.');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct({ data: input }),
    onSuccess: async () => {
      toast.success('Produto atualizado.');
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar o produto.');
    },
  });
}

export function useToggleProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeactivateProductInput) =>
      deactivateProduct({ data: input }),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.isActive ? 'Produto reativado.' : 'Produto desativado.',
      );
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível alterar o status.');
    },
  });
}