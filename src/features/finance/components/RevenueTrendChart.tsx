import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import type { RevenueTrendPoint } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface Props {
  data: RevenueTrendPoint[];
}

export function RevenueTrendChart({ data }: Props) {
  const chartData = data.map((point) => ({ ...point, label: formatDayLabel(point.date) }));

  return (
    <div className="min-w-0 rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Receita x Despesa no período</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            formatter={(value) => brl.format(Number(value ?? 0))}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
          />
          <Bar dataKey="income" name="Receita" fill="#f97316" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Despesa" fill="#475569" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
