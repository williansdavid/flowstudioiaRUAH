import type { AppRole, SessionUser } from './types';

/**
 * ============================================
 * Permissions — Catálogo central de permissões
 * ============================================
 *
 * Define QUEM pode acessar O QUÊ no painel admin.
 * Fonte única de verdade — usada por:
 *  - Guards de rota (beforeLoad)
 *  - Filtro de navegação (sidebar)
 *  - Renderização condicional de UI
 *
 * Regra: `admin` herda todas as permissões de `staff`.
 */

export type Permission =
  | 'dashboard.view'
  | 'appointments.view'
  | 'appointments.manage'
  | 'clients.view'
  | 'clients.manage'
  | 'services.view'
  | 'services.manage'
  | 'finance.view'
  | 'finance.manage'
  | 'whatsapp.view'
  | 'whatsapp.manage'
  | 'team.manage'
  | 'settings.manage';

/**
 * Matriz de permissões por role.
 * Adicionar nova permissão? Atualize aqui — único lugar.
 */
const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: [
    'dashboard.view',
    'appointments.view',
    'appointments.manage',
    'clients.view',
    'clients.manage',
    'services.view',
    'services.manage',
    'finance.view',
    'finance.manage',
    'whatsapp.view',
    'whatsapp.manage',
    'team.manage',
    'settings.manage',
  ],
  staff: [
    'dashboard.view',
    'appointments.view',
    'appointments.manage',
    'clients.view',
    'clients.manage',
    'services.view', // staff vê serviços, mas não gerencia
  ],
  client: [
    // Cliente final não acessa /admin (reservado pra área do cliente futura)
  ],
};

/**
 * Verifica se a role possui determinada permissão.
 * Função pura — pode ser usada client e server.
 */
export function roleHasPermission(
  role: AppRole | null,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica se o usuário da sessão tem a permissão.
 * Atalho prático pra usar em componentes.
 */
export function userHasPermission(
  user: SessionUser | null,
  permission: Permission,
): boolean {
  if (!user || !user.role) return false;
  return roleHasPermission(user.role, permission);
}

/**
 * Verifica se o usuário tem TODAS as permissões da lista.
 */
export function userHasAllPermissions(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  if (!user || !user.role) return false;
  return permissions.every((p) => roleHasPermission(user.role!, p));
}

/**
 * Verifica se o usuário tem PELO MENOS UMA das permissões da lista.
 */
export function userHasAnyPermission(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  if (!user || !user.role) return false;
  return permissions.some((p) => roleHasPermission(user.role!, p));
}
