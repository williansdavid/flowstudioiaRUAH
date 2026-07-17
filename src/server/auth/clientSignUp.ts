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

/**
 * Normaliza telefone para formato +55XXXXXXXXXXX.
 * Remove tudo que não é dígito e adiciona o +55 se necessário.
 *
 * @example
 *   normalizePhone('(14) 98163-1010')  // → '+5514981631010'
 *   normalizePhone('14981631010')      // → '+5514981631010'
 *   normalizePhone('+5514981631010')   // → '+5514981631010'
 */
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
}

export const clientSignUp = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => clientSignUpSchema.parse(data))
  .handler(async ({ data }): Promise<ClientSignUpResult> => {
    const admin = createSupabaseAdmin();

    // ── Normalizar telefone ANTES de qualquer consulta ──
    const normalizedPhone = normalizePhone(data.phone);

    // ── Buscar cliente por email E por telefone (normalizado) ──
    const [{ data: clientByEmail, error: errEmail }, { data: clientByPhone, error: errPhone }] =
      await Promise.all([
        admin
          .from('clients')
          .select('id, profile_id, phone, email')
          .eq('email', data.email)
          .maybeSingle(),
        admin
          .from('clients')
          .select('id, profile_id, phone, email')
          .eq('phone', normalizedPhone)
          .maybeSingle(),
      ]);

    if (errEmail || errPhone) {
      console.error('[clientSignUp] Erro ao buscar cliente:', errEmail ?? errPhone);
      return { status: 'error', message: 'Erro interno. Tente novamente.' };
    }

    // ── Validação cruzada email × telefone ──
    // Caso 1: email existe mas telefone não confere
    if (clientByEmail && clientByEmail.phone !== normalizedPhone) {
      return {
        status: 'error',
        message:
          'Este e-mail já está cadastrado com outro telefone. Use o telefone original ou entre em contato conosco.',
      };
    }

    // Caso 2: telefone existe mas email não confere (ERA O BUG)
    if (clientByPhone && clientByPhone.email !== data.email) {
      return {
        status: 'error',
        message:
          'Este telefone já está cadastrado com outro e-mail. Use o e-mail original ou entre em contato conosco.',
      };
    }

    // ── Cliente determinado (pode vir do email ou do telefone) ──
    const existingClient = clientByEmail ?? clientByPhone;

    if (existingClient?.profile_id) {
      return { status: 'exists_with_profile' };
    }

    // ── Cliente existe em clients mas não tem auth/profile ──
    if (existingClient && !existingClient.profile_id) {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: 'client',
            full_name: data.name,
            phone: normalizedPhone,
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
          phone: normalizedPhone,
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

    const { data: linkedClient } = await admin
      .from('clients')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!linkedClient) {
      const { error: insertError } = await admin.from('clients').insert({
        name: data.name,
        email: data.email,
        phone: normalizedPhone,
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