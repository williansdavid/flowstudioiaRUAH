import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiCardDelta {
  /** valor sempre positivo; o sinal vem de `direction` */
  value: number;
  direction: 'up' | 'down';
  /** sufixo do delta, padrão '%' */
  suffix?: string;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delta?: KpiCardDelta;
}

export function KpiCard({ label, value, icon: Icon, hint, delta }: KpiCardProps) {
  const isUp = delta?.direction === 'up';
  const DeltaIcon = isUp ? TrendingUp : TrendingDown;
  const deltaColor = isUp ? 'text-feedback-success' : 'text-feedback-error';
  const deltaSuffix = delta?.suffix ?? '%';
  const deltaSign = isUp ? '+' : '-';

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-subtle">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-text-strong">
            {value}
          </p>
          {hint ? <p className="text-xs text-text-subtle">{hint}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="rounded-lg bg-brand/10 p-2 text-brand">
            <Icon className="h-5 w-5" aria-hidden />
          </span>

          {delta ? (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${deltaColor}`}
            >
              <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
              {deltaSign}
              {Math.abs(delta.value)}
              {deltaSuffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
