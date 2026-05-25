import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  SERVICE_COLUMNS,
  mapServiceRow,
  mapPgError,
  type AdminServiceItem,
  type ServiceRow,
} from './_shared';

/**
 * Lista TODOS os serviços (ativos + inativos) para a área admin.
 * - Requer permissão 'services.view'.
 * - Ordenado por display_order ASC, depois name ASC.
 * - Diferente de fetchPublicServices (landing): aqui não filtra is_active.
 */
export const listServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminServiceItem[]> => {
    await requireServerPermission('services.view');

    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from('services')
      .select(SERVICE_COLUMNS)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('[listServices] supabase error:', error);
      throw new Error(mapPgError(error));
    }

    const rows = (data ?? []) as ServiceRow[];
    return rows.map(mapServiceRow);
  },
);
