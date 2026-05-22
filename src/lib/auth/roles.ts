import type { AppRole } from './session';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  staff: 'Profissional',
  client: 'Cliente',
};

export function getRoleLabel(role: AppRole | null): string {
  if (!role) return 'Sem permissão';
  return ROLE_LABELS[role] ?? 'Desconhecido';
}