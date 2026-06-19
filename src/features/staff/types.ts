// src/features/staff/types.ts
export type { WorkingHours, DaySchedule, DayBreak, WeekdayKey } from '@/lib/scheduling/workingHours.schema';

/** Ordem de exibição (segunda-feira primeiro, PT-BR). */
export const WEEKDAY_ORDER = ['1', '2', '3', '4', '5', '6', '0'] as const;

export const WEEKDAY_LABEL: Record<string, string> = {
  '0': 'Domingo',
  '1': 'Segunda',
  '2': 'Terça',
  '3': 'Quarta',
  '4': 'Quinta',
  '5': 'Sexta',
  '6': 'Sábado',
};

// ----------------------------------------------------------------
// Cadastro de profissional (CRUD staff / create)
// Fonte única de verdade = schema Zod em server/createStaff.ts.
// ----------------------------------------------------------------
export type { CreateStaffInput as CreateStaffFormValues } from './server/createStaff';
export type { UpdateStaffInput } from './server/updateStaff';

/** Item da listagem de equipe (admin). */
export interface StaffListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  avatarUrl: string | null;
  isBookable: boolean;
  displayOrder: number;
  /** Cor de identificação na agenda */
  color: string | null;
  /** true => usuário logado pode editar este profissional (admin OU dono). */
  canEdit: boolean;
  /** false => nunca fez o 1º acesso (last_sign_in_at == null). */
  hasAccess: boolean;
  role: 'admin' | 'staff' | null;
  isArchived: boolean;
}