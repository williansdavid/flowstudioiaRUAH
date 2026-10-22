// src/lib/supabase/context.ts
/// <reference types="vite/client" />
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Client Supabase CONTEXT-AWARE — usado pelas queries convertidas (Fase 1).
 *
 * - SSR (loaders da 1ª carga): server client com cookies do request.
 * - Browser (navegação client-side): browser client singleton (getSupabaseBrowser).
 *
 * ⚠️ O branch de servidor usa `import.meta.env.SSR`, constante eliminada
 *    em build: no bundle do client o import de ./server é removido e o
 *    módulo server-only NUNCA entra no bundle. NÃO trocar por
 *    `typeof window === 'undefined'` (quebraria o bundling SSR-safe).
 */
export async function getSupabaseForContext(): Promise<SupabaseClient<Database>> {
  if (import.meta.env.SSR) {
    const { createSupabaseServer } = await import('./server');
    return createSupabaseServer();
  }
  const { getSupabaseBrowser } = await import('./client');
  return getSupabaseBrowser();
}