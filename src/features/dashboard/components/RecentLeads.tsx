// src/features/dashboard/components/RecentLeads.tsx
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { DashboardLeadItem } from '@/features/dashboard/types';

const STATUS_LABELS: Record<DashboardLeadItem['status'], string> = {
  new: 'Novo',
  contacted: 'Contatado',
  scheduled: 'Agendado',
  converted: 'Convertido',
  lost: 'Perdido',
};

const SOURCE_LABELS: Record<DashboardLeadItem['source'], string> = {
  landing: 'Landing page',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  referral: 'Indicação',
  other: 'Outro',
};

/** Cores do badge de status — monocromático Art Deco + semânticos só em converted/lost. */
const STATUS_STYLE: Record<
  DashboardLeadItem['status'],
  { color: string; bg: string; ring: string }
> = {
  new: {
    color: 'var(--color-accent-bright)',
    bg: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
    ring: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
  },
  contacted: {
    color: 'var(--color-accent)',
    bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
    ring: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
  },
  scheduled: {
    color: 'var(--color-accent)',
    bg: 'color-mix(in srgb, var(--color-accent) 9%, transparent)',
    ring: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
  },
  converted: {
    color: 'var(--color-success)',
    bg: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
    ring: 'color-mix(in srgb, var(--color-success) 26%, transparent)',
  },
  lost: {
    color: 'var(--color-text-muted)',
    bg: 'color-mix(in srgb, var(--color-text-muted) 8%, transparent)',
    ring: 'color-mix(in srgb, var(--color-text-muted) 16%, transparent)',
  },
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function initialOf(name: string): string {
  const c = name.trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

interface Props {
  leads: DashboardLeadItem[];
}

export function RecentLeads({ leads }: Props) {
  const items = leads ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden p-5"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Filete dourado superior — assinatura Art Deco */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-accent) 50%, transparent)',
        }}
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="shrink-0 rounded-xl p-2"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--color-accent) 14%, transparent)',
            color: 'var(--color-accent-bright)',
            boxShadow:
              'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 25%, transparent)',
          }}
        >
          <Users className="h-5 w-5" aria-hidden />
        </span>
        <h3
          className="text-base font-semibold leading-none tracking-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-heading)',
          }}
        >
          Leads recentes
        </h3>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Users className="h-8 w-8 opacity-40" aria-hidden />
          <p className="text-sm">Nenhum lead recente.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((lead, index) => {
            const status = STATUS_STYLE[lead.status];
            return (
              <motion.li
                key={lead.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.28,
                  delay: index * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200"
                style={{ borderRadius: 'var(--radius-card)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'color-mix(in srgb, var(--color-accent) 6%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar inicial */}
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                    color: 'var(--color-accent-bright)',
                    boxShadow:
                      'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 22%, transparent)',
                  }}
                >
                  {initialOf(lead.name)}
                </span>

                {/* Nome + telefone */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    {lead.name}
                  </p>
                  <p
                    className="truncate text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {formatPhone(lead.phone)} · {SOURCE_LABELS[lead.source]}
                  </p>
                </div>

                {/* Status + data */}
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
                    style={{
                      color: status.color,
                      backgroundColor: status.bg,
                      boxShadow: `inset 0 0 0 1px ${status.ring}`,
                    }}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {dateFmt.format(new Date(lead.createdAt))}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
