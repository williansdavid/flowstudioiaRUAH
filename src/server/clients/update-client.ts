import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { requireServerPermission } from '@/lib/auth/server-guards';
import {
  CLIENT_VIEW_COLUMNS,
  updateClientInputSchema,
  mapClientViewRow,
  mapPgError,
  parseInput,
  type AdminClientItem,
  type ClientViewRow,
} from './_shared';
import type { TablesUpdate } from '@/lib/supabase/types';

/**
 * Atualiza um cliente existente (patch parcial).
 *
 * - Requer permissão 'clients.manage' (admin + staff).
 * - Pré-valida duplicidade de email/phone (excluindo o próprio id).
 * - Aceita patch parcial — só campos presentes são atualizados.
 */
export const updateClient = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => parseInput(updateClientInputSchema, data))
  .handler(async ({ data: input }): Promise<AdminClientItem> => {
    await requireServerPermission('clients.manage');

    const supabase = createSupabaseServer();

    // 1) Pré-check de duplicados — apenas se está alterando o campo
    if (input.patch.email) {
      const { data: existingEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', input.patch.email)
        .neq('id', input.id)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Já existe outro cliente cadastrado com este e-mail.');
      }
    }

    if (input.patch.phone) {
      const { data: existingPhone } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', input.patch.phone)
        .neq('id', input.id)
        .maybeSingle();

      if (existingPhone) {
        throw new Error('Já existe outro cliente cadastrado com este telefone.');
      }
    }

    // 2) Monta payload só com campos presentes no patch
    const updatePayload: TablesUpdate<'clients'> = {};
    if (input.patch.name !== undefined) updatePayload.full_name = input.patch.name;
    if (input.patch.phone !== undefined) updatePayload.phone = input.patch.phone;
    if (input.patch.email !== undefined) updatePayload.email = input.patch.email;
    if (input.patch.notes !== undefined) updatePayload.notes = input.patch.notes;
    if (input.patch.birthDate !== undefined) updatePayload.birth_date = input.patch.birthDate;

    const { error: updateError } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', input.id);

    if (updateError) {
      console.error('[updateClient] update error:', updateError);
      throw new Error(mapPgError(updateError));
    }

    // 3) Relê da view pra retornar shape consolidado
    const { data: viewRow, error: viewError } = await supabase
      .from('clients_view')
      .select(CLIENT_VIEW_COLUMNS)
      .eq('id', input.id)
      .single();

    if (viewError || !viewRow) {
      console.error('[updateClient] view read error:', viewError);
      throw new Error(mapPgError(viewError));
    }

    return mapClientViewRow(viewRow as ClientViewRow);
  });
