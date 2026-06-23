// src/features/appointments/components/AppointmentsList.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  CalendarClock,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  X,
  UserX,
  RotateCcw,
  Calendar,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import type { AppointmentItem } from '../types';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { useUpdateAppointmentStatus } from '../hooks';
import { staffColor } from './DayCalendar/staffColor';
import { cn } from '@/lib/cn';

type Status = AppointmentItem['status'];

const STATUS_CONFIG: Record<Status, { label: string; dot: string; border: string; bg: string }> = {
  pending: {
    label: 'Pendente',
    dot: 'bg-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  confirmed: {
    label: 'Confirmado',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  completed: {
    label: 'Concluído',
    dot: 'bg-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  cancelled: {
    label: 'Cancelado',
    dot: 'bg-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  no_show: {
    label: 'Não compareceu',
    dot: 'bg-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
};

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

const BUTTON_VARIANT: Record<ActionVariant, 'ghost' | 'success' | 'danger'> = {
  neutral: 'ghost',
  positive: 'success',
  danger: 'danger',
};

const BUTTON_STYLE: Record<ActionVariant, string> = {
  neutral:
    'border-border/40 text-text-muted hover:bg-surface-alt hover:text-text-body hover:border-border',
  positive:
    'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40',
  danger:
    'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
};

interface Props {
  items: AppointmentItem[];
  /** Callback disparado ao clicar no ícone de editar (lápis). */
  onEdit?: (appointment: AppointmentItem) => void;
}

interface StaffGroup {
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  staffColor: string | null;
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
        staffColor: a.staffColor ?? null,
        appointments: [],
      };
      groups.set(a.staffId, group);
    }
    group.appointments.push(a);
  }
  return [...groups.values()];
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

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-bold uppercase tracking-wider',
        cfg.border,
        cfg.bg,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function EmptyState({
  hasAnyItems,
  showCompleted,
}: {
  hasAnyItems: boolean;
  showCompleted: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700/30 bg-slate-900/50 px-6 py-14 text-center shadow-sm"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10">
        <Calendar className="h-7 w-7 text-cyan-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">
        {!hasAnyItems
          ? 'Nenhum agendamento para hoje.'
          : showCompleted
            ? 'Nenhum agendamento encontrado.'
            : 'Nenhum agendamento pendente. Todos foram concluídos.'}
      </p>
    </motion.div>
  );
}

export function AppointmentsList({ items, onEdit }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);
  const completedCount = items.filter((a) => a.status === 'completed').length;
  const visibleItems = showCompleted
    ? items
    : items.filter((a) => a.status !== 'completed');
  const groups = groupByStaff(visibleItems);
  const hasToggle = completedCount > 0;

  return (
    <div className="flex flex-col gap-5">
      {hasToggle && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200',
              'border border-slate-700/40 text-slate-500',
              'hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/60',
              'active:scale-95',
            )}
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
        <EmptyState hasAnyItems={items.length > 0} showCompleted={showCompleted} />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
{groups.map((group) => (
  <StaffCard key={group.staffId} group={group} onEdit={onEdit} />
))}
        </motion.div>
      )}
    </div>
  );
}

function StaffCard({
  group,
  onEdit,
}: {
  group: StaffGroup;
  onEdit?: (appointment: AppointmentItem) => void;
}) {
  const color = group.staffColor ?? staffColor(group.staffId);
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-slate-900/80 p-5 shadow-md',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',
      )}
      style={{ borderColor: `${color}20` }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="mb-4 flex items-center gap-3 border-b border-slate-700/30 pb-3 pl-2">
        <StaffAvatar
          name={group.staffName}
          avatarUrl={group.staffAvatarUrl}
          color={color}
        />
        <h3 className="text-base font-bold tracking-tight" style={{ color }}>
          {group.staffName}
        </h3>
      </div>
      <motion.ul
        className="flex flex-col gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {group.appointments.map((a) => (
          <AppointmentRow key={a.id} appointment={a} onEdit={onEdit} />
        ))}
      </motion.ul>
    </motion.div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────
function AppointmentRow({
  appointment: a,
  onEdit,
}: {
  appointment: AppointmentItem;
  onEdit?: (appointment: AppointmentItem) => void;
}) {
  const [cancelTarget, setCancelTarget] = useState<AppointmentItem | null>(null);
  const waHref = toWhatsAppHref(a.clientPhone, buildWhatsAppMessage(a));
  const { mutate, isPending, variables } = useUpdateAppointmentStatus();
  const queryClient = useQueryClient();
  const actions = ACTIONS_BY_STATUS[a.status];
  const isUpdatingThisRow = isPending && variables?.id === a.id;

  return (
    <>
      <motion.li
        variants={rowVariants}
        className={cn(
          'relative rounded-xl border border-slate-700/20 bg-slate-800/40 p-4',
          'transition-all duration-200',
          'hover:border-slate-700/40 hover:bg-slate-800/70',
          isUpdatingThisRow && 'pointer-events-none opacity-60',
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold tabular-nums text-cyan-400">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {timeFmt.format(new Date(a.startsAt))}
          </span>
          <StatusBadge status={a.status} />
        </div>

        <div className="mb-3 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-slate-100">
              {a.clientName}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
              {a.serviceName}
            </p>
          </div>

          {/* WhatsApp + Lápis */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(a)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/40 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-slate-200 active:scale-95"
                aria-label="Editar agendamento"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <WhatsAppButton href={waHref} />
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.status}
                  type="button"
                  disabled={isUpdatingThisRow}
                  onClick={() => {
                    if (action.status === 'cancelled') {
                      setCancelTarget(a);
                    } else {
                      mutate(
                        { id: a.id, status: action.status },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({
                              queryKey: ['appointments'],
                            });
                          },
                        },
                      );
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5',
                    'text-[11px] font-bold uppercase tracking-wider',
                    'transition-all duration-200',
                    'active:scale-95',
                    BUTTON_STYLE[action.variant],
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </motion.li>

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          mutate(
            { id: cancelTarget.id, status: 'cancelled' },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['appointments'] });
                setCancelTarget(null);
              },
            },
          );
        }}
        title="Cancelar agendamento?"
        description={`Tem certeza que deseja cancelar o agendamento de ${a.clientName}?`}
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        variant="danger"
      />
    </>
  );
}