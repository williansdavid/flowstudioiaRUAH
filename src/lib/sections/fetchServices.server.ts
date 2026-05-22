import { createSupabaseServer } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';

/**
 * Item público de serviço usado pela landing.
 * Espelha o shape consumido por ServicesGrid/ServiceCard.
 */
export interface PublicServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
}

/**
 * Busca serviços ativos do studio para exibição pública.
 *
 * - Server-only (usa createSupabaseServer).
 * - Apenas is_active = true.
 * - Ordenado por display_order, depois name.
 * - Mapeia para shape estável (camelCase) usado pela UI.
 *
 * Erro de fetch NÃO derruba a rota: retorna [] e loga.
 * A landing precisa renderizar mesmo se o banco estiver indisponível.
 */
export async function fetchPublicServices(): Promise<PublicServiceItem[]> {
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
