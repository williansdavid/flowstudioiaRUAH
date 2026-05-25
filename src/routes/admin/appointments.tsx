import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { Button } from "@/components/ui";

import { useAppointments } from "@/features/appointments/hooks";
import { appointmentsListQuery } from "@/features/appointments/queries";
import { DEFAULT_APPOINTMENT_FILTERS } from "@/features/appointments/types";
import type { AppointmentFilters } from "@/features/appointments/types";

import { AppointmentFiltersBar } from "@/features/appointments/components/AppointmentFiltersBar";
import { AppointmentList } from "@/features/appointments/components/AppointmentList";
import { AppointmentFormDialog } from "@/features/appointments/components/AppointmentFormDialog";

export const Route = createFileRoute("/admin/appointments")({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, "appointments.view");
  },
  loader: ({ context }) => {
    // SSR prefetch — popula o cache antes do componente renderizar
    return context.queryClient.ensureQueryData(appointmentsListQuery());
  },
  component: AppointmentsRouteComponent,
});

function AppointmentsRouteComponent() {
  const { data, isLoading, error } = useAppointments();

  const [filters, setFilters] = useState<AppointmentFilters>(
    DEFAULT_APPOINTMENT_FILTERS,
  );
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Visualize e gerencie a agenda do studio.
          </p>
        </div>

        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
      </div>

      {/* Filtros */}
      <AppointmentFiltersBar filters={filters} onChange={setFilters} />

      {/* Lista */}
      <AppointmentList
        appointments={data}
        isLoading={isLoading}
        error={error}
        filters={filters}
      />

      {/* Dialog de criacao */}
      <AppointmentFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
      />
    </div>
  );
}
