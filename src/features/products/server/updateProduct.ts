// src/features/products/server/updateProduct.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { ProductItem } from '../types';

const BUCKET = 'products';

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'Informe o nome do produto.'),
  price: z.number().nonnegative('Preço inválido.'),
  department: z.string().trim().nullable(),
  avatarUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

function extractStoragePath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = url.slice(idx + marker.length).split('?')[0];
  if (!raw) return null;
  const path = decodeURIComponent(raw);
  if (path.includes('/') || path.trim() === '') return null;
  return path;
}

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateProductSchema.parse(data))
  .handler(async ({ data }): Promise<ProductItem> => {
    const supabase = createSupabaseServer();

    // Se avatarUrl vai mudar, busca o valor ANTES do update
    let oldUrl: string | null = null;
    if (data.avatarUrl !== undefined) {
      const { data: current } = await supabase
        .from('products')
        .select('avatar_url')
        .eq('id', data.id)
        .single();
      oldUrl = current?.avatar_url ?? null;
    }

    const updateData: Record<string, unknown> = {
      name: data.name,
      price: data.price,
      department: data.department,
      is_active: data.isActive,
    };

    if (data.avatarUrl !== undefined) {
      updateData.avatar_url = data.avatarUrl;
    }

    const { data: row, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', data.id)
      .select('id, name, price, avatar_url, department, is_active')
      .single();

    if (error || !row) {
      throw new Error('Não foi possível atualizar o produto.');
    }

    // Remove imagem antiga do bucket se mudou
    if (oldUrl && oldUrl !== data.avatarUrl) {
      const oldPath = extractStoragePath(oldUrl);
      if (oldPath) {
        const admin = createSupabaseAdmin();
        const { error: removeErr } = await admin.storage
          .from(BUCKET)
          .remove([oldPath]);
        if (removeErr) {
          console.warn(
            `[updateProduct] Falha ao remover imagem órfã "${oldPath}": ${removeErr.message}`,
          );
        }
      }
    }

    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      avatarUrl: row.avatar_url,
      department: row.department,
      isActive: row.is_active,
    };
  });