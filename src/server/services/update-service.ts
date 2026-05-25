import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  SERVICE_COLUMNS,
  updateServiceInputSchema,
  mapServiceRow,
  mapPgError,
  type AdminServiceItem,
  type ServiceRow,
} from './_shared';

/**
 * Atualiza um serviço (patch parcial).
 * - Requer permissão 'services.manage' (admin).
 * - Apenas campos enviados no patch são atualizados.
 * - updated_at é gerenciado pelo trigger trg_services_updated_at.
 */
export const updateService = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateServiceInputSchema.parse(data))
  .handler(async ({ data: input }): Promise<AdminServiceItem> => {
    await requireServerPermission('services.manage');

    const supabase = createSupabaseServer();

    // Monta patch snake_case apenas com campos fornecidos
    const patch: Record<string, unknown> = {};
    const p = input.patch;

    if (p.name !== undefined) patch.name = p.name;
    if (p.description !== undefined) patch.description = p.description;
    if (p.category !== undefined) patch.category = p.category;
    if (p.price !== undefined) patch.price = p.price;
    if (p.durationMinutes !== undefined)
      patch.duration_minutes = p.durationMinutes;
    if (p.imageUrl !== undefined) patch.image_url = p.imageUrl;
    if (p.isActive !== undefined) patch.is_active = p.isActive;
    if (p.displayOrder !== undefined) patch.display_order = p.displayOrder;

    const { data, error } = await supabase
      .from('services')
      .update(patch)
      .eq('id', input.id)
      .select(SERVICE_COLUMNS)
      .single();

    if (error || !data) {
      console.error('[updateService] supabase error:', error);
      throw new Error(mapPgError(error));
    }

    return mapServiceRow(data as ServiceRow);
  });
