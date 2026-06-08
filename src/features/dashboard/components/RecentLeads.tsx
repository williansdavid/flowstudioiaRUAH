import { UserPlus } from 'lucide-react';
import type { DashboardLeadItem } from '@/features/dashboard/types';

const STATUS_LABEL: Record<DashboardLeadItem['status'], string> = {
  new: 'Novo',
  contacted: 'Contatado',
  scheduled: 'Agendado',
  converted: 'Convertido',
  lost: 'Perdido',
};

interface Props {
  items: DashboardLeadItem[];
}

export function RecentLeads({ items }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">Leads recentes</h2>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum lead pendente.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <UserPlus className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.name}</p>
                <p className="truncate text-xs text-muted-foreground">{l.phone}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {STATUS_LABEL[l.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
