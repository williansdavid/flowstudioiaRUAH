import { createServerFn } from '@tanstack/react-start';
import type { AppRole, SessionUser } from './types';

// Re-export dos tipos para manter compatibilidade com imports existentes
// (ex.: `import { type SessionUser } from '@/lib/auth/session'`)
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
    // Import dinâmico garante isolamento server-only no bundle.
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

/**
 * Verifica se o usuário possui exatamente a role informada.
 */
export function hasRole(user: SessionUser | null, role: AppRole): boolean {
  if (!user || !user.role) return false;
  return user.role === role;
}

/**
 * Verifica se o usuário possui pelo menos uma das roles.
 */
export function hasAnyRole(
  user: SessionUser | null,
  roles: AppRole[],
): boolean {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

/**
 * Atalho: é admin?
 */
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Atalho: é staff (ou admin, que herda permissões)?
 */
export function isStaff(user: SessionUser | null): boolean {
  return hasAnyRole(user, ['admin', 'staff']);
}

/**
 * Atalho: é client?
 */
export function isClient(user: SessionUser | null): boolean {
  return hasRole(user, 'client');
}

import { redirect } from '@tanstack/react-router';
// ... resto dos imports

/**
 * Guard de rota: exige que o usuário tenha uma das roles permitidas.
 * - Sem sessão → redireciona para /login
 * - Com sessão mas sem role → redireciona para /
 *
 * Uso em `beforeLoad` de rotas protegidas.
 */
export function requireRole(
  user: SessionUser | null,
  roles: AppRole[],
): asserts user is SessionUser {
  if (!user) {
    throw redirect({ to: '/login' });
  }
  if (!user.role || !roles.includes(user.role)) {
    throw redirect({ to: '/' });
  }
}
