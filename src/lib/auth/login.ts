import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Server function de login via Supabase Auth.
 * Roda exclusivamente no servidor.
 * Cookies httpOnly são definidos automaticamente pelo cliente SSR.
 */
export const login = createServerFn({ method: 'POST' })
  .inputValidator((data: LoginInput): LoginInput => {
    if (!data?.email || !data?.password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }
    return {
      email: String(data.email).trim(),
      password: String(data.password),
    };
  })
  .handler(async ({ data }): Promise<LoginResult> => {
    const supabase = createSupabaseServer();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        message: 'E-mail ou senha inválidos.',
      };
    }

    return { success: true };
  });
