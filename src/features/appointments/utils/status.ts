import type { BadgeVariant } from "@/components/ui/Badge";
import type { AppointmentStatus } from "../types";

/**
 * Re-export do BadgeVariant do design system.
 * Fonte unica de verdade: src/components/ui/Badge.tsx
 *
 * Mantido como alias semantico para uso na feature appointments.
 */
export type AppointmentStatusBadgeVariant = BadgeVariant;

/**
 * Tokens de cor semantica por status (escala 50-900 do design system).
 * Usado em superficies customizadas (cards, timelines, calendarios)
 * onde Badge nao se aplica.
 */
export interface StatusColorTokens {
  bg: string;
  fg: string;
  border: string;
}

// ============================================================
// LABELS (pt-BR)
// ============================================================

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluido",
  cancelled: "Cancelado",
  no_show: "Nao compareceu",
};

// ============================================================
// VARIANTES DE BADGE (fonte unica para AppointmentStatusBadge)
// ============================================================

export const APPOINTMENT_STATUS_VARIANT: Record<
  AppointmentStatus,
  AppointmentStatusBadgeVariant
> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "muted",
};

// ============================================================
// TOKENS DE COR (para superficies customizadas, ex: calendario)
// ============================================================

export const APPOINTMENT_STATUS_COLOR: Record<
  AppointmentStatus,
  StatusColorTokens
> = {
  pending: {
    bg: "bg-feedback-warning/10",
    fg: "text-feedback-warning",
    border: "border-feedback-warning/30",
  },
  confirmed: {
    bg: "bg-feedback-info/10",
    fg: "text-feedback-info",
    border: "border-feedback-info/30",
  },
  completed: {
    bg: "bg-feedback-success/10",
    fg: "text-feedback-success",
    border: "border-feedback-success/30",
  },
  cancelled: {
    bg: "bg-feedback-error/10",
    fg: "text-feedback-error",
    border: "border-feedback-error/30",
  },
  no_show: {
    bg: "bg-neutral-100",
    fg: "text-neutral-500",
    border: "border-neutral-200",
  },
};

// ============================================================
// OPTIONS (para <Select> de filtros)
// ============================================================

export const APPOINTMENT_STATUS_OPTIONS: ReadonlyArray<{
  value: AppointmentStatus;
  label: string;
}> = [
  { value: "pending", label: APPOINTMENT_STATUS_LABEL.pending },
  { value: "confirmed", label: APPOINTMENT_STATUS_LABEL.confirmed },
  { value: "completed", label: APPOINTMENT_STATUS_LABEL.completed },
  { value: "cancelled", label: APPOINTMENT_STATUS_LABEL.cancelled },
  { value: "no_show", label: APPOINTMENT_STATUS_LABEL.no_show },
] as const;

// ============================================================
// STATUSES ATIVOS (regra de negocio: aparece como "em aberto")
// ============================================================

/**
 * Statuses considerados "ativos" â€” aparecem em listas de
 * agendamentos em aberto, agenda do dia, dashboards, etc.
 */
export const ACTIVE_APPOINTMENT_STATUSES: ReadonlyArray<AppointmentStatus> = [
  "pending",
  "confirmed",
] as const;

/**
 * Type guard â€” retorna true se o status indica agendamento ativo.
 *
 * @example
 *   if (isActiveAppointmentStatus(appointment.status)) {
 *     // mostrar na agenda
 *   }
 */
export function isActiveAppointmentStatus(
  status: AppointmentStatus,
): boolean {
  return ACTIVE_APPOINTMENT_STATUSES.includes(status);
}

// ============================================================
// HELPER (acesso programatico aos tokens de cor)
// ============================================================

export function getStatusColor(status: AppointmentStatus): StatusColorTokens {
  return APPOINTMENT_STATUS_COLOR[status];
}
