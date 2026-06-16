import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import type { Database } from './types';

/**
 * Cliente Supabase para o BROWSER.
 *
 * - Singleton: mantém a mesma instância entre renders.
 * - Usa cookies automaticamente (compatível com SSR).
 * - SEM flowType 'pkce': o reset usa token_hash + verifyOtp, que não
 *   depende de code_verifier. PKCE quebrava o fluxo porque o e-mail é
 *   disparado por server fn (verifier nascia fora do browser do link).
 * - detectSessionInUrl: false -> a sessão de recovery é estabelecida
 *   explicitamente em useEstablishRecoverySession (verifyOtp). Sem isso
 *   o client tentaria trocar sozinho ao montar e gerava corrida com o gate.
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
    {
      auth: {
        detectSessionInUrl: false,
      },
    },
  );

  return _browserClient;
}
