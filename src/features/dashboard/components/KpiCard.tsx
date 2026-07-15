import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface KpiCardDelta {
  value: number;
  direction: 'up' | 'down';
  suffix?: string;
}

// ─── Accent system (mesmo padrão dos relatórios) ───
type Accent = keyof typeof CARD_ACCENTS;

const CARD_ACCENTS = {
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  rose: 'from-rose-500/15 to-rose-500/5 border-rose-500/20',
  violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/20',
  blue: 'from-blue-500/15 to-blue-500/5 border-blue-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  cyan: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/20',
};

const ICON_WRAPPER: Record<Accent, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  rose: 'bg-rose-500/15 text-rose-400 ring-rose-500/25',
  violet: 'bg-violet-500/15 text-violet-400 ring-violet-500/25',
  blue: 'bg-blue-500/15 text-blue-400 ring-blue-500/25',
  amber: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/25',
};

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delta?: KpiCardDelta;
  index?: number;
  accent?: Accent; // NOVO — cor dinâmica por card
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  index = 0,
  accent = 'emerald',
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
        'group relative overflow-hidden rounded-2xl border p-5',
        'shadow-md transition-all duration-300',
        'hover:shadow-lg',
        'bg-gradient-to-br',
        CARD_ACCENTS[accent],
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

        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
          'ring-1',
          ICON_WRAPPER[accent],
        )}>
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