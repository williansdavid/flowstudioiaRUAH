import { cn } from '@/lib/cn';
import type { StaffRevenueItem } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  items: StaffRevenueItem[];
}

export function RevenueByStaffList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-700/20 bg-slate-800/40 text-sm text-slate-500">
        Nenhuma receita por profissional no período
      </div>
    );
  }

  const maxRevenue = Math.max(...items.map((i) => i.revenue));

  return (
    <div className="rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Receita por profissional</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.staffId} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-slate-200">{item.staffName}</span>
              <span className="shrink-0 font-semibold text-slate-100">{brl.format(item.revenue)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/30">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {item.appointmentsCount} atendimento(s) · comissão ({item.commissionRate}%):{' '}
              <span className="font-medium text-orange-400/90">{brl.format(item.commission)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
