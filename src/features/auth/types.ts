import type { Database } from '@/lib/supabase/types';

/** Enum de role direto do banco (admin | staff | client). */
export type UserRole = Database['public']['Enums']['user_role'];

/** Subconjunto de profiles relevante pra sessão. */
export type AuthProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'email' | 'role' | 'full_name' | 'avatar_url' | 'is_active'
>;

/** Dado de sessão resolvido no server. null = não autenticado. */
export interface SessionData {
  userId: string;
  email: string;
  profile: AuthProfile;
}

/** Roles com acesso à área administrativa. */
export const ADMIN_ROLES: readonly UserRole[] = ['admin', 'staff'] as const;

export function canAccessAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}
