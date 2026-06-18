// src/features/appointments/index.ts
export { todayLocalDate } from './utils/todayLocalDate';
export { AppointmentFormModal } from './components/AppointmentFormModal';
export { getDayAppointments, type GetDayAppointmentsInput } from './server/getDayAppointments';
export { listBookableStaff } from './server/listBookableStaff';
export { listActiveServices } from './server/listActiveServices';
export { listClientsForSelect } from './server/listClientsForSelect';
export { createAppointment, type CreateAppointmentInput } from './server/createAppointment';
export { updateAppointment, type UpdateAppointmentInput } from './server/updateAppointment';
export { deleteAppointment, type DeleteAppointmentInput } from './server/deleteAppointment';
export {
  updateAppointmentStatus,
  type UpdateAppointmentStatusInput,
} from './server/updateAppointmentStatus';
export {
  getAvailableSlots,
  type GetAvailableSlotsInput,
  type DaySlots,
  type SlotItem,
} from './server/getAvailableSlots';
export {
  useUpdateAppointmentStatus,
  useAvailableSlots,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
} from './hooks';
export { AppointmentsList } from './components/AppointmentsList';
export type {
  AppointmentItem,
  AppointmentStatus,
  BookableStaffItem,
  ServiceOption,
  ClientOption,
} from './types';