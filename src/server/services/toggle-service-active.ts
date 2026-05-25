import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  toggleServiceActiveInputSchema,
  mapPgError,
} from './_shared';

/**
 * Ativa/desativa um serviço (soft toggle).
 * - Requer permissão 'services.manage' (admin).
 * - Não deletamos serviços (preserva histórico em appointments futuros).
 * - Retorna { id, isActive } enxuto — UI atualiza otimisticamente.
 */
export const toggleServiceActive = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    toggleServiceActiveInputSchema.parse(data),
  )
  .handler(
    async ({
      data,
    }): Promise<{ id: string; isActive: boolean }> => {
      await requireServerPermission('services.manage');

      const supabase = createSupabaseServer();

      const { data: row, error } = await supabase
        .from('services')
        .update({ is_active: data.isActive })
        .eq('id', data.id)
        .select('id, is_active')
        .single();

      if (error || !row) {
        console.error('[toggleServiceActive] supabase error:', error);
        throw new Error(mapPgError(error));
      }

      return { id: row.id, isActive: row.is_active };
    },
  );
