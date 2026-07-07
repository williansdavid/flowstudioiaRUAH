// src/server/auth/getSession.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { SessionData } from '@/features/auth/types';

/**
 * Resolve a sessão no servidor.
 * Usa auth.getUser() (valida o token no Supabase, confiável em SSR).
 * Retorna null se não autenticado ou perfil inativo/ausente.
 */
export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionData | null> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, avatar_url, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_active) return null;

    return {
      userId: user.id,
      email: user.email ?? profile.email,
      profile,
    };
  },
);
