import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { StaffRevenueItem } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  items: StaffRevenueItem[];
}

export function CommissionChart({ items }: Props) {
  const totalRevenue = items.reduce((sum, i) => sum + i.revenue, 0);
  const totalCommission = items.reduce((sum, i) => sum + i.commission, 0);

  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-700/20 bg-slate-800/40 text-sm text-slate-500">
        Nenhuma comissão no período
      </div>
    );
  }

  const chartData = items.map((item) => ({
    name: item.staffName,
    Faturamento: item.revenue,
    Comissão: item.commission,
    rate: item.commissionRate,
  }));

  return (
    <div className="min-w-0 rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Faturamento x Comissão por profissional</p>

      {/* Totais bem explícitos no topo */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-700/20 bg-slate-900/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Total faturado
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{brl.format(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400/80">
            Total comissão
          </p>
          <p className="mt-1 text-2xl font-bold text-orange-400">{brl.format(totalCommission)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(220, items.length * 56)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => brl.format(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            formatter={(value, name) => [brl.format(Number(value ?? 0)), name]}
            labelFormatter={(label, payload) => {
              const rate = payload?.[0]?.payload?.rate;
              return rate !== undefined ? `${label} · comissão ${rate}%` : label;
            }}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Bar dataKey="Faturamento" fill="#475569" radius={[0, 6, 6, 0]} />
          <Bar dataKey="Comissão" fill="#f97316" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
