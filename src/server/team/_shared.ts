/**
 * Helpers específicos da feature "team".
 *
 * Para guards genéricos (requireServerPermission), use:
 *   import { requireServerPermission } from '@/lib/auth/server-guards';
 */

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

  if (
    lower.includes('already registered') ||
    lower.includes('already been registered')
  ) {
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
