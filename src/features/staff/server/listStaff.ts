// src/features/staff/server/listStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { StaffListItem } from '../types';

interface RawRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  specialty: string | null;
  is_bookable: boolean;
  display_order: number;
  profile_id: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

/**
 * Lista profissionais do studio.
 * Autorização server-side (nunca na UI):
 *  - admin  => lista todos.
 *  - staff  => só o próprio registro (staff.profile_id === user.id).
 *  - client => barrado.
 * Nome: profiles.full_name (vínculo) -> staff.full_name (fallback).
 */
export const listStaff = createServerFn({ method: 'GET' }).handler(
  async (): Promise<StaffListItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[staff] Sessão inválida.');
    }

    const { data: role, error: roleError } =
      await supabase.rpc('current_user_role');
    if (roleError) throw roleError;
    if (role === 'client') {
      throw new Error('[staff] Acesso negado.');
    }

    let query = supabase
      .from('staff')
      .select(
        'id, full_name, phone, specialty, is_bookable, display_order, profile_id, profiles(full_name, email)',
      )
      .order('display_order', { ascending: true });

    // staff só enxerga o próprio registro.
    if (role === 'staff') {
      query = query.eq('profile_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as unknown as RawRow[]).map((r) => {
      const isOwner = r.profile_id === user.id;
      return {
        id: r.id,
        name: r.profiles?.full_name ?? r.full_name ?? 'Profissional',
        email: r.profiles?.email ?? null,
        phone: r.phone ?? null,
        specialty: r.specialty,
        isBookable: r.is_bookable,
        displayOrder: r.display_order,
        canEdit: role === 'admin' || isOwner,
      };
    });
  },
);
