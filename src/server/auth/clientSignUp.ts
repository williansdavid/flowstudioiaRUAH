// src/server/auth/clientSignUp.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
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
    const supabase = createSupabaseServer();
    const admin = createSupabaseAdmin();

    // ── Verificar se o email já existe em clients ──
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('id, profile_id')
      .eq('email', data.email)
      .maybeSingle();

    if (clientError) {
      console.error('[clientSignUp] Erro ao buscar cliente:', clientError);
      return { status: 'error', message: 'Erro interno. Tente novamente.' };
    }

    // Email já existe com profile → já tem acesso
    if (existingClient?.profile_id) {
      return { status: 'exists_with_profile' };
    }

    // Email já existe sem profile → precisa solicitar acesso via WhatsApp
    if (existingClient && !existingClient.profile_id) {
      return { status: 'exists_no_profile' };
    }

    // ── Criar auth user via admin API (invite) ──
    const { data: authUser, error: authError } = await admin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: { role: 'client', full_name: data.name },
        redirectTo: `${import.meta.env.VITE_APP_URL}/cliente`,
      },
    );

    if (authError) {
      console.error('[clientSignUp] Erro ao criar auth user:', authError);
      return { status: 'error', message: 'Erro ao criar conta. Verifique o e-mail e tente novamente.' };
    }

    const userId = authUser.user?.id;
    if (!userId) {
      return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
    }

    // ── Criar profile ──
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: data.email,
      role: 'client',
      full_name: data.name,
      phone: data.phone,
      is_active: true,
    });

    if (profileError) {
      console.error('[clientSignUp] Erro ao criar profile:', profileError);
      await admin.auth.admin.deleteUser(userId);
      return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
    }

    // ── Criar ou atualizar cliente com profile_id ──
    if (existingClient) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ profile_id: userId })
        .eq('id', existingClient.id);

      if (updateError) {
        console.error('[clientSignUp] Erro ao vincular cliente:', updateError);
        await admin.auth.admin.deleteUser(userId);
        await supabase.from('profiles').delete().eq('id', userId);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }
    } else {
      const { error: insertError } = await supabase.from('clients').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        profile_id: userId,
        status: 'active',
      });

      if (insertError) {
        console.error('[clientSignUp] Erro ao inserir cliente:', insertError);
        await admin.auth.admin.deleteUser(userId);
        await supabase.from('profiles').delete().eq('id', userId);
        return { status: 'error', message: 'Erro ao criar conta. Tente novamente.' };
      }
    }

    return { status: 'success' };
  });