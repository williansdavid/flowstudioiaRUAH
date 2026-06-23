import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface KpiCardDelta {
  value: number;
  direction: 'up' | 'down';
  suffix?: string;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delta?: KpiCardDelta;
  index?: number;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  index = 0,
}: KpiCardProps) {
  const isUp = delta?.direction === 'up';
  const DeltaIcon = !delta ? Minus : isUp ? TrendingUp : TrendingDown;
  const deltaColor = isUp ? 'text-emerald-400' : 'text-red-400';
  const deltaSuffix = delta?.suffix ?? '%';
  const deltaSign = isUp ? '+' : '-';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5',
        'shadow-md transition-all duration-300',
        'hover:border-slate-700/40 hover:bg-slate-800/60 hover:shadow-lg',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold leading-none tracking-tight text-slate-100">
            {value}
          </p>
          {hint ? (
            <p className="truncate text-xs text-slate-500">
              {hint}
            </p>
          ) : null}
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/25 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>

      {delta ? (
        <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', deltaColor)}>
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
          <span>
            {deltaSign}
            {Math.abs(delta.value)}
            {deltaSuffix}
          </span>
          <span className="text-slate-500">vs. mês anterior</span>
        </div>
      ) : null}
    </motion.div>
  );
}