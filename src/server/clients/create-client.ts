import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  CLIENT_VIEW_COLUMNS,
  createClientInputSchema,
  mapClientViewRow,
  mapPgError,
  parseInput,
  type AdminClientItem,
  type ClientViewRow,
} from './_shared';

/**
 * Cria um novo cliente WALK-IN (sem profile vinculado).
 *
 * - Requer permissão 'clients.manage' (admin + staff).
 * - Pré-valida duplicidade de email/phone com mensagem clara.
 * - Insere na tabela `clients` (profile_id = null).
 * - Relê pela VIEW `clients_view` para devolver shape consolidado.
 *
 * Defesa em camadas: pré-check (UX) + UNIQUE no banco (integridade).
 */
export const createClient = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => parseInput(createClientInputSchema, data))
  .handler(async ({ data: input }): Promise<AdminClientItem> => {
    await requireServerPermission('clients.manage');

    const supabase = createSupabaseServer();

    // 1) Pré-check de duplicados (mensagens amigáveis)
    if (input.email) {
      const { data: existingEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', input.email)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Já existe um cliente cadastrado com este e-mail.');
      }
    }

    if (input.phone) {
      const { data: existingPhone } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', input.phone)
        .maybeSingle();

      if (existingPhone) {
        throw new Error('Já existe um cliente cadastrado com este telefone.');
      }
    }

    // 2) Insert na tabela base
    const { data: inserted, error: insertError } = await supabase
      .from('clients')
      .insert({
        profile_id: null,
        full_name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        notes: input.notes ?? null,
        birth_date: input.birthDate ?? null,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      console.error('[createClient] insert error:', insertError);
      throw new Error(mapPgError(insertError));
    }

    // 3) Relê da view pra retornar shape consolidado
    const { data: viewRow, error: viewError } = await supabase
      .from('clients_view')
      .select(CLIENT_VIEW_COLUMNS)
      .eq('id', inserted.id)
      .single();

    if (viewError || !viewRow) {
      console.error('[createClient] view read error:', viewError);
      throw new Error(mapPgError(viewError));
    }

    return mapClientViewRow(viewRow as ClientViewRow);
  });
