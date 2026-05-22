import { createClient } from '@supabase/supabase-js';
import { env, serverEnv } from '../env';
import type { Database } from './types';

/**
 * Cliente Supabase ADMIN (service role).
 * USO EXCLUSIVO no servidor (loaders, server functions, API routes).
 * NUNCA importar em componentes client.
 */
export function createSupabaseAdmin() {
  const secrets = serverEnv(); // ← função, lazy

  return createClient<Database>(
    env.VITE_SUPABASE_URL,
    secrets.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
