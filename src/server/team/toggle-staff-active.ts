import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { requireServerPermission } from './_shared';

const toggleSchema = z.object({
  profileId: z.string().uuid(),
  isActive: z.boolean(),
});

/**
 * Ativa/desativa um membro da equipe (soft-delete).
 *
 * - NÃO deleta do auth.users (preserva FKs em appointments, finance, etc).
 * - Bloqueia o login via check em requireSession (profile.is_active).
 * - Reversível: basta passar isActive=true.
 *
 * IMPORTANTE: impede admin de desativar a si próprio.
 */
export const toggleTeamMemberActive = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => toggleSchema.parse(data))
  .handler(async ({ data }): Promise<{ success: true }> => {

    const currentUser = await requireServerPermission('team.manage');

    // Trava: admin não pode desativar a si mesmo
    if (data.profileId === currentUser.id && !data.isActive) {
      throw new Error('Você não pode desativar a si mesmo');
    }

    const supabase = createSupabaseAdmin();

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: data.isActive })
      .eq('id', data.profileId);

    if (error) {
      console.error('[toggleTeamMemberActive] erro:', error);
      throw new Error('Não foi possível atualizar o status do membro');
    }

    return { success: true };
  });
