import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/features/utils/ui/ConfirmDialog';
import { CalendarClock, Check, CheckCheck, X, UserX, RotateCcw, Calendar, Pencil, ChevronDown, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { WhatsAppButton } from '@/features/utils/whats/WhatsAppButton';
import type { AppointmentItem } from '../types';
import { toWhatsAppHref } from '@/features/utils/whats/whatsapp';
import { useUpdateAppointmentStatus } from '../hooks';
import { staffColor } from './DayCalendar/staffColor';
import { cn } from '@/lib/cn';
import { useSession } from '@/features/auth/hooks';
import { useNavigate } from '@tanstack/react-router';
import { endOfDay, parseISO } from 'date-fns';
import { WHATS_MSG } from '@/features/utils/whats/whatsmsg';
import { identity } from '@/config/active-studio'

type Status = AppointmentItem['status'];

const STATUS_CONFIG: Record<Status, { label: string; dot: string; border: string; bg: string }> = {
  pending:    { label: 'Pendente',       dot: 'bg-amber-400',  border: 'border-amber-500/20',  bg: 'bg-amber-500/5'   },
  confirmed:  { label: 'Confirmado',     dot: 'bg-emerald-400',border: 'border-emerald-500/20',bg: 'bg-emerald-500/5'  },
  completed:  { label: 'Concluído',      dot: 'bg-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/5'    },
  cancelled:  { label: 'Cancelado',      dot: 'bg-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5'     },
  no_show:    { label: 'Não compareceu', dot: 'bg-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5'     },
};

// ═══ Safe date parsers — NUNCA lançam RangeError ═══
function safeFormatTime(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  try {
    const d = parseISO(iso)
    if (isNaN(d.getTime())) return '--:--'
    return timeFmt.format(d)
  } catch {
    return '--:--'
  }
}

function normalizeDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  } catch {}
  return dateStr
}
// ═══ Fim safe parsers ═══

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function buildWhatsAppMessage(a: AppointmentItem): string {
  const hora = safeFormatTime(a.startsAt)
  return `Olá ${a.clientName}! Passando pra confirmar seu horário das ${hora} para ${a.serviceName}. Está tudo certo?`
}

type ActionVariant = 'neutral' | 'positive' | 'danger'

interface StatusAction {
  status: Status
  label: string
  icon: typeof Check
  variant: ActionVariant
}

const ACTIONS_BY_STATUS: Record<Status, StatusAction[]> = {
  pending: [
    { status: 'confirmed', label: 'Confirmar', icon: Check, variant: 'positive' },
    { status: 'cancelled', label: 'Cancelar',  icon: X,     variant: 'danger' },
  ],
  confirmed: [
    { status: 'completed', label: 'Concluir',       icon: CheckCheck, variant: 'positive' },
    { status: 'no_show',   label: 'Não compareceu', icon: UserX,      variant: 'danger' },
    { status: 'cancelled', label: 'Cancelar',        icon: X,          variant: 'danger' },
  ],
  completed: [],
  no_show: [
    { status: 'pending', label: 'Reabrir', icon: RotateCcw, variant: 'neutral' },
  ],
  cancelled: [],
}

const BUTTON_STYLE: Record<ActionVariant, string> = {
  neutral:  'border-border/40 text-text-muted hover:bg-surface-alt hover:text-text-body hover:border-border',
  positive: 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40',
  danger:   'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } },
}

interface Props {
  items: AppointmentItem[]
  onEdit?: (appointment: AppointmentItem) => void
  onNewAppointment?: () => void
}

interface StaffGroup {
  staffId: string
  staffName: string
  staffAvatarUrl: string | null
  staffColor: string | null
  appointments: AppointmentItem[]
}

function groupByStaff(items: AppointmentItem[]): StaffGroup[] {
  const groups = new Map<string, StaffGroup>()
  for (const a of items) {
    let group = groups.get(a.staffId)
    if (!group) {
      group = {
        staffId: a.staffId,
        staffName: a.staffName,
        staffAvatarUrl: a.staffAvatarUrl,
        staffColor: a.staffColor ?? null,
        appointments: [],
      }
      groups.set(a.staffId, group)
    }
    group.appointments.push(a)
  }
  return [...groups.values()]
}

function StaffAvatar({ name, avatarUrl, color }: { name: string; avatarUrl: string | null; color: string }) {
  const ring = { boxShadow: `0 0 0 2px ${color}` }
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover" style={ring} />
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-slate-300" style={ring}>
      {initials(name)}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} border ${cfg.dot}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function EmptyState({ hasAnyItems }: { hasAnyItems: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-slate-500">
      <CalendarClock className="h-10 w-10 opacity-40" />
      <p>{!hasAnyItems ? 'Nenhum agendamento para hoje.' : 'Nenhum agendamento encontrado com os filtros atuais.'}</p>
    </div>
  )
}

function StaffGrid({ groups, onEdit }: { groups: StaffGroup[]; onEdit?: (appointment: AppointmentItem) => void }) {
  return (
    <motion.div className="flex flex-col gap-4" variants={containerVariants} initial="hidden" animate="visible">
      {groups.map((group) => (
        <StaffCard key={group.staffId} group={group} onEdit={onEdit} />
      ))}
    </motion.div>
  )
}

// ─── Utilitário: filtra agendamentos de agora até 23:59 ─────────────
function filterByTimeRange(items: AppointmentItem[]): AppointmentItem[] {
  const now = new Date()
  const dayEnd = endOfDay(now)
  return items.filter((a) => {
    const start = parseISO(a.startsAt)
    if (isNaN(start.getTime())) return false
    return start >= now && start <= dayEnd
  })
}

// ─── Dropdown de staff ──────────────────────────────────────────────
const ALL_STAFF_VALUE = 'all'

function StaffFilterSelect({
  staffList,
  value,
  onChange,
}: {
  staffList: { id: string; name: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'appearance-none rounded-lg border border-slate-700/40 bg-slate-800/60 px-3 py-2 pr-8 text-sm font-medium text-slate-200',
        'transition-colors hover:border-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30',
      )}
    >
      <option value={ALL_STAFF_VALUE}>Todos os profissionais</option>
      {staffList.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  )
}

// ─── Dropdown de status ─────────────────────────────────────────────
type StatusFilterValue = Status | 'all'

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all',        label: 'Todos os status' },
  { value: 'pending',    label: 'Pendente' },
  { value: 'confirmed',  label: 'Confirmado' },
  { value: 'completed',  label: 'Concluído' },
  { value: 'cancelled',  label: 'Cancelado' },
  { value: 'no_show',    label: 'Não compareceu' },
]

function StatusFilterSelect({
  value,
  onChange,
}: {
  value: StatusFilterValue
  onChange: (v: StatusFilterValue) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as StatusFilterValue)}
      className={cn(
        'appearance-none rounded-lg border border-slate-700/40 bg-slate-800/60 px-3 py-2 pr-8 text-sm font-medium text-slate-200',
        'transition-colors hover:border-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30',
      )}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ─── Componente principal ────────────────────────────────────────────
export function AppointmentsList({ items, onEdit, onNewAppointment }: Props) {
  const { data: session } = useSession()
  const userId = session?.userId

  const staffList = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    for (const a of items) {
      if (!map.has(a.staffId)) {
        map.set(a.staffId, { id: a.staffId, name: a.staffName })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const [staffFilter, setStaffFilter] = useState(ALL_STAFF_VALUE)
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')

  const filtered = useMemo(() => {
    let result = items
    if (staffFilter !== ALL_STAFF_VALUE) {
      result = result.filter((a) => a.staffId === staffFilter)
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }
    return result
  }, [items, staffFilter, statusFilter])

  const groupsAll = groupByStaff(filtered)

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de filtros */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StaffFilterSelect staffList={staffList} value={staffFilter} onChange={setStaffFilter} />
          <StatusFilterSelect value={statusFilter} onChange={setStatusFilter} />
        </div>
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-500/30 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo
          </button>
        )}
      </div>

      {/* Grid de agendamentos */}
      {filtered.length === 0 ? (
        <EmptyState hasAnyItems={items.length > 0} />
      ) : (
        <StaffGrid groups={groupsAll} onEdit={onEdit} />
      )}
    </div>
  )
}

function StaffCard({ group, onEdit }: { group: StaffGroup; onEdit?: (appointment: AppointmentItem) => void }) {
  const color = group.staffColor ?? staffColor(group.staffId)

  return (
    <motion.div variants={cardVariants} className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <StaffAvatar name={group.staffName} avatarUrl={group.staffAvatarUrl} color={color} />
        <span className="text-sm font-bold text-slate-200">{group.staffName}</span>
      </div>

      <div className="flex flex-col gap-2">
        {group.appointments.map((a) => (
          <AppointmentRow key={a.id} appointment={a} onEdit={onEdit} />
        ))}
      </div>
    </motion.div>
  )
}

function AppointmentRow({ appointment: a, onEdit }: { appointment: AppointmentItem; onEdit?: (appointment: AppointmentItem) => void }) {
  const [cancelTarget, setCancelTarget] = useState<AppointmentItem | null>(null)

  const waHref = a.clientPhone
    ? toWhatsAppHref(
        a.clientPhone,
        WHATS_MSG.confirmAppointment({
          clientName: a.clientName,
          date: normalizeDate(a.startsAt ?? ''),
          time: safeFormatTime(a.startsAt),
          serviceName: a.serviceName ?? 'o serviço',
          staffName: a.staffName ?? 'nosso profissional',
          studioName: identity.name || 'FlowStudio',
        }),
      )
    : null

  const { mutate, isPending, variables } = useUpdateAppointmentStatus()
  const queryClient = useQueryClient()
  const actions = ACTIONS_BY_STATUS[a.status]
  const isUpdatingThisRow = isPending && variables?.id === a.id
  const navigate = useNavigate()

  return (
    <>
      <motion.div
        variants={rowVariants}
        className={`group flex items-center gap-3 rounded-lg border border-slate-700/20 bg-slate-800/60 px-3 py-2.5 transition-all hover:border-slate-600/40 ${isUpdatingThisRow ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Horário */}
        <div className="min-w-[56px] text-center">
          <span className="text-sm font-bold text-cyan-300">{safeFormatTime(a.startsAt)}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-200">{a.clientName}</p>
          <p className="truncate text-xs text-slate-400">{a.serviceName}</p>
        </div>

        {/* Status */}
        <div className="hidden sm:block">
          <StatusBadge status={a.status} />
        </div>

        {/* Ações */}
        {onEdit && (
          <button
            onClick={() => onEdit(a)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/40 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-slate-200 active:scale-95"
            aria-label="Editar agendamento"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {waHref && <WhatsAppButton href={waHref} />}

        {actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.status}
                  disabled={isPending}
                  onClick={() => {
                    if (action.status === 'completed') {
                      navigate({ to: '/admin/pdv', search: { appointmentId: a.id } })
                    } else if (action.status === 'cancelled') {
                      setCancelTarget(a)
                    } else {
                      mutate(
                        { id: a.id, status: action.status },
                        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }) },
                      )
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5',
                    'text-[11px] font-bold uppercase tracking-wider',
                    'transition-all duration-200 active:scale-95',
                    BUTTON_STYLE[action.variant],
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {action.label}
                </button>
              )
            })}
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return
          mutate(
            { id: cancelTarget.id, status: 'cancelled' },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['appointments'] })
                setCancelTarget(null)
              },
            },
          )
        }}
        title="Cancelar agendamento?"
        description={`Tem certeza que deseja cancelar o agendamento de ${cancelTarget?.clientName}?`}
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        variant="danger"
      />
    </>
  )
}