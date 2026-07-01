// src/features/products/server/createProduct.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ProductItem } from '../types';

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto.'),
  price: z.number().nonnegative('Preço inválido.'),
  department: z.string().trim().nullable(),
  isActive: z.boolean(),
  commissionRate: z.number().min(0).max(100).default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createProductSchema.parse(data))
  .handler(async ({ data }): Promise<ProductItem> => {
    const supabase = createSupabaseServer();
    const { data: row, error } = await supabase
      .from('products')
      .insert({
        name: data.name,
        price: data.price,
        department: data.department,
        is_active: data.isActive,
        commission_rate: data.commissionRate,
      })
      .select('id, name, price, avatar_url, department, is_active,  commission_rate')
      .single();

    if (error || !row) {
      throw new Error('Não foi possível criar o produto.');
    }

    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      avatarUrl: row.avatar_url,
      department: row.department,
      isActive: row.is_active,
      commissionRate: row.commission_rate ?? 0,
    };
  });