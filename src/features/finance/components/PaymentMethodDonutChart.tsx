import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { PaymentMethodSlice } from '../types';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#94a3b8', '#64748b'];

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
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="paymentMethodName"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.paymentMethodId} fill={COLORS[index % COLORS.length]} stroke="none" />
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
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
