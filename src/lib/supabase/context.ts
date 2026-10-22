// src/lib/supabase/context.ts
/// <reference types="vite/client" />
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Client Supabase CONTEXT-AWARE — usado pelas queries convertidas (Fases 1 e 2).
 *
 * - SSR (loaders da 1ª carga): server client com cookies do request.
 * - Browser (navegação client-side): browser client singleton (getSupabaseBrowser).
 *
 * ⚠️ O branch de servidor usa `import.meta.env.SSR`, constante eliminada
 *    em build: no bundle do client o import de ./server é removido e o
 *    módulo server-only NUNCA entra no bundle. NÃO trocar por
 *    `typeof window === 'undefined'` (quebraria o bundling SSR-safe).
 *
 * ⚠️ TIPAGEM `any` (parity deliberada): server.ts cria o client SEM o
 *    generic <Database>, então as serverFns originais rodavam sem
 *    type-check de colunas. Como src/lib/supabase/types.ts está
 *    DESATUALIZADO (faltam colunas/tabelas/RPCs usadas em produção),
 *    tipar como <Database> geraria erros falsos de tsc.
 *    TECHDEB: regenerar types.ts (npx supabase gen types typescript
 *    --project-id fqncipvaeqxubhekruge) e voltar p/ SupabaseClient<Database>.
 */
export async function getSupabaseForContext(): Promise<SupabaseClient<any>> {
  if (import.meta.env.SSR) {
    const { createSupabaseServer } = await import('./server');
    return createSupabaseServer();
  }
  const { getSupabaseBrowser } = await import('./client');
  return getSupabaseBrowser();
}