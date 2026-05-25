/**
 * Types compartilhados da feature "team".
 *
 * Re-exportamos tipos das server functions para que componentes
 * não precisem importar de @/server/* (que é server-only).
 */

export type { TeamMember } from '@/server/team/list-staff';
export type {
  CreateStaffInput,
  CreateStaffResult,
} from '@/server/team/create-staff';
export type { UpdateStaffInput } from '@/server/team/update-staff';

/**
 * Filtro de status pra UI (lista de membros).
 */
export type TeamMemberStatusFilter = 'all' | 'active' | 'inactive';

/**
 * Filtro de role pra UI (lista de membros).
 */
export type TeamMemberRoleFilter = 'all' | 'admin' | 'staff';

/**
 * Estado consolidado dos filtros da página de equipe.
 */
export type TeamFilters = {
  search: string;
  status: TeamMemberStatusFilter;
  role: TeamMemberRoleFilter;
};

export const DEFAULT_TEAM_FILTERS: TeamFilters = {
  search: '',
  status: 'all',
  role: 'all',
};
