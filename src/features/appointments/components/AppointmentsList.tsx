// src/features/appointments/components/AppointmentsList.tsx
import { useState } from 'react';
import {
  CalendarClock,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  X,
  UserX,
  RotateCcw,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { AppointmentItem } from '../types';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { useUpdateAppointmentStatus } from '../hooks';

type Status = AppointmentItem['status'];

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const STATUS_CLASS: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-red-100 text-red-700',
};

/**
 * Paleta fixa de cores distintas para diferenciar profissionais.
 * Tons bem separados no espectro para máxima distinção visual.
 */
const STAFF_PALETTE = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ef4444', // red
  '#84cc16', // lime
  '#ec4899', // pink
] as const;

/** Hash estável (djb2) do staffId → índice na paleta. Mesmo staff = mesma cor sempre. */
function staffColor(staffId: string): string {
  let hash = 5381;
  for (let i = 0; i < staffId.length; i++) {
    hash = (hash * 33) ^ staffId.charCodeAt(i);
  }
  const index = Math.abs(hash) % STAFF_PALETTE.length;
  return STAFF_PALETTE[index]!;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

/** Mensagem padrão de confirmação enviada ao cliente via WhatsApp. */
function buildWhatsAppMessage(a: AppointmentItem): string {
  const hora = timeFmt.format(new Date(a.startsAt));
  return `Olá ${a.clientName}! Passando pra confirmar seu horário das ${hora} para ${a.serviceName}. Está tudo certo?`;
}

interface Props {
  items: AppointmentItem[];
}

interface StaffGroup {
  staffId: string;
  staffName: string;
  appointments: AppointmentItem[];
}

/** Agrupa por staffId preservando a ordem cronológica original dos itens. */
function groupByStaff(items: AppointmentItem[]): StaffGroup[] {
  const groups = new Map<string, StaffGroup>();
  for (const a of items) {
    let group = groups.get(a.staffId);
    if (!group) {
      group = { staffId: a.staffId, staffName: a.staffName, appointments: [] };
      groups.set(a.staffId, group);
    }
    group.appointments.push(a);
  }
  return [...groups.values()];
}

export function AppointmentsList({ items }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

  const completedCount = items.filter((a) => a.status === 'completed').length;
  const visibleItems = showCompleted
    ? items
    : items.filter((a) => a.status !== 'completed');

  const groups = groupByStaff(visibleItems);

  const hasToggle = completedCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {hasToggle && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-button border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-body"
          >
            {showCompleted ? (
              <>
                <EyeOff className="h-3.5 w-3.5" aria-hidden />
                Ocultar concluídos
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Mostrar concluídos ({completedCount})
              </>
            )}
          </button>
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-5 shadow-md">
          <p className="py-8 text-center text-sm text-text-muted">
            {items.length === 0
              ? 'Nenhum agendamento para hoje.'
              : 'Nenhum agendamento pendente. Todos foram concluídos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <StaffCard key={group.staffId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({ group }: { group: StaffGroup }) {
  const color = staffColor(group.staffId);

  return (
    <div
      className="rounded-card border border-border bg-surface p-5 shadow-md border-l-4"
      style={{ borderLeftColor: color }}
    >
      <h3
        className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight"
        style={{ color }}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        {group.staffName}
      </h3>
      <ul className="divide-y divide-border">
        {group.appointments.map((a) => (
          <AppointmentRow key={a.id} appointment={a} />
        ))}
      </ul>
    </div>
  );
}

type ActionVariant = 'neutral' | 'positive' | 'danger';

interface StatusAction {
  status: Status;
  label: string;
  icon: typeof Check;
  variant: ActionVariant;
}

const ACTIONS_BY_STATUS: Record<Status, StatusAction[]> = {
  pending: [
    { status: 'confirmed', label: 'Confirmar', icon: Check, variant: 'positive' },
    { status: 'cancelled', label: 'Cancelar', icon: X, variant: 'danger' },
  ],
  confirmed: [
    { status: 'completed', label: 'Concluir', icon: CheckCheck, variant: 'positive' },
    { status: 'no_show', label: 'Não compareceu', icon: UserX, variant: 'danger' },
    { status: 'cancelled', label: 'Cancelar', icon: X, variant: 'danger' },
  ],
  completed: [],
  no_show: [
    { status: 'pending', label: 'Reabrir', icon: RotateCcw, variant: 'neutral' },
  ],
  cancelled: [],
};

const VARIANT_CLASS: Record<ActionVariant, string> = {
  neutral:
    'border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text-body',
  positive:
    'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
};

function AppointmentRow({ appointment: a }: { appointment: AppointmentItem }) {
  const waHref = toWhatsAppHref(a.clientPhone, buildWhatsAppMessage(a));
  const { mutate, isPending, variables } = useUpdateAppointmentStatus();

  const actions = ACTIONS_BY_STATUS[a.status];
  const isUpdatingThisRow = isPending && variables?.id === a.id;

  return (
    <li className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
          <CalendarClock className="h-4 w-4 text-text-muted" aria-hidden />
          {timeFmt.format(new Date(a.startsAt))}
        </span>

        <span
          className={`shrink-0 rounded-pill px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status]}`}
        >
          {STATUS_LABEL[a.status]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-body">{a.clientName}</p>
          <p className="truncate text-xs text-text-muted">{a.serviceName}</p>
        </div>

        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enviar WhatsApp para ${a.clientName}`}
            title="Conversar no WhatsApp"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        )}
      </div>

      {actions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.status}
                type="button"
                disabled={isUpdatingThisRow}
                onClick={() => mutate({ id: a.id, status: action.status })}
                className={`inline-flex items-center gap-1 rounded-button border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[action.variant]}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </li>
  );
}
