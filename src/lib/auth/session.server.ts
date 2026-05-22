import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppRole, SessionUser } from './types';

/**
 * 🔒 SERVER-ONLY
 * Lógica real que toca Supabase + cookies SSR.
 * Nunca importe este arquivo em código client.
 *
 * Fonte de verdade da role: profiles.role (enum user_role)
 */
export async function loadSessionFromRequest(): Promise<SessionUser | null> {
  const supabase = createSupabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  // Profile + role em uma única query
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, full_name, phone, avatar_url, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[session] erro ao buscar profile:', profileError);
    return null;
  }

  if (!profile) {
    return null;
  }

  // Bloqueia usuário desativado
  if (profile.is_active === false) {
    return null;
  }

  return {
    id: user.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name ?? null,
    phone: profile.phone ?? null,
    avatarUrl: profile.avatar_url ?? null,
    role: (profile.role as AppRole | null) ?? null,
    isActive: profile.is_active ?? false,
  };
}
