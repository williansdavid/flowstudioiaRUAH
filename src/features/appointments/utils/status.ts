import type { AppointmentStatus } from '../types';

/**
 * Mapa de status -> label PT-BR pra UI.
 */
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

/**
 * Mapa de status -> variante visual do Badge.
 *
 * Convenção (alinhada com o design system do projeto):
 *  - warning  -> pending
 *  - info     -> confirmed
 *  - success  -> completed
 *  - neutral  -> cancelled
 *  - danger   -> no_show
 *
 * Componente `AppointmentStatusBadge` consome esse mapa.
 */
export const APPOINTMENT_STATUS_VARIANT: Record<
  AppointmentStatus,
  'warning' | 'info' | 'success' | 'neutral' | 'danger'
> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'neutral',
  no_show: 'danger',
};

/**
 * Lista ordenada de status pra exibir em selects/filtros.
 * Ordem reflete fluxo natural: ativos primeiro, finais depois.
 */
export const APPOINTMENT_STATUS_OPTIONS: ReadonlyArray<{
  value: AppointmentStatus;
  label: string;
}> = [
  { value: 'pending', label: APPOINTMENT_STATUS_LABEL.pending },
  { value: 'confirmed', label: APPOINTMENT_STATUS_LABEL.confirmed },
  { value: 'completed', label: APPOINTMENT_STATUS_LABEL.completed },
  { value: 'cancelled', label: APPOINTMENT_STATUS_LABEL.cancelled },
  { value: 'no_show', label: APPOINTMENT_STATUS_LABEL.no_show },
];

/**
 * Status considerados "ativos" (ocupam slot na agenda).
 * Alinhado com a constraint EXCLUDE do banco:
 *   no_overlap_per_staff WHERE status NOT IN ('cancelled', 'no_show')
 */
export const ACTIVE_APPOINTMENT_STATUSES: ReadonlySet<AppointmentStatus> =
  new Set(['pending', 'confirmed', 'completed']);

export function isActiveAppointmentStatus(status: AppointmentStatus): boolean {
  return ACTIVE_APPOINTMENT_STATUSES.has(status);
}