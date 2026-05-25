import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { requireServerPermission } from '@/lib/auth/server-guards';
import { generateTempPassword, mapAuthAdminError } from './_shared';


// --------------------------------------------
// Schema de entrada
// --------------------------------------------
const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  fullName: z.string().trim().min(2, 'Nome muito curto').max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  role: z.enum(['admin', 'staff']),
  specialty: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  commissionRate: z.coerce
    .number()
    .min(0, 'Comissão não pode ser negativa')
    .max(100, 'Comissão não pode passar de 100%')
    .optional(),
  isBookable: z.boolean().default(true),
});

export type CreateStaffInput = z.input<typeof createStaffSchema>;

export type CreateStaffResult = {
  profileId: string;
  email: string;
  tempPassword: string;
};

/**
 * Cria um novo membro (admin ou staff).
 *
 * Fluxo:
 *  1. Cria usuário no auth.users (email_confirm: true)
 *  2. Trigger handle_new_user cria profile com role='client' default
 *  3. UPDATE profile → role + full_name + phone
 *  4. (Se role=staff) INSERT em staff com specialty/commission/etc
 *
 * Em caso de erro depois do passo 1, faz rollback deletando o auth user.
 */
export const createTeamMember = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createStaffSchema.parse(data))
  .handler(async ({ data }): Promise<CreateStaffResult> => {
    await requireServerPermission('team.manage');

    const supabase = createSupabaseAdmin();
    const tempPassword = generateTempPassword();

    // ───────────────────────────────────────────
    // 1. Criar usuário no Supabase Auth
    // ───────────────────────────────────────────
    const { data: created, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
        },
      });

    if (authError || !created?.user) {
      console.error('[createTeamMember] auth.admin.createUser falhou:', authError);
      throw new Error(mapAuthAdminError(authError?.message));
    }

    const newUserId = created.user.id;

    try {
      // ─────────────────────────────────────────
      // 2. Atualizar profile criado pelo trigger
      // ─────────────────────────────────────────
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone ?? null,
          role: data.role,
        })
        .eq('id', newUserId);

      if (profileError) {
        console.error('[createTeamMember] update profile falhou:', profileError);
        throw new Error('Erro ao configurar o perfil do novo membro');
      }

      // ─────────────────────────────────────────
      // 3. Se for staff, criar registro em staff
      //    (admin não precisa de registro em staff)
      // ─────────────────────────────────────────
      if (data.role === 'staff') {
        const { error: staffError } = await supabase.from('staff').insert({
          profile_id: newUserId,
          specialty: data.specialty ?? null,
          commission_rate: data.commissionRate ?? 0,
          is_bookable: data.isBookable,
        });

        if (staffError) {
          console.error('[createTeamMember] insert staff falhou:', staffError);
          throw new Error('Erro ao criar registro profissional');
        }
      }

      return {
        profileId: newUserId,
        email: data.email,
        tempPassword,
      };
    } catch (err) {
      // ─────────────────────────────────────────
      // ROLLBACK: deletar o auth user criado
      // ─────────────────────────────────────────
      console.warn('[createTeamMember] rollback: deletando auth user', newUserId);
      await supabase.auth.admin.deleteUser(newUserId).catch((rollbackErr) => {
        console.error('[createTeamMember] rollback falhou:', rollbackErr);
      });
      throw err;
    }
  });
