import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export type LogoutResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Server function de logout via Supabase Auth.
 * Roda exclusivamente no servidor.
 * Cookies httpOnly do Supabase são limpos automaticamente pelo cliente SSR
 * através do `setCookie` configurado em `createSupabaseServer`.
 */
export const logout = createServerFn({ method: 'POST' }).handler(
  async (): Promise<LogoutResult> => {
    const supabase = createSupabaseServer();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[logout] erro ao encerrar sessão:', error);
      return {
        success: false,
        message: 'Erro ao sair. Tente novamente.',
      };
    }

    return { success: true };
  },
);
