import { identity } from '@/config/active-studio'
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Phone,
  Cake,
  Archive,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TaskItem } from '../types';
import { toWhatsAppHref } from '@/features/utils/whats/whatsapp';
import { WhatsAppButton } from '@/features/utils/whats/WhatsAppButton';
import { WHATS_MSG } from '@/features/utils/whats/whatsmsg';
import { WhatsAppIcon } from '@/features/utils/icons/WhatsAppIcon';

/* ───────── Helpers ───────── */



function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

function normalizeDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('pt-BR');
  }
  return dateStr;
}

function normalizeTime(dateOrTime: string): string {
  if (/^\d{2}:\d{2}$/.test(dateOrTime)) return dateOrTime;
  const d = new Date(dateOrTime);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return dateOrTime;
}

/* ───────── Interfaces ───────── */

export interface TasksPageProps {
  tasks: {
    overdue: TaskItem[];
    pendingConfirmation: TaskItem[];
    birthdays: TaskItem[];
    inactive: TaskItem[];
  };
  isLoading: boolean;
  error: Error | null;
  onMarkNoShow: (id: string) => void;
  onComplete: (id: string) => void;
  onConfirm: (id: string) => void;
  onRemove: (id: string) => void;
}

/* ───────── Skeleton ───────── */

function TaskSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-slate-800/60 p-5">
          <div className="mb-3 h-4 w-3/4 rounded bg-slate-700/60" />
          <div className="mb-2 h-3 w-1/2 rounded bg-slate-700/40" />
          <div className="h-3 w-2/3 rounded bg-slate-700/40" />
        </div>
      ))}
    </div>
  );
}

/* ───────── Empty state ───────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      <p className="text-sm font-medium text-slate-400">Nenhuma tarefa pendente</p>
      <p className="text-xs text-slate-500">Tudo em dia!</p>
    </div>
  );
}

/* ───────── Error state ───────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <div>
        <p className="text-sm font-semibold text-red-300">Erro ao carregar tarefas</p>
        <p className="mt-1 text-xs text-slate-400">Não foi possível buscar os dados. Tente novamente.</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-lg border border-red-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/10"
      >
        Tentar novamente
      </button>
    </div>
  );
}

/* ───────── Task Card — Sem conclusão ───────── */

function TaskCardSemConclusao({
  task,
  onMarkNoShow,
  onComplete,
  onLembrarDepois,
}: {
  task: TaskItem;
  onMarkNoShow: (id: string) => void;
  onComplete: (id: string) => void;
  onLembrarDepois: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-900/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-slate-100">{task.clientName}</span>
        {task.clientPhone && (
          <span className="text-xs text-slate-400">{formatPhone(task.clientPhone)}</span>
        )}
      </div>
      <p className="mb-3 text-xs text-slate-400">{task.title || 'No result'}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onComplete(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 active:scale-95"
        >
          Concluir
        </button>
        <button
          type="button"
          onClick={() => onMarkNoShow(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/40 active:scale-95"
        >
          Faltou
        </button>
        <button
        onClick={() => onLembrarDepois(task.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-500/10 hover:border-slate-500/40 active:scale-95"
        >
        Lembrar Depois
        </button>        

      </div>
      {task.date && <p className="mt-2 text-xs text-slate-500">{task.description}</p>}
    </motion.div>
  );
}

/* ───────── Task Card — Confirmar ───────── */

function TaskCardConfirmar({
  task,
  onConfirm,
  onLembrarDepois,
}: {
  task: TaskItem;
  onConfirm: (id: string) => void;
  onLembrarDepois: (id: string) => void;
}) {
  const waHref = task.clientPhone
    ? toWhatsAppHref(
        task.clientPhone,
        WHATS_MSG.confirmAppointment({
          clientName: task.clientName,
          date: normalizeDate(task.date ?? ''),
          time: normalizeTime(task.scheduledTime ?? task.date ?? ''),
          serviceName: task.serviceName ?? task.appointment?.serviceName ?? 'o serviço',
          staffName: task.staffName ?? 'nosso profissional',
          studioName: identity.name || 'FlowStudio',
        }),
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-900/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-slate-100">{task.clientName}</span>
        {task.clientPhone && (
          <span className="text-xs text-slate-400">{formatPhone(task.clientPhone)}</span>
        )}
      </div>
      <p className="mb-3 text-xs text-slate-400">{task.title}</p>
      <div className="flex flex-wrap gap-1.5">
        {waHref && <WhatsAppButton href={waHref} />}
        <button
          type="button"
          onClick={() => onConfirm(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-orange-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500/40 active:scale-95"
        >
          Confirmar
        </button>
        <button
        onClick={() => onLembrarDepois(task.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-500/10 hover:border-slate-500/40 active:scale-95"
        >
        Lembrar Depois
        </button>           
      </div>
      {task.date && <p className="mt-2 text-xs text-slate-500">{task.description}</p>}
    </motion.div>
  );
}

/* ───────── Task Card — Aniversário ───────── */

function TaskCardAniversario({
  task,
  onRemove,
  onLembrarDepois,
}: {
  task: TaskItem;
  onRemove: (id: string) => void;
  onLembrarDepois: (id: string) => void;
}) {
  const waHref = task.clientPhone
    ? toWhatsAppHref(
        task.clientPhone,
        WHATS_MSG.birthday({
          clientName: task.clientName,
          studioName: identity.name || 'FlowStudio',
        }),
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-900/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-slate-100">{task.clientName}</span>
        {task.clientPhone && (
          <span className="text-xs text-slate-400">{formatPhone(task.clientPhone)}</span>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {waHref && <WhatsAppButton href={waHref} />}
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-orange-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500/40 active:scale-95"
        >
          Concluir
        </button>
        <button
        onClick={() => onLembrarDepois(task.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-500/10 hover:border-slate-500/40 active:scale-95"
        >
        Lembrar Depois
        </button>           
      </div>
      {task.date && (
        <p className="text-xs text-slate-500">
          {task.description || 'Aniversariante da Semana'}
        </p>
      )}
    </motion.div>
  );
}

/* ───────── Task Card — Inativo / Remarketing ───────── */

function TaskCardInativo({
  task,
  onRemove,
  onLembrarDepois,
}: {
  task: TaskItem;
  onRemove: (id: string) => void;
  onLembrarDepois: (id: string) => void;
}) {
  const daysSinceLastVisit = (() => {
    if (!task.date) return 30;
    const d = new Date(task.date);
    if (isNaN(d.getTime())) return 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const waHref = task.clientPhone
    ? toWhatsAppHref(
        task.clientPhone,
        WHATS_MSG.remarketing({
          clientName: task.clientName,
          daysSinceLastVisit,
          studioName: identity.name || 'FlowStudio',
        }),
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-900/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-slate-100">{task.clientName}</span>
        {task.clientPhone && (
          <span className="text-xs text-slate-400">{formatPhone(task.clientPhone)}</span>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {waHref && <WhatsAppButton href={waHref} />}
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-orange-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500/40 active:scale-95"
        >
          Descartar
        </button>
        <button
        onClick={() => onLembrarDepois(task.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-500/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-500/10 hover:border-slate-500/40 active:scale-95"
        >
        Lembrar Depois
        </button>           
      </div>
      {task.date && (
        <p className="text-xs text-slate-500">{task.description || task.title}</p>
      )}
    </motion.div>
  );
}

/* ───────── Section ───────── */

function Section({
  title,
  icon: Icon,
  tasks,
  accentClass,
  renderCard,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: TaskItem[];
  accentClass: string;
  renderCard: (task: TaskItem) => React.ReactNode;
}) {
  if (tasks.length === 0) return null;
  const displayTasks = tasks.slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-700/20 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-700/20 pb-3">
        <Icon className={cn('h-5 w-5', accentClass)} />
        <h3 className={cn('text-sm font-bold uppercase tracking-wider', accentClass)}>
          {title}
        </h3>
        <span className="ml-auto text-xs text-slate-500">{tasks.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayTasks.map((task) => renderCard(task))}
      </div>
    </div>
  );
}

/* ════════════════════════ COMPONENTE PRINCIPAL ════════════════════════ */

export function TasksPage({
  tasks,
  isLoading,
  error,
  onMarkNoShow,
  onComplete,
  onConfirm,
  onRemove,
}: TasksPageProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const hideTask = useCallback((id: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
  }, []);

  const handleLembrarDepois = useCallback(
    (id: string) => {
      hideTask(id);
    },
    [hideTask],
  );  

  const handleMarkNoShow = useCallback(
    (id: string) => { onMarkNoShow(id); hideTask(id); },
    [onMarkNoShow, hideTask],
  );

  const handleComplete = useCallback(
    (id: string) => { onComplete(id); hideTask(id); },
    [onComplete, hideTask],
  );

  const handleConfirm = useCallback(
    (id: string) => { onConfirm(id); hideTask(id); },
    [onConfirm, hideTask],
  );

  const handleRemove = useCallback(
    (id: string) => { onRemove(id); hideTask(id); },
    [onRemove, hideTask],
  );

  if (isLoading) return <TaskSkeleton />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const filteredTasks = {
    overdue: tasks.overdue.filter((t) => !hiddenIds.has(t.id)),
    pendingConfirmation: tasks.pendingConfirmation.filter((t) => !hiddenIds.has(t.id)),
    birthdays: tasks.birthdays.filter((t) => !hiddenIds.has(t.id)),
    inactive: tasks.inactive.filter((t) => !hiddenIds.has(t.id)),
  };

  const allEmpty = Object.values(filteredTasks).every((arr) => arr.length === 0);
  if (allEmpty) return <EmptyState />;

  return (
    <div className="flex flex-col gap-5">
      <Section
        title="Aguardando Conclusão"
        icon={AlertTriangle}
        tasks={filteredTasks.overdue}
        accentClass="text-red-400"
        renderCard={(task) => (
          <TaskCardSemConclusao task={task} onMarkNoShow={handleMarkNoShow} onComplete={handleComplete} onLembrarDepois={handleLembrarDepois} />
        )}
      />
      <Section
        title="Confirmação Pendente"
        icon={WhatsAppIcon}
        tasks={filteredTasks.pendingConfirmation}
        accentClass="text-emerald-400"
        renderCard={(task) => (
          <TaskCardConfirmar task={task} onConfirm={handleConfirm} onLembrarDepois={handleLembrarDepois} />
        )}
      />
      <Section
        title="Aniversariantes"
        icon={Cake}
        tasks={filteredTasks.birthdays}
        accentClass="text-pink-400"
        renderCard={(task) => (
          <TaskCardAniversario task={task} onRemove={handleRemove} onLembrarDepois={handleLembrarDepois} />
        )}
      />
      <Section
        title="Inativos"
        icon={Archive}
        tasks={filteredTasks.inactive}
        accentClass="text-orange-400"
        renderCard={(task) => (
          <TaskCardInativo task={task} onRemove={handleRemove} onLembrarDepois={handleLembrarDepois} />
        )}
      />
    </div>
  );
}