import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  UserX,
  Phone,
  Calendar,
  Clock,
  Cake,
  Archive,
  AlertTriangle,
  MessageCircle,
  Check,
} from 'lucide-react';

import type { TaskItem } from '../types';

/* ───────── Helpers ───────── */

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
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
  onWhatsApp?: (phone: string) => void;
}

/* ───────── Skeleton ───────── */

function TaskSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-700/50 rounded" />
          <div className="h-3 w-1/2 bg-slate-700/30 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

/* ───────── Empty state ───────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <CheckCircle2 className="h-12 w-12 mb-4 text-slate-600" />
      <p className="text-lg font-medium text-slate-400">Nenhuma tarefa pendente</p>
      <p className="text-sm text-slate-500 mt-1">Tudo em dia!</p>
    </div>
  );
}

/* ───────── Error state ───────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-slate-200 mb-1">Erro ao carregar tarefas</h3>
      <p className="text-sm text-slate-500 mb-4">Não foi possível buscar os dados. Tente novamente.</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-slate-700/40 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700/60"
      >
        Tentar novamente
      </button>
    </div>
  );
}

/* ───────── Task Card components (sem avatar) ───────── */

function TaskCardSemConclusao({
  task,
  onMarkNoShow,
  onComplete,
  onWhatsApp,
}: {
  task: TaskItem;
  onMarkNoShow: (id: string) => void;
  onComplete: (id: string) => void;
  onWhatsApp?: (phone: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 transition hover:border-slate-600/40 hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 truncate">{task.clientName}</h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400 border border-red-500/20 whitespace-nowrap">
          <Clock className="h-3 w-3" />
          Sem conclusão
        </span>
      </div>
      {task.clientPhone && (
        <p className="text-xs text-slate-400 mt-0.5">{formatPhone(task.clientPhone)}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">
        {task.description || 'Agendamento não foi concluído.'}       
      </p>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onMarkNoShow(task.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/20"
        >
          <XCircle className="h-3.5 w-3.5" /> Não compareceu
        </button>
        <button
          onClick={() => onComplete(task.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <Check className="h-3.5 w-3.5" /> Concluir
        </button>
        {task.clientPhone && onWhatsApp && (
          <button
            onClick={() => onWhatsApp(task.clientPhone!)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
        )}
      </div>
      {task.date && (
        <span className="flex items-center gap-1 text-xs text-slate-500 mt-2">
          <Calendar className="h-3 w-3" />
          {formatDate(task.date)}
        </span>
      )}
    </motion.div>
  );
}

function TaskCardConfirmar({
  task,
  onConfirm,
  onWhatsApp,
}: {
  task: TaskItem;
  onConfirm: (id: string) => void;
  onWhatsApp?: (phone: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 transition hover:border-slate-600/40 hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 truncate">{task.clientName}</h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <Clock className="h-3 w-3" />
          Aguardando
        </span>
      </div>
      {task.clientPhone && (
        <p className="text-xs text-slate-400 mt-0.5">{formatPhone(task.clientPhone)}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">
        Agendado para {task.date ? formatDate(task.date) : '...'}
        {task.time ? `, ${task.time}` : task.scheduledTime ? `, ${task.scheduledTime}` : ''}. Aguardando confirmação.
      </p>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onConfirm(task.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs text-amber-400 transition hover:bg-amber-500/25"
        >
          <Check className="h-3.5 w-3.5" /> Confirmar
        </button>
        {task.clientPhone && onWhatsApp && (
          <button
            onClick={() => onWhatsApp(task.clientPhone!)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
        )}
      </div>
      {task.date && (
        <span className="flex items-center gap-1 text-xs text-slate-500 mt-2">
          <Calendar className="h-3 w-3" />
          {formatDate(task.date)}
        </span>
      )}
    </motion.div>
  );
}

function TaskCardAniversario({
  task,
  onRemove,
  onWhatsApp,
}: {
  task: TaskItem;
  onRemove: (id: string) => void;
  onWhatsApp?: (phone: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 transition hover:border-slate-600/40 hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 truncate">{task.clientName}</h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <Cake className="h-3 w-3" />
          Aniversário
        </span>
      </div>
      {task.clientPhone && (
        <p className="text-xs text-slate-400 mt-0.5">{formatPhone(task.clientPhone)}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">{task.description || task.title}</p>
      <div className="flex items-center gap-2 mt-3">
        {task.clientPhone && onWhatsApp && (
          <button
            onClick={() => onWhatsApp(task.clientPhone!)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
        )}
        <button
          onClick={() => onRemove(task.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-700/40 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700/60"
        >
          <Check className="h-3.5 w-3.5" /> Ok
        </button>
      </div>
      {task.date && (
        <span className="flex items-center gap-1 text-xs text-slate-500 mt-2">
          <Cake className="h-3 w-3" />
          {formatDate(task.date)}
        </span>
      )}
    </motion.div>
  );
}

function TaskCardInativo({
  task,
  onRemove,
  onWhatsApp,
}: {
  task: TaskItem;
  onRemove: (id: string) => void;
  onWhatsApp?: (phone: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 transition hover:border-slate-600/40 hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-300 truncate">{task.clientName}</h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400 border border-red-500/20 whitespace-nowrap">
          <UserX className="h-3 w-3" />
          Inativo
        </span>
      </div>
      {task.clientPhone && (
        <p className="text-xs text-slate-400 mt-0.5">{formatPhone(task.clientPhone)}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">{task.description || task.title}</p>
      <div className="flex items-center gap-2 mt-3">
        {task.clientPhone && onWhatsApp && (
          <button
            onClick={() => onWhatsApp(task.clientPhone!)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
        )}
        <button
          onClick={() => onRemove(task.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-700/40 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700/60"
        >
          <Check className="h-3.5 w-3.5" /> Ok
        </button>
      </div>
      {task.date && (
        <span className="flex items-center gap-1 text-xs text-slate-500 mt-2">
          <Archive className="h-3 w-3" />
          {formatDate(task.date)}
        </span>
      )}
    </motion.div>
  );
}

/* ───────── Section (card independente com faixa lateral) ───────── */

function Section({
  title,
  icon: Icon,
  tasks,
  accentClass,
  borderClass,
  renderCard,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: TaskItem[];
  accentClass: string;
  borderClass: string;
  renderCard: (task: TaskItem) => React.ReactNode;
}) {
  if (tasks.length === 0) return null;

  const displayTasks = tasks.slice(0, 4);

  return (
    <div className={`rounded-2xl border border-slate-700/30 border-l-4 ${borderClass} bg-slate-800/40 p-4`}>
      {/* Header com ícone + título coloridos + contador + linha separadora */}
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700/30">
        <Icon className={`h-4 w-4 ${accentClass}`} />
        <span className={"text-base font-semibold " + accentClass}>{title}</span>
        <span className="ml-auto text-xs text-slate-500">{tasks.length}</span>
      </div>
      {/* Grid 3 colunas desktop, 1 coluna mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {displayTasks.map((task) => renderCard(task))}
        </AnimatePresence>
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
  onWhatsApp,
}: TasksPageProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const hideTask = useCallback((id: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
  }, []);

  const handleMarkNoShow = useCallback(
    (id: string) => {
      onMarkNoShow(id);
      hideTask(id);
    },
    [onMarkNoShow, hideTask],
  );

  const handleComplete = useCallback(
    (id: string) => {
      onComplete(id);
      hideTask(id);
    },
    [onComplete, hideTask],
  );

  const handleConfirm = useCallback(
    (id: string) => {
      onConfirm(id);
      hideTask(id);
    },
    [onConfirm, hideTask],
  );

  const handleRemove = useCallback(
    (id: string) => {
      onRemove(id);
      hideTask(id);
    },
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
    <div className="space-y-6">
      <Section
        title="Sem Conclusão"
        icon={XCircle}
        accentClass="text-orange-400"
        borderClass="border-l-orange-500/50"
        tasks={filteredTasks.overdue}
        renderCard={(task) => (
          <TaskCardSemConclusao
            key={task.id}
            task={task}
            onMarkNoShow={handleMarkNoShow}
            onComplete={handleComplete}
            onWhatsApp={onWhatsApp}
          />
        )}
      />
      <Section
        title="Confirmar"
        icon={Clock}
        accentClass="text-blue-400"
        borderClass="border-l-blue-500/50"
        tasks={filteredTasks.pendingConfirmation}
        renderCard={(task) => (
          <TaskCardConfirmar
            key={task.id}
            task={task}
            onConfirm={handleConfirm}
            onWhatsApp={onWhatsApp}
          />
        )}
      />
      <Section
        title="Aniversários"
        icon={Cake}
        accentClass="text-amber-400"
        borderClass="border-l-amber-500/50"
        tasks={filteredTasks.birthdays}
        renderCard={(task) => (
          <TaskCardAniversario
            key={task.id}
            task={task}
            onRemove={handleRemove}
            onWhatsApp={onWhatsApp}
          />
        )}
      />
      <Section
        title="Inativos"
        icon={UserX}
        accentClass="text-slate-400"
        borderClass="border-l-slate-500/40"
        tasks={filteredTasks.inactive}
        renderCard={(task) => (
          <TaskCardInativo
            key={task.id}
            task={task}
            onRemove={handleRemove}
            onWhatsApp={onWhatsApp}
          />
        )}
      />
    </div>
  );
}