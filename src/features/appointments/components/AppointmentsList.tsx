// src/features/appointments/components/AppointmentsList.tsx
import { Button } from '@/components/ui/Button';
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
import { useQueryClient } from '@tanstack/react-query';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { AppointmentItem } from '../types';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { useUpdateAppointmentStatus } from '../hooks';
import { staffColor } from './DayCalendar/staffColor';

type Status = AppointmentItem['status'];

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const STATUS_CLASS: Record<Status, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  confirmed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  completed: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
  cancelled: 'border-red-500/30 bg-red-500/10 text-red-500',
  no_show: 'border-red-500/30 bg-red-500/10 text-red-500',
};

/** Iniciais do nome para fallback do avatar (máx. 2 letras). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]![0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : '';
  return (first + last).toUpperCase();
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

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
  staffAvatarUrl: string | null;
  staffColor: string | null; // ← NOVO
  appointments: AppointmentItem[];
}

function groupByStaff(items: AppointmentItem[]): StaffGroup[] {
  const groups = new Map<string, StaffGroup>();
  for (const a of items) {
    let group = groups.get(a.staffId);
    if (!group) {
      group = {
        staffId: a.staffId,
        staffName: a.staffName,
        staffAvatarUrl: a.staffAvatarUrl,
        staffColor: a.staffColor ?? null, // ← NOVO
        appointments: [],
      };
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted((v) => !v)}
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
          </Button>
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

function StaffAvatar({
  name,
  avatarUrl,
  color,
}: {
  name: string;
  avatarUrl: string | null;
  color: string;
}) {
  const ring = { boxShadow: `0 0 0 2px ${color}` };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        loading="lazy"
        className="h-8 w-8 shrink-0 rounded-full object-cover"
        style={ring}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color, ...ring }}
    >
      {initials(name)}
    </span>
  );
}

function StaffCard({ group }: { group: StaffGroup }) {
  const color = group.staffColor ?? staffColor(group.staffId); // ← banco primeiro, fallback hash

  return (
    <div
      className="rounded-card border border-border bg-surface p-5 shadow-md border-l-4"
      style={{ borderLeftColor: color }}
    >
      <h3
        className="mb-3 flex items-center gap-2.5 border-b pb-3 text-lg font-bold tracking-tight"
        style={{ color, borderBottomColor: color }}
      >
        <StaffAvatar
          name={group.staffName}
          avatarUrl={group.staffAvatarUrl}
          color={color}
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
  neutral: 'border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text-body',
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
};

function AppointmentRow({ appointment: a }: { appointment: AppointmentItem }) {
  const waHref = toWhatsAppHref(a.clientPhone, buildWhatsAppMessage(a));
  const { mutate, isPending, variables } = useUpdateAppointmentStatus();
  const queryClient = useQueryClient();
  const actions = ACTIONS_BY_STATUS[a.status];
  const isUpdatingThisRow = isPending && variables?.id === a.id;

  return (
    <li className="flex flex-col gap-2 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-base font-bold tabular-nums text-primary">
          <CalendarClock className="h-4 w-4" aria-hidden />
          {timeFmt.format(new Date(a.startsAt))}
        </span>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_CLASS[a.status]}`}
        >
          {STATUS_LABEL[a.status]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-white">{a.clientName}</p>
          <span className="mt-0.5 truncate text-sm font-bold uppercase tracking-wide text-primary">
            {a.serviceName}
          </span>
        </div>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enviar WhatsApp para ${a.clientName}`}
            title="Conversar no WhatsApp"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const variantMap: Record<ActionVariant, 'ghost' | 'success' | 'danger'> = {
            neutral: 'ghost',
            positive: 'success',
            danger: 'danger',
          };
          return (
            <Button
              key={action.status}
              type="button"
              variant={variantMap[action.variant]}
              size="sm"
              disabled={isUpdatingThisRow}
              onClick={() => {
                mutate(
                  { id: a.id, status: action.status },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['appointments'] });
                    },
                  }
                );
              }}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {action.label}
            </Button>
          );
        })}
      </div>
    </li>
  );
}