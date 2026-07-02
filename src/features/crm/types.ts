import type { AppointmentItem } from '@/features/appointments/types';

export type TaskType = 'pending_past' | 'to_confirm' | 'no_show' | 'birthday' | 'remarketing';

export interface TaskItem {
  id: string;
  type: TaskType;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  title: string;
  description: string;
  date?: string;
  value?: number;
  referenceId?: string;
  appointment?: AppointmentItem;
  // Campos extraídos do appointment para os cards (sem dependência direta)
  serviceName?: string;
  staffName?: string;
  time?: string;
  scheduledTime?: string;
}