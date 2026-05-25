import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { requireServerPermission } from '@/lib/auth/server-guards';

const updateStaffSchema = z.object({
  profileId: z.string().uuid(),

  // Profile fields (todos opcionais)
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v === '' ? null : v)),
  role: z.enum(['admin', 'staff']).optional(),

  // Staff fields (todos opcionais)
  specialty: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v === '' ? null : v)),
  bio: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === '' ? null : v)),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  isBookable: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export type UpdateStaffInput = z.input<typeof updateStaffSchema>;

/**
 * Atualiza dados de um membro (profile + staff).
 *
 * - Profile: atualiza só campos enviados.
 * - Staff: se role atual era 'admin' e virou 'staff', cria registro em staff.
 *          Se já existe, faz upsert pelos campos enviados.
 */
export const updateTeamMember = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateStaffSchema.parse(data))
  .handler(async ({ data }): Promise<{ success: true }> => {
    await requireServerPermission('team.manage');

    const supabase = createSupabaseAdmin();
    const { profileId, ...rest } = data;

    // ───────────────────────────────────────────
    // 1. Update em profiles (só se há campos)
    // ───────────────────────────────────────────
    const profileUpdates: Record<string, unknown> = {};
    if (rest.fullName !== undefined) profileUpdates.full_name = rest.fullName;
    if (rest.phone !== undefined) profileUpdates.phone = rest.phone;
    if (rest.role !== undefined) profileUpdates.role = rest.role;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', profileId);

      if (profileError) {
        console.error('[updateTeamMember] profile error:', profileError);
        throw new Error('Erro ao atualizar dados do perfil');
      }
    }

    // ───────────────────────────────────────────
    // 2. Update/Insert em staff (só se aplicável)
    // ───────────────────────────────────────────
    const staffUpdates: Record<string, unknown> = {};
    if (rest.specialty !== undefined) staffUpdates.specialty = rest.specialty;
    if (rest.bio !== undefined) staffUpdates.bio = rest.bio;
    if (rest.commissionRate !== undefined)
      staffUpdates.commission_rate = rest.commissionRate;
    if (rest.isBookable !== undefined) staffUpdates.is_bookable = rest.isBookable;
    if (rest.displayOrder !== undefined)
      staffUpdates.display_order = rest.displayOrder;

    if (Object.keys(staffUpdates).length > 0) {
      // Verifica se já existe registro em staff
      const { data: existing } = await supabase
        .from('staff')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existing) {
        const { error: staffError } = await supabase
          .from('staff')
          .update(staffUpdates)
          .eq('profile_id', profileId);

        if (staffError) {
          console.error('[updateTeamMember] staff update error:', staffError);
          throw new Error('Erro ao atualizar dados profissionais');
        }
      } else {
        // Não existe — cria novo registro
        const { error: staffError } = await supabase.from('staff').insert({
          profile_id: profileId,
          ...staffUpdates,
        });

        if (staffError) {
          console.error('[updateTeamMember] staff insert error:', staffError);
          throw new Error('Erro ao criar registro profissional');
        }
      }
    }

    return { success: true };
  });
