// src/features/finance/server/getCurrentUserRole.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export const getCurrentUserRole = createServerFn({ method: 'GET' })
  .handler(async (): Promise<{ role: string | null }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { role: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return { role: profile?.role ?? null };
  });