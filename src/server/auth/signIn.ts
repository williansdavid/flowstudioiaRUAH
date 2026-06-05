import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { SessionData } from '@/features/auth/types';

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail invÃ¡lido'),
  password: z.string().min(6, 'Senha muito curta'),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Autentica via email/senha. Grava cookie de sessÃ£o (setAll no server.ts).
 * LanÃ§a Error com mensagem amigÃ¡vel em caso de falha.
 */
export const signIn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => signInSchema.parse(data))
  .handler(async ({ data }): Promise<SessionData> => {
    const supabase = createSupabaseServer();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, avatar_url, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Perfil nÃ£o encontrado.');
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      throw new Error('Conta desativada. Contate o administrador.');
    }

    return {
      userId: authData.user.id,
      email: authData.user.email ?? profile.email,
      profile,
    };
  });
