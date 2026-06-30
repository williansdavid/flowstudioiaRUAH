// src/features/staff/server/listStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { StaffListItem } from '../types';
import { z } from 'zod';

const listSchema = z.object({
  includeArchived: z.boolean().optional(), // default false
});

interface RawRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  specialty: string | null;
  is_bookable: boolean;
  display_order: number;
  profile_id: string | null;
  archived_at: string | null;
  color: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: 'admin' | 'staff' | 'client' | null;
    is_active: boolean | null;    // <--- NOVO
  } | null;
}

/**
 * Lista profissionais do studio.
 * Autorização server-side (nunca na UI):
 *  - admin  => lista todos + cruza last_sign_in_at (hasAccess).
 *  - staff  => só o próprio registro; hasAccess vem da própria sessão.
 *  - client => barrado.
 * Nome: profiles.full_name (vínculo) -> staff.full_name (fallback).
 */
export const listStaff = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => listSchema.parse(data ?? {}))
  .handler(async ({ data }): Promise<StaffListItem[]> => {
    const includeArchived = data?.includeArchived ?? false;

    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('[staff] Sessão inválida.');

    const { data: role, error: roleError } =
      await supabase.rpc('current_user_role');
    if (roleError) throw roleError;
    if (role === 'client') throw new Error('[staff] Acesso negado.');

    let query = supabase
      .from('staff')
      .select(
        'id, full_name, phone, specialty, is_bookable, display_order, profile_id, archived_at, color, profiles(full_name, email, avatar_url, role, is_active)',
      )
      .order('display_order', { ascending: true });

    if (role === 'staff') {
      query = query.eq('profile_id', user.id);
    }

    // Filtro de arquivamento. includeArchived=true => SÓ arquivados (tela dedicada).
    if (includeArchived) {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }

    const { data: rowsData, error } = await query;
    if (error) throw error;

    const rows = rowsData as unknown as RawRow[];

    // Mapa profile_id -> hasAccess (last_sign_in_at != null).
    const accessByProfileId = new Map<string, boolean>();

    if (role === 'admin') {
      const admin = createSupabaseAdmin();
      const { data: usersPage, error: usersErr } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersErr) throw usersErr;
      for (const u of usersPage.users) {
        accessByProfileId.set(u.id, u.last_sign_in_at != null);
      }
    } else {
      // staff: o único registro visível é o dele.
      accessByProfileId.set(user.id, user.last_sign_in_at != null);
    }

    return rows.map((r) => {
      const isOwner = r.profile_id === user.id;
      const hasAccess = r.profile_id
        ? (accessByProfileId.get(r.profile_id) ?? false)
        : false;
      const rawRole = r.profiles?.role ?? null;
      const staffRole: 'admin' | 'staff' | null =
        rawRole === 'admin' || rawRole === 'staff' ? rawRole : null;

      return {
        id: r.id,
        name: r.profiles?.full_name ?? r.full_name ?? 'Profissional',
        email: r.profiles?.email ?? null,
        phone: r.phone ?? null,
        specialty: r.specialty,
        avatarUrl: r.profiles?.avatar_url ?? null,
        isBookable: r.is_bookable,
        isActive: r.profiles?.is_active ?? true,   // <--- NOVO (default true para segurança)
        displayOrder: r.display_order,
        color: r.color ?? null,
        canEdit: role === 'admin' || isOwner,
        hasAccess,
        role: staffRole,
        isArchived: r.archived_at != null,
      };

    });
  });