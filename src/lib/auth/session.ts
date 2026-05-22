import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import type { AppRole, SessionUser } from './types';
import { userHasPermission, type Permission } from './permissions';

// Re-export dos tipos para manter compatibilidade com imports existentes
export type { AppRole, SessionUser };

// ============================================================
// Server Function — RPC bridge segura entre client e server
// ============================================================

/**
 * Busca o usuário autenticado + profile a partir dos cookies SSR.
 * Retorna `null` se não houver sessão válida ou se o usuário estiver inativo.
 *
 * - No SSR: executa direto no servidor.
 * - No client: vira chamada RPC via TanStack Start.
 */
export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    const { loadSessionFromRequest } = await import('./session.server');
    return loadSessionFromRequest();
  },
);

/**
 * Exige sessão válida. Lança se não houver.
 * Útil em loaders de rotas protegidas.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

// ============================================================
// Role helpers — puros, isomorphic (rodam client e server)
// ============================================================

export function hasRole(user: SessionUser | null, role: AppRole): boolean {
  if (!user || !user.role) return false;
  return user.role === role;
}

export function hasAnyRole(
  user: SessionUser | null,
  roles: AppRole[],
): boolean {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'admin');
}

export function isStaff(user: SessionUser | null): boolean {
  return hasAnyRole(user, ['admin', 'staff']);
}

export function isClient(user: SessionUser | null): boolean {
  return hasRole(user, 'client');
}

// ============================================================
// Route guards — bloqueiam acesso no beforeLoad
// ============================================================

/**
 * Guard de rota: exige que o usuário tenha uma das roles permitidas.
 * - Sem sessão → /login
 * - Com sessão mas sem role permitida → /403
 */
export function requireRole(
  user: SessionUser | null,
  roles: AppRole[],
): asserts user is SessionUser {
  if (!user) {
    throw redirect({ to: '/login' });
  }
  if (!user.role || !roles.includes(user.role)) {
    throw redirect({ to: '/403' });
  }
}

/**
 * Guard de rota: exige que o usuário tenha a permissão informada.
 * - Sem sessão → /login
 * - Com sessão mas sem permissão → /403
 *
 * @example
 * beforeLoad: ({ context }) => {
 *   requirePermission(context.user, 'finance.view');
 * }
 */
export function requirePermission(
  user: SessionUser | null,
  permission: Permission,
): asserts user is SessionUser {
  if (!user) {
    throw redirect({ to: '/login' });
  }
  if (!userHasPermission(user, permission)) {
    throw redirect({ to: '/403' });
  }
}
