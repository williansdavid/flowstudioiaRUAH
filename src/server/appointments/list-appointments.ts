import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireServerPermission } from "@/lib/auth/server-guards";
import {
  APPOINTMENT_SELECT,
  listAppointmentsInputSchema,
  mapAppointmentRow,
  mapPgError,
  parseInput,
  type AppointmentJoinedRow,
  type ListAppointmentsInput,
} from "./_shared";
import type { AdminAppointmentItem } from "@/features/appointments/types";

/**
 * Lista agendamentos visiveis ao usuario, filtrados por range de data.
 *
 * INPUT (obrigatorio):
 *   { from: ISO, to: ISO, staffId?: UUID }
 *
 * - Requer permissao "appointments.view" (admin + staff).
 * - Filtra: starts_at >= from AND starts_at < to (half-open).
 * - Ordena por starts_at ASC (cronologico â€” melhor pra calendario e lista).
 * - RLS aplica isolamento:
 *    - admin: ve todos no range
 *    - staff: ve apenas os proprios no range
 *
 * @example
 *   listAppointments({ data: { from: "2026-05-25T00:00:00Z", to: "2026-05-26T00:00:00Z" } })
 */
export const listAppointments = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => parseInput(listAppointmentsInputSchema, data))
  .handler(async ({ data }): Promise<AdminAppointmentItem[]> => {
    await requireServerPermission("appointments.view");

    const input: ListAppointmentsInput = data;
    const supabase = createSupabaseServer();

    let query = supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .gte("starts_at", input.from)
      .lt("starts_at", input.to)
      .order("starts_at", { ascending: true });

    if (input.staffId) {
      query = query.eq("staff_id", input.staffId);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("[listAppointments] supabase error:", error);
      throw new Error(mapPgError(error));
    }

    const joinedRows = (rows ?? []) as unknown as AppointmentJoinedRow[];
    return joinedRows.map(mapAppointmentRow);
  });
