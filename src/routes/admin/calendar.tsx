import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { List } from "lucide-react";

import { requirePermission } from "@/lib/auth/session";
import {
  getDayRange,
  getWeekRange,
  parseISODate,
  toISODate,
} from "@/lib/date";
import { Button } from "@/components/ui";

import { useAppointments } from "@/features/appointments/hooks";
import { appointmentsListQuery } from "@/features/appointments/queries";

import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { DayView } from "@/features/calendar/components/DayView";
import { WeekView } from "@/features/calendar/components/WeekView";
import type { CalendarView } from "@/features/calendar/types";

// ============================================
// Search params schema
// ============================================

const calendarSearchSchema = z.object({
  view: z.enum(["day", "week"]).catch("day").default("day"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD")
    .optional(),
});

type CalendarSearch = z.infer<typeof calendarSearchSchema>;

// ============================================
// Helpers
// ============================================

/**
 * Resolve a data efetiva da rota:
 *  - Se search.date veio na URL, parseia (local).
 *  - Caso contrario, usa hoje 00:00 local.
 */
function resolveCurrentDate(search: CalendarSearch): Date {
  if (search.date) {
    return parseISODate(search.date);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calcula o range (dia ou semana) que sera usado pelo loader e pelo hook.
 * MESMO range nos dois lados garante cache hit.
 */
function resolveRange(date: Date, view: CalendarView) {
  return view === "day" ? getDayRange(date) : getWeekRange(date);
}

// ============================================
// Route definition
// ============================================

export const Route = createFileRoute("/admin/calendar")({
  validateSearch: calendarSearchSchema,

  beforeLoad: ({ context }) => {
    requirePermission(context.user, "appointments.view");
  },

  loaderDeps: ({ search }) => ({
    view: search.view,
    date: search.date,
  }),

  loader: ({ context, deps }) => {
    const currentDate = resolveCurrentDate(deps as CalendarSearch);
    const range = resolveRange(currentDate, deps.view);
    return context.queryClient.ensureQueryData(appointmentsListQuery(range));
  },

  component: CalendarRouteComponent,
});

// ============================================
// Component
// ============================================

function CalendarRouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Date local derivada dos search params
  const currentDate = useMemo(() => resolveCurrentDate(search), [search]);

  // Range estavel — bate com o cache do loader
  const range = useMemo(
    () => resolveRange(currentDate, search.view),
    [currentDate, search.view],
  );

  const { data, isLoading, error } = useAppointments(range);

  // ============================================
  // Handlers (atualizam URL via search params)
  // ============================================

  const handleViewChange = (next: CalendarView) => {
    navigate({
      search: (prev) => ({ ...prev, view: next }),
      replace: true,
    });
  };

  const handleDateChange = (next: Date) => {
    navigate({
      search: (prev) => ({ ...prev, date: toISODate(next) }),
      replace: true,
    });
  };

  // ============================================
  // Click handlers (placeholders — fase 8.5)
  // ============================================

  const handleAppointmentClick = (positioned: { appointment: { id: string } }) => {
    // TODO 8.5: abrir modal de detalhes/edicao
    console.log("[calendar] appointment click:", positioned.appointment.id);
  };

  const handleDaySlotClick = (params: { staffId: string; slotIndex: number }) => {
    // TODO 8.5: abrir modal de criacao pre-preenchido
    console.log("[calendar] day slot click:", params);
  };

  const handleWeekSlotClick = (params: { date: Date; slotIndex: number }) => {
    // TODO 8.5: abrir modal de criacao pre-preenchido
    console.log("[calendar] week slot click:", {
      date: params.date.toISOString(),
      slotIndex: params.slotIndex,
    });
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Calendário</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Visualização temporal dos agendamentos.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate({ to: "/admin/appointments" })}
        >
          <List className="mr-2 h-4 w-4" />
          Ver lista
        </Button>
      </div>

      {/* Navegacao + toggle view */}
      <CalendarHeader
        currentDate={currentDate}
        view={search.view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
      />

      {/* Estados */}
      {error && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:px-6"
        >
          Erro ao carregar agendamentos: {error.message}
        </div>
      )}

      {isLoading && !data && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 md:px-6">
          Carregando agendamentos...
        </div>
      )}

      {/* Grid principal */}
      <div className="flex-1 overflow-hidden">
        {search.view === "day" ? (
          <DayView
            date={currentDate}
            appointments={data ?? []}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleDaySlotClick}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            appointments={data ?? []}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleWeekSlotClick}
          />
        )}
      </div>
    </div>
  );
}
