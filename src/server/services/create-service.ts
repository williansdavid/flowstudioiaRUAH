import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  SERVICE_COLUMNS,
  createServiceInputSchema,
  mapServiceRow,
  mapPgError,
  type AdminServiceItem,
  type ServiceRow,
} from './_shared';

/**
 * Cria um novo serviço.
 * - Requer permissão 'services.manage' (admin).
 * - Validação Zod espelha CHECK constraints do banco.
 * - Retorna o serviço criado já mapeado para shape admin.
 */
export const createService = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createServiceInputSchema.parse(data))
  .handler(async ({ data: input }): Promise<AdminServiceItem> => {
    await requireServerPermission('services.manage');

    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from('services')
      .insert({
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        price: input.price,
        duration_minutes: input.durationMinutes,
        image_url: input.imageUrl ?? null,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0,
      })
      .select(SERVICE_COLUMNS)
      .single();

    if (error || !data) {
      console.error('[createService] supabase error:', error);
      throw new Error(mapPgError(error));
    }

    return mapServiceRow(data as ServiceRow);
  });
