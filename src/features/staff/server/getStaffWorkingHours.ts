// src/features/staff/server/getStaffWorkingHours.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  parseWorkingHours,
  type WorkingHours,
} from '@/lib/scheduling/workingHours.schema';

const inputSchema = z.object({
  staffId: z.string().uuid('Profissional inválido'),
});

interface RawStaffRow {
  id: string;
  full_name: string | null;
  profile_id: string | null;
  working_hours: unknown;
  profiles: { full_name: string | null } | null;
}

export interface StaffWorkingHoursResult {
  staffId: string;
  fullName: string | null;
  /** null => staff sem grade válida; caller monta default editável. */
  workingHours: WorkingHours | null;
  /** true => usuário pode editar este staff (admin OU dono do registro). */
  canEdit: boolean;
}

/**
 * Autorização (lida no server, nunca na UI):
 *  - admin  => lê/edita qualquer staff.
 *  - staff  => só onde staff.profile_id === user.id.
 *  - client => barrado.
 *
 * Nome: profiles.full_name (vínculo) -> staff.full_name (fallback).
 */
export const getStaffWorkingHours = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<StaffWorkingHoursResult> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[staff] Sessão inválida.');
    }

    const { data: role, error: roleError } = await supabase.rpc(
      'current_user_role',
    );
    if (roleError) throw roleError;
    if (role === 'client') {
      throw new Error('[staff] Acesso negado.');
    }

    const { data: staffRaw, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name, profile_id, working_hours, profiles(full_name)')
      .eq('id', data.staffId)
      .single();
    if (staffError || !staffRaw) {
      throw new Error('[staff] Profissional não encontrado.');
    }

    const staff = staffRaw as unknown as RawStaffRow;

    const isOwner = staff.profile_id === user.id;
    const canEdit = role === 'admin' || isOwner;
    if (!canEdit && role === 'staff') {
      // staff só pode ver/editar o próprio registro
      throw new Error('[staff] Acesso negado a este profissional.');
    }

    return {
      staffId: staff.id,
      fullName: staff.profiles?.full_name ?? staff.full_name ?? null,
      workingHours: parseWorkingHours(staff.working_hours),
      canEdit,
    };
  });
