import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  CLIENT_VIEW_COLUMNS,
  mapClientViewRow,
  mapPgError,
  type AdminClientItem,
  type ClientViewRow,
} from './_shared';

/**
 * Lista TODOS os clientes para a área admin.
 *
 * - Requer permissão 'clients.view' (admin + staff).
 * - Lê da VIEW `clients_view` que consolida origin/display_*.
 * - Ordena por last_visit_at DESC (mais recentes primeiro), null por último.
 * - Tie-break: created_at DESC.
 */
export const listClients = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminClientItem[]> => {
    await requireServerPermission('clients.view');

    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from('clients_view')
      .select(CLIENT_VIEW_COLUMNS)
      .order('last_visit_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[listClients] supabase error:', error);
      throw new Error(mapPgError(error));
    }

    const rows = (data ?? []) as ClientViewRow[];
    return rows.map(mapClientViewRow);
  },
);
