// src/features/products/server/deactivateProduct.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const deactivateProductSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export type DeactivateProductInput = z.infer<typeof deactivateProductSchema>;

export const deactivateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deactivateProductSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();
    const { error } = await supabase
      .from('products')
      .update({ is_active: data.isActive })
      .eq('id', data.id);

    if (error) {
      throw new Error('Não foi possível alterar o status do produto.');
    }

    return { id: data.id };
  });