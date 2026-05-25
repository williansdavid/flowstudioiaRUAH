import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import type { ClientFilters, ClientOriginFilter } from '../types';

interface ClientsFiltersBarProps {
  filters: ClientFilters;
  onChange: (filters: ClientFilters) => void;
}

export function ClientsFiltersBar({
  filters,
  onChange,
}: ClientsFiltersBarProps) {
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
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
          aria-label="Buscar clientes"
        />
      </div>

      {/* Origem */}
      <select
        value={filters.origin}
        onChange={(e) =>
          onChange({
            ...filters,
            origin: e.target.value as ClientOriginFilter,
          })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por origem"
      >
        <option value="all">Todas as origens</option>
        <option value="account">Com conta</option>
        <option value="walkin">Walk-in</option>
      </select>
    </div>
  );
}
