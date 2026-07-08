// src/features/appointments/components/BookingWizard/BookingWizard.types.ts
export type WizardStep = 'client' | 'service' | 'professional' | 'dateSlots';

export const STEP_LABELS: Record<WizardStep, string> = {
  client: 'Cliente',
  service: 'Serviço',
  professional: 'Profissional',
  dateSlots: 'Data e horário',
};

export const STEP_ORDER: WizardStep[] = ['client', 'service', 'professional', 'dateSlots'];

export interface WizardSelection {
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  staffColor: string | null;
  date: string; // YYYY-MM-DD
  slotStartsAt: string; // ISO
  slotEndsAt: string; // ISO
}