// src/features/appointments/server/listClientsForSelect.ts
import { z } from 'zod';
import { getSupabaseForContext } from '@/lib/supabase/context';
import type { ClientOption } from '../types';

const inputSchema = z.object({ q: z.string().max(100).default('') });

/**
 * Fase 1 — leitura direta ao Supabase (sa-east-1), sem serverFn.
 * Mesma assinatura ({ data: { q } }) e retorno do original — callers não mudam.
 */
export async function listClientsForSelect(
  input: { data: { q?: string } },
): Promise<ClientOption[]> {
  const data = inputSchema.parse(input?.data ?? { q: '' });
  const supabase = await getSupabaseForContext();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('[appointments] Sessão inválida.');
  }

  let query = supabase
    .from('clients')
    .select('id, full_name, phone');

  if (data.q) {
    const pattern = `%${data.q}%`;
    query = query.or(`full_name.ilike.${pattern},phone.ilike.${pattern}`);
  }

  const { data: rows, error } = await query
    .order('full_name', { ascending: true })
    .limit(50);

  if (error) throw error;

  return (rows ?? []).map((r: any) => ({
    id: r.id,
    name: r.full_name ?? 'Cliente',
    phone: r.phone,
  }));
}