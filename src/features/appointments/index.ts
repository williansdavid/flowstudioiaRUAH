// src/features/appointments/index.ts
export { getTodayAppointments } from './server/getTodayAppointments';
export {
  updateAppointmentStatus,
  type UpdateAppointmentStatusInput,
} from './server/updateAppointmentStatus';
export { useUpdateAppointmentStatus } from './hooks';
export { AppointmentsList } from './components/AppointmentsList';
export type { AppointmentItem } from './types';