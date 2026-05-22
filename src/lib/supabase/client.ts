import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import type { Database } from './types';

/**
 * Cliente Supabase para o BROWSER.
 *
 * - Singleton: mantém a mesma instância entre renders.
 * - Usa cookies automaticamente (compatível com SSR).
 *
 * ⚠️ Nunca use no server. Para server, use `createSupabaseServer()`
 *    de `@/lib/supabase/server`.
 */
let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function getSupabaseBrowser() {
  if (_browserClient) return _browserClient;

  _browserClient = createBrowserClient<Database>(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
  );

  return _browserClient;
}
