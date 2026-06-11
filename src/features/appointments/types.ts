// src/features/appointments/types.ts

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AppointmentItem {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  price: number;
  notes: string | null;
}

export interface BookableStaffItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
}
