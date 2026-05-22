import { getRequest, setCookie } from '@tanstack/react-start/server';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { env } from '@/lib/env';

// Guarda de segurança: este módulo é server-only.
// Se acabar bundlado no client, falha de forma explícita.
if (typeof window !== 'undefined') {
  throw new Error(
    '[supabase/server] Este módulo é server-only e não pode ser importado no client.'
  );
}

export function createSupabaseServer() {
  const request = getRequest();
  if (!request) {
    throw new Error('[supabase/server] Request indisponível no contexto SSR.');
  }

  return createServerClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') ?? '';
          return parseCookieHeader(cookieHeader).map(({ name, value }) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, options);
          });
        },
      },
    }
  );
}
