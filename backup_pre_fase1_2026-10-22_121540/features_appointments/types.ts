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
  serviceId: string | null;
  serviceName: string;
  services: AppointmentServiceItem[];
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  /** Cor personalizada do staff (do banco) */
  staffColor: string | null;
  price: number;
  notes: string | null;
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

export interface BookableStaffItem {
  id: string;
  name: string;
  displayOrder: number;
  avatarUrl?: string | null;
  /** Cor personalizada do staff (do banco) */
  color: string | null;
}

export interface AppointmentServiceItem {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  quantity: number;
}