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

function resolveCurrentDate(search: CalendarSearch): Date {
  if (search.date) {
    return parseISODate(search.date);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

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

  const currentDate = useMemo(() => resolveCurrentDate(search), [search]);

  const range = useMemo(
    () => resolveRange(currentDate, search.view),
    [currentDate, search.view],
  );

  const { data, isLoading, error } = useAppointments(range);

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

  const handleAppointmentClick = (positioned: { appointment: { id: string } }) => {
    console.log("[calendar] appointment click:", positioned.appointment.id);
  };

  const handleDaySlotClick = (params: { staffId: string; slotIndex: number }) => {
    console.log("[calendar] day slot click:", params);
  };

  const handleWeekSlotClick = (params: { date: Date; slotIndex: number }) => {
    console.log("[calendar] week slot click:", {
      date: params.date.toISOString(),
      slotIndex: params.slotIndex,
    });
  };

  // ============================================
  // Render
  // ============================================
  //
  // Cadeia de altura (CRÍTICA):
  // <main min-h-0 flex-1 overflow-hidden>
  //   <div h-full max-w-7xl>            ← AdminLayout
  //     <div flex h-full flex-col>      ← AQUI (raiz desta rota)
  //       <PageHeader flex-shrink-0 />
  //       <CalendarHeader flex-shrink-0 />
  //       <ErrorBanner flex-shrink-0 /> (opcional)
  //       <LoadingBanner flex-shrink-0 /> (opcional)
  //       <div flex-1 min-h-0 overflow-hidden>  ← container do grid
  //         <DayView/WeekView h-full />
  //       </div>
  //     </div>
  //   </div>
  // </main>
  //
  // Cada filho fixo (headers, banners) usa flex-shrink-0 para NÃO encolher.
  // O container do grid usa flex-1 + min-h-0 para ocupar o resto e permitir scroll interno.

  return (
    <div className="flex h-full flex-col">
      {/* Page header — não encolhe */}
      <div
        className="flex flex-shrink-0 flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between md:p-6"
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottomColor: "var(--border-default)",
        }}
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--fg-strong)" }}
          >
            Calendário
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
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

      {/* Navegação + toggle view — não encolhe */}
      <div className="flex-shrink-0">
        <CalendarHeader
          currentDate={currentDate}
          view={search.view}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Estados — não encolhem */}
      {error && (
        <div
          role="alert"
          className="flex-shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:px-6"
        >
          Erro ao carregar agendamentos: {error.message}
        </div>
      )}

      {isLoading && !data && (
        <div className="flex-shrink-0 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 md:px-6">
          Carregando agendamentos...
        </div>
      )}

      {/*
        Container do grid:
        - flex-1: ocupa todo espaço restante
        - min-h-0: REGRA DE OURO do flex — permite encolher abaixo do conteúdo
        - overflow-hidden: o scroll real fica DENTRO de DayView/WeekView
      */}
      <div className="min-h-0 flex-1 overflow-hidden">
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
