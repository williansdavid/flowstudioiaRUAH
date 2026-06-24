/**
 * src/lib/public/services.ts — Server fn + hook público de serviços
 * ----------------------------------------------------------------
 * Contém:
 *   - fetchPublicServices: server fn (SSR, usada internamente)
 *   - usePublicServices:   hook React Query (client-side, landing)
 * ----------------------------------------------------------------
 */
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/lib/supabase/types';
import type { PublicServiceItem } from './types';

const PUBLIC_SERVICES_KEY = ['public', 'services'] as const;

/**
 * Server fn — busca serviços ativos do studio.
 * Continua existindo para uso interno (ex.: SSR de outras rotas).
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

/**
 * Hook React Query — busca serviços ativos client-side.
 *
 * Uso:
 *   const { data: services, isLoading } = usePublicServices();
 *
 * Comportamento:
 *   - Usa useServerFn como bridge para chamar a server fn no client
 *   - Cache de 1 min (staleTime), GC de 5 min (gcTime)
 *   - Retry 1 vez em caso de falha
 *   - Retorna array vazio se der erro (landing nunca quebra)
 */
export function usePublicServices() {
  const getServices = useServerFn(fetchPublicServices);
  return useQuery({
    queryKey: PUBLIC_SERVICES_KEY,
    queryFn: () => getServices(),
    staleTime: 60 * 1000,       // 1 min
    gcTime: 5 * 60 * 1000,      // 5 min
    retry: 1,
    refetchOnWindowFocus: false,
  });
}