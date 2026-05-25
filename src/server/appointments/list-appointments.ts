import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireServerPermission } from "@/lib/auth/server-guards";
import {
  APPOINTMENT_SELECT,
  mapAppointmentRow,
  mapPgError,
  type AppointmentJoinedRow,
} from "./_shared";
import type { AdminAppointmentItem } from "@/features/appointments/types";

/**
 * Lista TODOS os agendamentos visiveis ao usuario.
 *
 * - Requer permissao "appointments.view" (admin + staff).
 * - Ordena por starts_at DESC (mais recentes primeiro).
 * - RLS aplica filtro:
 *    - admin: ve todos
 *    - staff: ve apenas os proprios (staff_id vinculado ao seu profile)
 *    - client: ve apenas os proprios (esta rota nao e chamada por client)
 */
export const listAppointments = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminAppointmentItem[]> => {
    await requireServerPermission("appointments.view");

    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .order("starts_at", { ascending: false });

    if (error) {
      console.error("[listAppointments] supabase error:", error);
      throw new Error(mapPgError(error));
    }

    const rows = (data ?? []) as unknown as AppointmentJoinedRow[];
    return rows.map(mapAppointmentRow);
  },
);