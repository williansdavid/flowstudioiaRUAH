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

  const totalRevenue = items.reduce((sum, i) => sum + i.revenue, 0);
  const totalCommission = items.reduce((sum, i) => sum + i.commission, 0);

  return (
    <div className="rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Faturamento e comissão por profissional</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-slate-700/20 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              <th className="pb-2 pr-3">Profissional</th>
              <th className="pb-2 pr-3 text-right">Atendimentos</th>
              <th className="pb-2 pr-3 text-right">Valor recebido</th>
              <th className="pb-2 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/10">
            {items.map((item) => (
              <tr key={item.staffId}>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.staffColor ?? '#94a3b8' }}
                      aria-hidden
                    />
                    <span className="truncate font-medium text-slate-200">{item.staffName}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-right text-slate-400">{item.appointmentsCount}</td>
                <td className="py-3 pr-3 text-right font-semibold text-slate-100">
                  {brl.format(item.revenue)}
                </td>
                <td className="py-3 text-right">
                  <span className="font-semibold text-orange-400">{brl.format(item.commission)}</span>
                  <span className="ml-1 text-xs text-slate-500">({item.commissionRate}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700/20 font-semibold">
              <td className="pt-3 pr-3 text-slate-300">Total</td>
              <td className="pt-3 pr-3 text-right text-slate-400">
                {items.reduce((sum, i) => sum + i.appointmentsCount, 0)}
              </td>
              <td className="pt-3 pr-3 text-right text-slate-100">{brl.format(totalRevenue)}</td>
              <td className="pt-3 text-right text-orange-400">{brl.format(totalCommission)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
