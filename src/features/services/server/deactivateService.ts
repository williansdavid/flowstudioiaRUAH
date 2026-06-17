// src/features/services/server/deactivateService.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const deactivateServiceSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(), // permite reativar também
});

export type DeactivateServiceInput = z.infer<typeof deactivateServiceSchema>;

export const deactivateService = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deactivateServiceSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const { error } = await supabase
      .from('services')
      .update({ is_active: data.isActive })
      .eq('id', data.id);

    if (error) {
      throw new Error('Não foi possível alterar o status do serviço.');
    }

    return { id: data.id };
  });
