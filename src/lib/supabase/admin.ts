import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, serverEnv } from '@/lib/env';
import type { Database } from '@/lib/supabase/types';

/**
 * ============================================
 * Supabase ADMIN client — service_role
 * ============================================
 *
 * ⚠️ SERVER-ONLY. BYPASSA RLS.
 *
 * Usa SUPABASE_SERVICE_ROLE_KEY. NUNCA pode ser importado
 * em código que vá pro bundle do client.
 *
 * Qualquer escrita feita por este client DEVE ser precedida
 * de validação de autorização explícita (ex: current_user_role()
 * === 'admin'), pois aqui não há RLS pra proteger.
 *
 * Uso:
 *   const admin = createSupabaseAdmin();
 *   await admin.auth.admin.createUser({ ... });
 */

let _adminCache: SupabaseClient<Database> | null = null;

export function createSupabaseAdmin(): SupabaseClient<Database> {
  // Guard server-only — barra qualquer vazamento pro browser.
  if (typeof window !== 'undefined') {
    throw new Error(
      '[supabase/admin] createSupabaseAdmin() é server-only. ' +
        'Nunca importe este módulo em código de client.',
    );
  }

  if (_adminCache) return _adminCache;

  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();

  _adminCache = createClient<Database>(
    env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  return _adminCache;
}
