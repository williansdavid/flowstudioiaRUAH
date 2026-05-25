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
 * Regras importantes:
 * - `admin` herda permissões de `staff` (matriz explícita, sem herança implícita).
 * - Permissões com sufixo `.own` indicam ESCOPO DE DADOS, não acesso à tela.
 *   O filtro "próprios" é aplicado na camada de query (Supabase), não aqui.
 */

export type Permission =
  // Dashboard
  | 'dashboard.view'

  // Agendamentos
  | 'appointments.view'
  | 'appointments.manage'

  // Clientes
  | 'clients.view'
  | 'clients.manage'

  // Serviços
  | 'services.view'
  | 'services.manage'

  // Financeiro
  | 'finance.view'         // ADM: vê tudo
  | 'finance.view_own'     // STAFF: vê só comissões próprias
  | 'finance.manage'

  // WhatsApp / IA
  | 'whatsapp.view'
  | 'whatsapp.manage'

  // Equipe (gerenciar membros)
  | 'team.manage'

  // Perfil próprio (STAFF edita o próprio cadastro)
  | 'profile.edit_own'

  // Configurações do studio
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
    'finance.view_own',
    'finance.manage',
    'whatsapp.view',
    'whatsapp.manage',
    'team.manage',
    'profile.edit_own',
    'settings.manage',
  ],
  staff: [
    'dashboard.view',
    'appointments.view',
    'appointments.manage', // filtro "próprios" aplicado na query
    'clients.view',
    'clients.manage',
    'services.view',       // só leitura — UI esconde botões de manage
    'finance.view_own',    // só comissões próprias
    'profile.edit_own',    // edita o próprio cadastro de staff
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
