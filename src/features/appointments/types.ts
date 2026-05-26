/**
 * ============================================
 * Appointments - types da feature
 * ============================================
 *
 * Shape camelCase consumido pela UI.
 * Mappers (server side) convertem dos rows snake_case do Supabase.
 *
 * Inputs de mutation sao reexportados de @/server/appointments/_shared
 * (single source of truth = schema Zod).
 */

import type { Tables } from "@/lib/supabase/types";

// --------------------------------------------
// INPUTS de mutation/query (Zod-inferred, server-side)
// --------------------------------------------
export type {
  CreateAppointmentInput,
  ListAppointmentsInput,
} from "@/server/appointments/_shared";

/**
 * Status canonico do agendamento (espelha o enum `appointment_status` do banco).
 */
export type AppointmentStatus = Tables<"appointments">["status"];

/**
 * Origem do cliente vinculado ao agendamento.
 * (espelha ClientOrigin de @/features/clients/types)
 */
type AppointmentClientOrigin = "account" | "walkin";

/**
 * Shape camelCase consumido pela area admin.
 * Inclui dados consolidados de cliente / staff / servico (via join).
 */
export interface AdminAppointmentItem {
  // Campos diretos da tabela appointments
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startsAt: string;             // ISO timestamptz
  endsAt: string;               // ISO timestamptz
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;

  // Dados consolidados via join
  clientName: string;
  clientPhone: string | null;
  clientOrigin: AppointmentClientOrigin;

  staffName: string;

  serviceName: string;
  serviceDurationMinutes: number;
}

// --------------------------------------------
// FILTROS - state local da UI
// --------------------------------------------
export type AppointmentStatusFilter = AppointmentStatus | "all";

export interface AppointmentFilters {
  search: string;
  status: AppointmentStatusFilter;
}

export const DEFAULT_APPOINTMENT_FILTERS: AppointmentFilters = {
  search: "",
  status: "all",
};
