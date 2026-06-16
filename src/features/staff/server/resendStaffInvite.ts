// src/features/staff/server/resendStaffInvite.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

const resendStaffInviteSchema = z.object({
  email: z.string().trim().email('Email inválido'),
});

export type ResendStaffInviteInput = z.infer<typeof resendStaffInviteSchema>;

export type ResendStaffInviteResult =
  | { ok: true }
  | { ok: false; reason: 'FORBIDDEN' }
  | { ok: false; reason: 'ALREADY_ACTIVE' }
  | { ok: false; reason: 'UNKNOWN'; message: string };

export const resendStaffInvite = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => resendStaffInviteSchema.parse(raw))
  .handler(async ({ data }): Promise<ResendStaffInviteResult> => {
    // PASSO 1 — Sessão
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: sessionErr,
    } = await supabase.auth.getUser();
    if (sessionErr || !user) {
      throw new Error('Sessão inválida.');
    }

    // PASSO 2 — Autorização admin-only
    const { data: role, error: roleErr } =
      await supabase.rpc('current_user_role');
    if (roleErr) {
      throw new Error('Falha ao verificar permissão.');
    }
    if (role !== 'admin') {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    const admin = createSupabaseAdmin();
    const email = data.email.toLowerCase();

    // PASSO 3 — Reenviar convite (mesmo fluxo do createStaff)
    const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${env.VITE_APP_URL}/primeiro-acesso` },
    );

    if (inviteErr) {
      const msg = inviteErr.message ?? '';
      // Usuário já confirmou/acessou => convite não reenviável.
      if (/already.*confirmed|already.*registered/i.test(msg)) {
        return { ok: false, reason: 'ALREADY_ACTIVE' };
      }
      return {
        ok: false,
        reason: 'UNKNOWN',
        message: msg || 'Falha ao reenviar convite.',
      };
    }

    return { ok: true };
  });
