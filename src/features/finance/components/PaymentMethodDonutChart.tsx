import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PaymentMethodSlice } from '../types';

// Paleta com maior diferenciação visual (evita tons próximos de laranja repetidos)
const COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#64748b'];

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  data: PaymentMethodSlice[];
}

export function PaymentMethodDonutChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-700/20 bg-slate-800/40 text-sm text-slate-500">
        Nenhuma receita no período
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Receita por forma de pagamento</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <ResponsiveContainer width="100%" height={200} className="sm:max-w-[200px]">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="paymentMethodName"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.paymentMethodId} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => brl.format(Number(value ?? 0))}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 12,
                color: '#e2e8f0',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legenda customizada: nome + valor + percentual, bem explícito */}
        <div className="w-full space-y-2">
          {data.map((slice, index) => (
            <div key={slice.paymentMethodId} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden
                />
                <span className="truncate text-slate-300">{slice.paymentMethodName}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-slate-100">{brl.format(slice.amount)}</span>
                <span className="w-11 text-right text-xs text-slate-500">
                  {Math.round(slice.percentage)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
