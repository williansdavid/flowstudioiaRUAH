import { cn } from '@/lib/cn';
import type { FinancePeriod } from '../types';

interface Props {
  value: FinancePeriod;
  onChange: (period: FinancePeriod) => void;
}

const OPTIONS: { value: FinancePeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

export function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex w-full gap-0 overflow-x-auto rounded-2xl border border-slate-700/20 bg-slate-800/40 p-1.5 sm:w-fit">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
