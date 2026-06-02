import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';
import type { PublicServiceItem } from './types';

/**
 * Busca serviços ativos do studio para exibição pública na landing.
 *
 * Características:
 *   - Server-only (executa via RPC bridge do TanStack Start).
 *   - Filtra apenas is_active = true.
 *   - Ordena por display_order ASC, depois name ASC.
 *   - Adapta snake_case do Supabase → camelCase do contrato público.
 *
 * Resiliência:
 *   Erros de fetch NÃO derrubam a rota. Retorna [] e loga no console.
 *   A landing deve renderizar mesmo se o banco estiver indisponível.
 */
export const fetchPublicServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicServiceItem[]> => {
    try {
      const supabase = createSupabaseServer();

      const { data, error } = await supabase
        .from('services')
        .select(
          'id, name, description, category, price, duration_minutes, image_url'
        )
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('[fetchPublicServices] supabase error:', error.message);
        return [];
      }

      const rows = (data ?? []) as Pick<
        Tables<'services'>,
        | 'id'
        | 'name'
        | 'description'
        | 'category'
        | 'price'
        | 'duration_minutes'
        | 'image_url'
      >[];

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        price: Number(r.price),
        durationMinutes: r.duration_minutes,
        imageUrl: r.image_url,
      }));
    } catch (err) {
      console.error('[fetchPublicServices] unexpected:', err);
      return [];
    }
  }
);
