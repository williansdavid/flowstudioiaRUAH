import { requireSession } from './session';
import { userHasPermission, type Permission } from './permissions';
import type { SessionUser } from './types';

/**
 * Guard server-side: garante sessão válida + permissão específica.
 *
 * Uso típico em server functions (createServerFn handler):
 *
 *   export const myServerFn = createServerFn({ method: 'POST' }).handler(
 *     async (input) => {
 *       const user = await requireServerPermission('services.manage');
 *       // ... lógica usando `user` ...
 *     }
 *   );
 *
 * Erros lançados:
 *  - 'UNAUTHORIZED' → sessão ausente/inválida (via requireSession)
 *  - 'FORBIDDEN'    → sessão válida porém sem a permissão
 */
export async function requireServerPermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireSession();
  if (!userHasPermission(user, permission)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}
