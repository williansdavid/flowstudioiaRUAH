// src/server/auth/clientSignUp.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

const clientSignUpSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  phone: z.string().trim().min(1, 'Telefone é obrigatório'),
});

export type ClientSignUpInput = z.infer<typeof clientSignUpSchema>;

type ClientSignUpResult =
  | { status: 'success' }
  | { status: 'exists_with_profile' }
  | { status: 'exists_no_profile' }
  | { status: 'error'; message: string };

export const clientSignUp = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => clientSignUpSchema.parse(data))
  .handler(async ({ data }): Promise<ClientSignUpResult> => {
    const admin = createSupabaseAdmin();

    // ── Verificar se o email já existe em clients ──
    const { data: existingClient, error: clientError } = await admin
      .from('clients')
      .select('id, profile_id')
      .eq('email', data.email)
      .maybeSingle();

    if (clientError) {
      console.error('[clientSignUp] Erro ao buscar cliente:', clientError);
      return { status: 'error', message: 'Erro interno. Tente novamente.' };
    }

    if (existingClient?.profile_id) return { status: 'exists_with_profile' };

    // ── [NOVO] Cliente existe em clients mas não tem auth/profile ──
    // Cria auth + profile e linka o registro existente
    if (existingClient && !existingClient.profile_id) {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: 'client',
            full_name: data.name,
            phone: data.phone,
          },
          redirectTo: `${env.VITE_APP_URL}/cliente`,
        },
      );

      if (inviteErr || !invited?.user) {
        const msg = inviteErr?.message ?? '';
        if (/already.*registered|already.*exists|email.*exists/i.test(msg)) {
          return { status: 'error', message: 'Este e-mail já está em uso.' };
        }
        console.error('[clientSignUp] Erro ao convidar cliente existente:', inviteErr);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }

      const userId = invited.user.id;

      // ── Criar profile ──
      const { error: profileErr } = await admin.from('profiles').upsert(
        {
          id: userId,
          email: data.email,
          role: 'client',
          full_name: data.name,
          is_active: true,
        },
        { onConflict: 'id' },
      );

      if (profileErr) {
        console.error('[clientSignUp] Erro ao criar profile (cliente existente):', profileErr);
        await admin.auth.admin.deleteUser(userId);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }

      // ── Linkar o clients existente com o novo profile ──
      const { error: updateError } = await admin
        .from('clients')
        .update({ profile_id: userId })
        .eq('id', existingClient.id);

      if (updateError) {
        console.error('[clientSignUp] Erro ao vincular cliente existente:', updateError);
        await admin.auth.admin.deleteUser(userId);
        await admin.from('profiles').delete().eq('id', userId);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }

      return { status: 'success' };
    }

    // ── Criar Auth user via CONVITE (cliente novo) ──
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          role: 'client',
          full_name: data.name,
          phone: data.phone,
        },
        redirectTo: `${env.VITE_APP_URL}/cliente`,
      },
    );

    if (inviteErr || !invited?.user) {
      const msg = inviteErr?.message ?? '';
      if (/already.*registered|already.*exists|email.*exists/i.test(msg)) {
        return { status: 'error', message: 'Este e-mail já está em uso.' };
      }
      console.error('[clientSignUp] Erro ao convidar:', inviteErr);
      return { status: 'error', message: 'Erro ao criar conta. Verifique o e-mail e tente novamente.' };
    }

    const userId = invited.user.id;

    // ── Upsert profile ──
    const { error: profileErr } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: data.email,
        role: 'client',
        full_name: data.name,        
        is_active: true,
      },
      { onConflict: 'id' },
    );

    if (profileErr) {
      console.error('[clientSignUp] Erro ao upsert profile:', profileErr);
      await admin.auth.admin.deleteUser(userId);
      return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
    }

    // ── Clients: trigger já pode ter vinculado por email ──
    const { data: linkedClient } = await admin
      .from('clients')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!linkedClient) {
      const { error: insertError } = await admin.from('clients').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        profile_id: userId,
        status: 'active',
      });

      if (insertError) {
        console.error('[clientSignUp] Erro ao inserir cliente:', insertError);
        await admin.auth.admin.deleteUser(userId);
        await admin.from('profiles').delete().eq('id', userId);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }
    }

    return { status: 'success' };
  });