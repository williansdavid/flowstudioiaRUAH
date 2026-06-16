// src/features/staff/server/archiveStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const schema = z.object({
  id: z.string().uuid(),
  archive: z.boolean(), // true = arquivar, false = desarquivar
});

export type ArchiveStaffInput = z.infer<typeof schema>;
export type ArchiveStaffResult = { id: string; archivedAt: string | null };

export const archiveStaff = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<ArchiveStaffResult> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('[staff] Sessão inválida.');

    const { data: role, error: roleError } =
      await supabase.rpc('current_user_role');
    if (roleError) throw roleError;
    if (role !== 'admin') throw new Error('[staff] Acesso negado.');

    const archivedAt = data.archive ? new Date().toISOString() : null;

    // Ao arquivar, também tira de agendável. Desarquivar NÃO reativa is_bookable
    // (admin decide depois se volta a ser agendável).
    const patch = data.archive
      ? { archived_at: archivedAt, is_bookable: false }
      : { archived_at: null };

    const { data: updated, error } = await supabase
      .from('staff')
      .update(patch)
      .eq('id', data.id)
      .select('id, archived_at')
      .maybeSingle();

    if (error) throw error;
    if (!updated) throw new Error('[staff] Profissional não encontrado.');

    return { id: updated.id, archivedAt: updated.archived_at };
  });
