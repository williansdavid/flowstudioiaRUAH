import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export const signOut = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ ok: true }> => {
    const supabase = createSupabaseServer();
    await supabase.auth.signOut();
    return { ok: true };
  },
);
