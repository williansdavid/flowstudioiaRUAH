import { requireSession } from '@/lib/auth/session';
import { userHasPermission, type Permission } from '@/lib/auth/permissions';
import type { SessionUser } from '@/lib/auth/types';

/**
 * Garante que a sessão é válida E que o usuário tem a permissão informada.
 * Lança erro 'FORBIDDEN' se faltar permissão, 'UNAUTHORIZED' se sem sessão.
 *
 * Uso típico:
 *   const user = await requireServerPermission('team.manage');
 */
export async function requireServerPermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireSession(); // já lança UNAUTHORIZED se null
  if (!userHasPermission(user, permission)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * Gera senha temporária forte (12 chars).
 * Caracteres ambíguos (0, O, 1, l, I) removidos.
 */
export function generateTempPassword(): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Normaliza erro do Supabase Auth Admin pra mensagem amigável.
 */
export function mapAuthAdminError(message: string | undefined): string {
  if (!message) return 'Erro desconhecido na criação do usuário';
  const lower = message.toLowerCase();

  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Este email já está cadastrado';
  }
  if (lower.includes('invalid email')) {
    return 'Email inválido';
  }
  if (lower.includes('password')) {
    return 'Senha inválida (mínimo 6 caracteres)';
  }
  return message;
}
