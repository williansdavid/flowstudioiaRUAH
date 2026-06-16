// src/features/staff/server/updateStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

// ----------------------------------------------------------------
// Input schema (sem email — read-only na edição)
// ----------------------------------------------------------------
const updateStaffSchema = z.object({
  id: z.string().uuid('ID inválido'),
  full_name: z.string().trim().min(2, 'Nome muito curto'),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{8,20}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  specialty: z.string().trim().optional().or(z.literal('')),
  is_bookable: z.boolean().default(true),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export type UpdateStaffResult =
  | { ok: true }
  | { ok: false; reason: 'FORBIDDEN' }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'UNKNOWN'; message: string };

export const updateStaff = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => updateStaffSchema.parse(raw))
  .handler(async ({ data }): Promise<UpdateStaffResult> => {
    const supabase = createSupabaseServer();

    // PASSO 1 — Sessão
    const {
      data: { user },
      error: sessionErr,
    } = await supabase.auth.getUser();
    if (sessionErr || !user) {
      throw new Error('Sessão inválida.');
    }

    // PASSO 2 — Role
    const { data: role, error: roleErr } =
      await supabase.rpc('current_user_role');
    if (roleErr) {
      throw new Error('Falha ao verificar permissão.');
    }
    if (role === 'client') {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    // PASSO 3 — Buscar alvo (existência + ownership)
    const { data: target, error: findErr } = await supabase
      .from('staff')
      .select('id, profile_id')
      .eq('id', data.id)
      .maybeSingle();

    if (findErr) {
      return { ok: false, reason: 'UNKNOWN', message: findErr.message };
    }
    if (!target) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    // staff só edita o próprio registro; admin edita qualquer um.
    if (role === 'staff' && target.profile_id !== user.id) {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    // PASSO 4 — Update
    const phone = data.phone?.trim() ? data.phone.trim() : null;
    const specialty = data.specialty?.trim() ? data.specialty.trim() : null;

    const { error: updErr } = await supabase
      .from('staff')
      .update({
        full_name: data.full_name,
        phone,
        specialty,
        is_bookable: data.is_bookable,
      })
      .eq('id', data.id);

    if (updErr) {
      return { ok: false, reason: 'UNKNOWN', message: updErr.message };
    }

    return { ok: true };
  });
