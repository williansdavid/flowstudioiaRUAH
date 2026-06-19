// src/features/staff/server/createStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { phoneBRSchema } from '@/lib/core/utils';
import { env } from '@/lib/env';

// ----------------------------------------------------------------
// Input schema (Opção B / B1 — sem password)
// ----------------------------------------------------------------
const createStaffSchema = z.object({
  full_name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.string().trim().email('Email inválido'),
  // obrigatório; chega mascarado/sujo e sai canônico +55DDDNUMERO
  phone: phoneBRSchema,
  specialty: z.string().trim().optional().or(z.literal('')),
  is_bookable: z.boolean().default(true),
  role: z.enum(['staff', 'admin']).default('staff'),
  color: z.string().nullable().optional(), // <--- NOVO CAMPO
});

export type CreateStaffInput = z.input<typeof createStaffSchema>;

// ----------------------------------------------------------------
// Retorno discriminado
// ----------------------------------------------------------------
export type CreateStaffResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'FORBIDDEN' }
  | { ok: false; reason: 'EMAIL_TAKEN' }
  | { ok: false; reason: 'UNKNOWN'; message: string };

// ----------------------------------------------------------------
// Action
// ----------------------------------------------------------------
export const createStaff = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => createStaffSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateStaffResult> => {
    // PASSO 1 — Sessão
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: sessionErr,
    } = await supabase.auth.getUser();

    if (sessionErr || !user) {
      throw new Error('Sessão inválida.');
    }

    // PASSO 2 — Autorização (server-side, ANTES de qualquer escrita)
    const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
    if (roleErr) {
      throw new Error('Falha ao verificar permissão.');
    }
    if (role !== 'admin') {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    const admin = createSupabaseAdmin();
    const email = data.email.toLowerCase();
    const phone = data.phone;
    const specialty = data.specialty?.trim() ? data.specialty.trim() : null;

    // PASSO 3 — Criar Auth user via CONVITE
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: data.full_name, is_staff_invite: true },
      redirectTo: `${env.VITE_APP_URL}/primeiro-acesso`,
    });

    if (inviteErr || !invited?.user) {
      const msg = inviteErr?.message ?? '';
      if (/already.*registered|already.*exists|email.*exists/i.test(msg)) {
        return { ok: false, reason: 'EMAIL_TAKEN' };
      }
      return { ok: false, reason: 'UNKNOWN', message: msg || 'Falha ao convidar usuário.' };
    }

    const newUserId = invited.user.id;

    // PASSO 4 — Upsert profile
    const { error: profileErr } = await admin.from('profiles').upsert(
      {
        id: newUserId,
        email,
        full_name: data.full_name,
        role: data.role,
        is_active: true,
      },
      { onConflict: 'id' },
    );

    if (profileErr) {
      await admin.auth.admin.deleteUser(newUserId);
      throw new Error(`Falha ao gravar profile: ${profileErr.message}`);
    }

    // PASSO 5 — Insert staff
    const { data: maxRow, error: maxErr } = await admin
      .from('staff')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxErr) {
      await admin.from('profiles').delete().eq('id', newUserId);
      await admin.auth.admin.deleteUser(newUserId);
      throw new Error(`Falha ao calcular ordem: ${maxErr.message}`);
    }

    const nextOrder = (maxRow?.display_order ?? 0) + 1;

    const { data: staffRow, error: staffErr } = await admin
      .from('staff')
      .insert({
        profile_id: newUserId,
        full_name: data.full_name,
        phone,
        specialty,
        is_bookable: data.is_bookable,
        display_order: nextOrder,
        color: data.color || null, // <--- SALVANDO A COR
      })
      .select('id')
      .single();

    if (staffErr || !staffRow) {
      await admin.from('profiles').delete().eq('id', newUserId);
      await admin.auth.admin.deleteUser(newUserId);
      throw new Error(`Falha ao criar staff: ${staffErr?.message ?? 'desconhecido'}`);
    }

    return { ok: true, id: staffRow.id };
  });