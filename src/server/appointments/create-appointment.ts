import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireServerPermission } from "@/lib/auth/server-guards";
import {
  APPOINTMENT_SELECT,
  createAppointmentInputSchema,
  isOverlapError,
  mapAppointmentRow,
  mapPgError,
  OVERLAP_ERROR_MESSAGE,
  type AppointmentJoinedRow,
} from "./_shared";
import type { AdminAppointmentItem } from "@/features/appointments/types";

/**
 * ============================================
 * createAppointment
 * ============================================
 *
 * Cria um novo agendamento.
 *
 * Permissao:
 *  - "appointments.manage" (admin + staff).
 *
 * Regras de negocio:
 *  - Admin pode criar para qualquer staff.
 *  - Staff so pode criar com staff_id = staff proprio (validacao defensiva,
 *    alem da RLS).
 *  - endsAt e calculado a partir de services.duration_minutes.
 *  - price default = services.price (override opcional via input.priceOverride).
 *  - status default = "confirmed".
 *
 * Erros tratados:
 *  - FORBIDDEN              -> sem permissao
 *  - "Servico nao encontrado ou inativo"
 *  - "Voce so pode criar agendamentos para si mesmo" (staff tentando burlar)
 *  - OVERLAP_ERROR_MESSAGE  -> conflito de horario (constraint EXCLUDE)
 *  - mapPgError(error)      -> outros erros do banco
 */
export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createAppointmentInputSchema.parse(data))
  .handler(async ({ data: input }): Promise<AdminAppointmentItem> => {
    const user = await requireServerPermission("appointments.manage");
    const supabase = createSupabaseServer();

    // ----------------------------------------
    // 1) Se for staff, garantir que staffId pertence ao usuario logado
    // ----------------------------------------
    if (user.role === "staff") {
      const { data: ownStaff, error: staffErr } = await supabase
        .from("staff")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (staffErr) {
        console.error("[createAppointment] staff lookup error:", staffErr);
        throw new Error(mapPgError(staffErr));
      }
      if (!ownStaff) {
        throw new Error("Perfil de profissional nao encontrado");
      }
      if (ownStaff.id !== input.staffId) {
        throw new Error("Voce so pode criar agendamentos para si mesmo");
      }
    }

    // ----------------------------------------
    // 2) Buscar servico (duration + price) — falha cedo se inativo/inexistente
    // ----------------------------------------
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("id, duration_minutes, price, is_active")
      .eq("id", input.serviceId)
      .maybeSingle();

    if (serviceErr) {
      console.error("[createAppointment] service lookup error:", serviceErr);
      throw new Error(mapPgError(serviceErr));
    }
    if (!service || !service.is_active) {
      throw new Error("Servico nao encontrado ou inativo");
    }

    // ----------------------------------------
    // 3) Calcular endsAt (UTC ISO)
    // ----------------------------------------
    const startsAtMs = new Date(input.startsAt).getTime();
    const endsAtMs = startsAtMs + service.duration_minutes * 60 * 1000;
    const endsAtIso = new Date(endsAtMs).toISOString();
    const startsAtIso = new Date(startsAtMs).toISOString();

    // ----------------------------------------
    // 4) Resolver preco (override > preco do servico)
    // ----------------------------------------
    const finalPrice =
      input.priceOverride !== null && input.priceOverride !== undefined
        ? input.priceOverride
        : Number(service.price ?? 0);

    // ----------------------------------------
    // 5) Insert
    // ----------------------------------------
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        client_id: input.clientId,
        staff_id: input.staffId,
        service_id: input.serviceId,
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        status: input.status,
        price: finalPrice,
        notes: input.notes,
      })
      .select(APPOINTMENT_SELECT)
      .single();

    if (error || !data) {
      console.error("[createAppointment] insert error:", error);
      if (isOverlapError(error)) {
        throw new Error(OVERLAP_ERROR_MESSAGE);
      }
      throw new Error(mapPgError(error));
    }

    return mapAppointmentRow(data as unknown as AppointmentJoinedRow);
  });
