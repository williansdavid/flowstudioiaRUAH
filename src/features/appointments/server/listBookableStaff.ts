// src/features/appointments/server/listBookableStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { BookableStaffItem } from '../types';

interface RawRow {
  id: string;
  display_order: number;
  profiles: { full_name: string | null } | null;
}

export const listBookableStaff = createServerFn({ method: 'GET' }).handler(
  async (): Promise<BookableStaffItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data, error } = await supabase
      .from('staff')
      .select('id, display_order, profiles(full_name)')
      .eq('is_bookable', true)
      .order('display_order', { ascending: true });
    if (error) throw error;

    return (data as unknown as RawRow[]).map((r) => ({
      id: r.id,
      name: r.profiles?.full_name ?? 'Profissional',
      displayOrder: r.display_order,
    }));
  },
);
