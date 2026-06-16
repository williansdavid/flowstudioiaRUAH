// src/features/staff/server/updateStaffWorkingHours.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { workingHoursSchema } from '@/lib/scheduling/workingHours.schema';

const inputSchema = z.object({
  staffId: z.string().uuid('Profissional inválido'),
  // Fonte única de verdade do formato (schema 4.2).
  workingHours: workingHoursSchema,
});

export type UpdateStaffWorkingHoursInput = z.infer<typeof inputSchema>;

export const updateStaffWorkingHours = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
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

    // Confere autorização contra o registro real antes de escrever.
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, profile_id')
      .eq('id', data.staffId)
      .single();
    if (staffError || !staff) {
      throw new Error('[staff] Profissional não encontrado.');
    }

    const isOwner = staff.profile_id === user.id;
    const canEdit = role === 'admin' || isOwner;
    if (!canEdit) {
      throw new Error('[staff] Acesso negado a este profissional.');
    }

    const { data: updated, error } = await supabase
      .from('staff')
      .update({ working_hours: data.workingHours })
      .eq('id', data.staffId)
      .select('id')
      .single();
    if (error) throw error;
    if (!updated) {
      throw new Error('[staff] Falha ao salvar horários.');
    }

    return { id: updated.id };
  });
