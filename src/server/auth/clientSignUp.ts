// src/server/auth/clientSignUp.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

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
    if (existingClient && !existingClient.profile_id) return { status: 'exists_no_profile' };

    // ── Criar auth user via admin API (invite) ──
    const { data: authUser, error: authError } = await admin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: { role: 'client', full_name: data.name },
        redirectTo: `${import.meta.env.VITE_APP_URL}/cliente`,
      },
    );

    if (authError || !authUser?.user?.id) {
      console.error('[clientSignUp] Erro ao criar auth user:', authError);
      return { status: 'error', message: 'Erro ao criar conta. Verifique o e-mail e tente novamente.' };
    }

    const userId = authUser.user.id;

    // ── UPSERT em profile (trigger já criou um básico) ──
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: data.email,
        role: 'client',
        full_name: data.name,
        phone: data.phone,
        is_active: true,
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      console.error('[clientSignUp] Erro ao upsert profile:', profileError);
      await admin.auth.admin.deleteUser(userId);
      return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
    }

    // ── Clients: o trigger já criou/vinculou se achou match por email
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