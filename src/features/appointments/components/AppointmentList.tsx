import { useMemo } from "react";
import { Calendar, Clock, User } from "lucide-react";
import type {
  AdminAppointmentItem,
  AppointmentFilters,
} from "../types";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface AppointmentListProps {
  appointments: AdminAppointmentItem[] | undefined;
  isLoading: boolean;
  error: unknown;
  filters: AppointmentFilters;
}

/**
 * Lista de agendamentos com filtragem client-side.
 * Estados:
 *  - loading: skeleton
 *  - error:   mensagem + retry suggestion
 *  - empty:   estado vazio contextual (sem dados / sem filtro match)
 *  - data:    lista mobile-first responsiva
 */
export function AppointmentList({
  appointments,
  isLoading,
  error,
  filters,
}: AppointmentListProps) {
  const filtered = useMemo(() => {
    if (!appointments) return [];

    const search = filters.search.trim().toLowerCase();

    return appointments.filter((a) => {
      // Status filter
      if (filters.status !== "all" && a.status !== filters.status) {
        return false;
      }

      // Search filter (cliente / staff / servico)
      if (search.length > 0) {
        const haystack = [
          a.clientName,
          a.staffName,
          a.serviceName,
          a.clientPhone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [appointments, filters]);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      >
        Erro ao carregar agendamentos. Tente recarregar a pagina.
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-neutral-400" aria-hidden />
        <p className="mt-3 text-sm font-medium text-neutral-900">
          Nenhum agendamento cadastrado
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Os agendamentos aparecerao aqui assim que forem criados.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <p className="text-sm font-medium text-neutral-900">
          Nenhum agendamento encontrado
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Tente ajustar os filtros de busca.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {filtered.map((a) => (
        <AppointmentRow key={a.id} appointment={a} />
      ))}
    </ul>
  );
}

// --------------------------------------------
// Subcomponente: linha individual
// --------------------------------------------
interface AppointmentRowProps {
  appointment: AdminAppointmentItem;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const moneyFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function AppointmentRow({ appointment }: AppointmentRowProps) {
  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Bloco principal */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-neutral-900">
              {appointment.clientName}
            </h3>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <p className="mt-1 truncate text-sm text-neutral-700">
            {appointment.serviceName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {dateFmt.format(start)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {timeFmt.format(start)} - {timeFmt.format(end)}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden />
              {appointment.staffName}
            </span>
          </div>
        </div>

        {/* Preco */}
        <div className="text-right sm:min-w-[6rem]">
          <p className="text-sm font-semibold text-neutral-900">
            {moneyFmt.format(appointment.price)}
          </p>
        </div>
      </div>
    </li>
  );
}