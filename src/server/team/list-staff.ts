import { createServerFn } from '@tanstack/react-start';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { requireServerPermission } from '@/lib/auth/server-guards';

export type TeamMember = {
  // Profile
  profileId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;

  // Staff (null se for admin sem registro em staff)
  staffId: string | null;
  specialty: string | null;
  bio: string | null;
  commissionRate: number | null;
  isBookable: boolean | null;
  displayOrder: number | null;
};

/**
 * Lista todos os membros da equipe (admin + staff).
 * - Inclui inativos (filtro feito na UI).
 * - Faz join com tabela staff via embedded select.
 * - Ordena por: ativo primeiro, depois display_order do staff, depois nome.
 */
export const listTeamMembers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<TeamMember[]> => {
    await requireServerPermission('team.manage');

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        full_name,
        phone,
        avatar_url,
        role,
        is_active,
        created_at,
        staff:staff!staff_profile_id_fkey (
          id,
          specialty,
          bio,
          commission_rate,
          is_bookable,
          display_order
        )
      `,
      )
      .in('role', ['admin', 'staff'])
      .order('is_active', { ascending: false })
      .order('full_name', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('[listTeamMembers] erro Supabase:', error);
      throw new Error('Não foi possível carregar a equipe');
    }

    return (data ?? []).map((row): TeamMember => {
      // staff vem como array por causa do join — pegamos o primeiro
      const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff;

      return {
        profileId: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        role: row.role as 'admin' | 'staff',
        isActive: row.is_active,
        createdAt: row.created_at,
        staffId: staff?.id ?? null,
        specialty: staff?.specialty ?? null,
        bio: staff?.bio ?? null,
        commissionRate: staff?.commission_rate ?? null,
        isBookable: staff?.is_bookable ?? null,
        displayOrder: staff?.display_order ?? null,
      };
    });
  },
);
