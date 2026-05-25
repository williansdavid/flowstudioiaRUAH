/**
 * Barrel da feature "appointments".
 * Reexporta types publicos e utilitarios usaveis fora do modulo.
 *
 * Componentes sao importados via path explicito:
 *   import { AppointmentList } from "@/features/appointments/components/AppointmentList";
 */
export type {
  AppointmentStatus,
  AppointmentStatusFilter,
  AppointmentFilters,
  AdminAppointmentItem,
  CreateAppointmentInput,
} from "./types";

export {
  DEFAULT_APPOINTMENT_FILTERS,
} from "./types";

export {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_VARIANT,
  APPOINTMENT_STATUS_OPTIONS,
  ACTIVE_APPOINTMENT_STATUSES,
  isActiveAppointmentStatus,
} from "./utils/status";

export { useAppointments, useCreateAppointment } from "./hooks";
export { appointmentsKeys, appointmentsListQuery } from "./queries";
