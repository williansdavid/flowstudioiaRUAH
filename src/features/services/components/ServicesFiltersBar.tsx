import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import type { ServiceFilters, ServiceStatusFilter } from '../types';

interface ServicesFiltersBarProps {
  filters: ServiceFilters;
  onChange: (filters: ServiceFilters) => void;
  /** Categorias disponíveis (derivadas da lista). */
  categories: string[];
}

export function ServicesFiltersBar({
  filters,
  onChange,
  categories,
}: ServicesFiltersBarProps) {
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
          placeholder="Buscar por nome ou descrição..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
          aria-label="Buscar serviços"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as ServiceStatusFilter,
          })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por status"
      >
        <option value="all">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>

      {/* Categoria */}
      <select
        value={filters.category}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por categoria"
        disabled={categories.length === 0}
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
