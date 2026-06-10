// src/features/appointments/types.ts

export interface AppointmentItem {
  id: string;
  startsAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  staffId: string;
  staffName: string;
}
