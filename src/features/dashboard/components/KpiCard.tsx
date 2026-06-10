// src/features/dashboard/components/KpiCard.tsx
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  /** índice para stagger de entrada */
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
  const deltaColor = isUp ? 'var(--color-success)' : 'var(--color-danger)';
  const deltaSuffix = delta?.suffix ?? '%';
  const deltaSign = isUp ? '+' : '-';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1], // out-expo
      }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden p-5 transition-[box-shadow,border-color] duration-300 ease-out"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-accent)';
        e.currentTarget.style.borderColor = 'var(--color-border-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Filete dourado superior — assinatura Art Deco, sutil */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-accent) 50%, transparent)',
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p
            className="truncate text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {label}
          </p>
          <p
            className="text-4xl font-semibold leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-heading)',
            }}
          >
            {value}
          </p>
          {hint ? (
            <p
              className="truncate text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {hint}
            </p>
          ) : null}
        </div>

        <span
          className="shrink-0 rounded-xl p-2.5 transition-transform duration-300 ease-out group-hover:scale-110"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--color-accent) 14%, transparent)',
            color: 'var(--color-accent-bright)',
            boxShadow:
              'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 25%, transparent)',
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      {delta ? (
        <div
          className="mt-3 flex items-center gap-1 text-xs font-medium"
          style={{ color: deltaColor }}
        >
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
          <span>
            {deltaSign}
            {Math.abs(delta.value)}
            {deltaSuffix}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            vs. mês anterior
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}
