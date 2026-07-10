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
  const totalAppointments = items.reduce((sum, i) => sum + i.appointmentsCount, 0);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Faturamento e comissão por profissional</p>

      {/* Mobile: cards empilhados (sem scroll horizontal) */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => {
          const servPct = item.revenueServices > 0
            ? Math.round((item.commissionServices / item.revenueServices) * 100) : 0;
          const prodPct = item.revenueProducts > 0
            ? Math.round((item.commissionProducts / item.revenueProducts) * 100) : 0;

          return (
            <div key={item.staffId} className="rounded-xl border border-slate-700/20 bg-slate-900/30 p-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.staffColor ?? '#94a3b8' }}
                    aria-hidden
                  />
                  <span className="truncate font-medium text-slate-200">{item.staffName}</span>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{item.appointmentsCount} atend.</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Recebido</p>
                  <p className="truncate font-semibold text-slate-100">{brl.format(item.revenue)}</p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Comissão</p>
                  <p className="truncate font-semibold text-orange-400">{brl.format(item.commission)}</p>
                </div>
              </div>

              {item.commissionProducts > 0 || item.commissionServices > 0 ? (
                <div className="mt-2 space-y-1 border-t border-slate-700/10 pt-2 text-xs">
                  {item.commissionServices > 0 ? (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Serviços</span>
                      <span>{brl.format(item.commissionServices)} <span className="text-slate-500">({servPct}%)</span></span>
                    </div>
                  ) : null}
                  {item.commissionProducts > 0 ? (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Produtos</span>
                      <span>{brl.format(item.commissionProducts)} <span className="text-slate-500">({prodPct}%)</span></span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-slate-700/20 pt-3 text-sm font-semibold">
          <span className="text-slate-300">Total</span>
          <span className="text-slate-100">{brl.format(totalRevenue)}</span>
          <span className="text-orange-400">{brl.format(totalCommission)}</span>
        </div>
      </div>

      {/* sm+: tabela */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/20 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              <th className="pb-2 pr-3">Profissional</th>
              <th className="pb-2 pr-3 text-right">Atendimentos</th>
              <th className="pb-2 pr-3 text-right">Valor recebido</th>
              <th className="pb-2 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/10">
            {items.map((item) => {
              const servPct = item.revenueServices > 0
                ? Math.round((item.commissionServices / item.revenueServices) * 100) : 0;
              const prodPct = item.revenueProducts > 0
                ? Math.round((item.commissionProducts / item.revenueProducts) * 100) : 0;

              return (
                <tr key={item.staffId}>
                  <td className="py-3 pr-3">
                    <div className="flex min-w-0 items-center gap-2">
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
                    <div className="font-semibold text-orange-400">{brl.format(item.commission)}</div>
                    {item.commissionProducts > 0 || item.commissionServices > 0 ? (
                      <div className="mt-0.5 space-y-0.5 text-[11px] leading-tight text-slate-500">
                        {item.commissionServices > 0 ? (
                          <div>Serv. {brl.format(item.commissionServices)} ({servPct}%)</div>
                        ) : null}
                        {item.commissionProducts > 0 ? (
                          <div>Prod. {brl.format(item.commissionProducts)} ({prodPct}%)</div>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700/20 font-semibold">
              <td className="pt-3 pr-3 text-slate-300">Total</td>
              <td className="pt-3 pr-3 text-right text-slate-400">{totalAppointments}</td>
              <td className="pt-3 pr-3 text-right text-slate-100">{brl.format(totalRevenue)}</td>
              <td className="pt-3 text-right text-orange-400">{brl.format(totalCommission)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}