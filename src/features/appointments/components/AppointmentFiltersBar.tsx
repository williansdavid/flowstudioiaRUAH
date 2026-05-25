import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import type { AppointmentFilters, AppointmentStatusFilter } from "../types";

interface AppointmentFiltersBarProps {
  filters: AppointmentFilters;
  onChange: (filters: AppointmentFilters) => void;
}

/**
 * Barra de filtros da listagem de agendamentos.
 * Aplica filtragem client-side (sem refetch).
 */
export function AppointmentFiltersBar({
  filters,
  onChange,
}: AppointmentFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Busca */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar por cliente, profissional ou servico..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
          aria-label="Buscar agendamentos"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as AppointmentStatusFilter,
          })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por status"
      >
        <option value="all">Todos os status</option>
        <option value="pending">Pendente</option>
        <option value="confirmed">Confirmado</option>
        <option value="completed">Concluido</option>
        <option value="cancelled">Cancelado</option>
        <option value="no_show">Nao compareceu</option>
      </select>
    </div>
  );
}