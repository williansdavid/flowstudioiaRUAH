// src/features/appointments/components/BookingWizard/BookingWizard.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Scissors, User, CalendarDays, Clock, Lock } from 'lucide-react';
import { useCreateAppointment } from '@/features/appointments/hooks';
import { BookingWizardHeader } from './BookingWizardHeader';
import { BookingWizardFooter } from './BookingWizardFooter';
import { StepClient } from './Steps/StepClient';
import { StepService } from './Steps/StepService';
import { StepProfessional } from './Steps/StepProfessional';
import { StepDateSlots } from './Steps/StepDateSlots';
import { StepConfirm } from './Steps/StepConfirm';
import { Button } from '@/components/ui/Button';
import type { WizardStep, WizardSelection } from './BookingWizard.types';
import { STEP_LABELS, STEP_ORDER } from './BookingWizard.types';
import type { BookableStaffItem, ClientOption, ServiceOption } from '@/features/appointments/types';
import type { BusinessHours } from '@/sites/ruah/types';
import { cn } from '@/lib/cn';
import type { AppointmentItem } from '@/features/appointments';

interface Props {
  clients: ClientOption[];
  services: ServiceOption[];
  staff: BookableStaffItem[];
  businessHours: BusinessHours;
}

type ModalState = {
  open: boolean;
  mode:
    | { kind: 'create' }
    | { kind: 'edit'; appointment: AppointmentItem };
};

// ── Animação mobile ────────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
};

// ── Helpers de resumo para desktop ─────────────────────────────
const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

function getStepSummary(step: WizardStep, sel: WizardSelection): { label: string; sub: string } | null {
  switch (step) {
    case 'client':
      return sel.clientName ? { label: sel.clientName, sub: '' } : null;
    case 'service':
      return sel.serviceName
        ? { label: sel.serviceName, sub: `${sel.serviceDuration}min` }
        : null;
    case 'professional':
      return sel.staffName ? { label: sel.staffName, sub: '' } : null;
    case 'dateSlots': {
      if (!sel.slotStartsAt) return null;
      const d = new Date(sel.slotStartsAt);
      return { label: dateFmt.format(d), sub: timeFmt.format(d) };
    }
  }
}

function getStepIcon(step: WizardStep) {
  switch (step) {
    case 'client': return User;
    case 'service': return Scissors;
    case 'professional': return User;
    case 'dateSlots': return CalendarDays;
  }
}

// ── Mapa de campos por step + limpeza ─────────────────────────
const FIELDS_TO_CLEAR: Record<number, (keyof WizardSelection)[]> = {
  0: [
    'serviceId', 'serviceName', 'serviceDuration', 'servicePrice',
    'staffId', 'staffName', 'staffAvatarUrl', 'staffColor',
    'date', 'slotStartsAt', 'slotEndsAt',
  ],
  1: [
    'staffId', 'staffName', 'staffAvatarUrl', 'staffColor',
    'date', 'slotStartsAt', 'slotEndsAt',
  ],
  2: ['date', 'slotStartsAt', 'slotEndsAt'],
};

const defaultValues: WizardSelection = {
  clientId: '', clientName: '',
  serviceId: '', serviceName: '', serviceDuration: 0, servicePrice: 0,
  staffId: '', staffName: '', staffAvatarUrl: null, staffColor: null,
  date: '', slotStartsAt: '', slotEndsAt: '',
};

// ── Função pura: calcula completedUntil a partir de uma WizardSelection ──
function calcCompletedUntil(sel: WizardSelection): number {
  if (sel.clientId && sel.serviceId && sel.staffId && sel.date && sel.slotStartsAt) return 3;
  if (sel.clientId && sel.serviceId && sel.staffId) return 2;
  if (sel.clientId && sel.serviceId) return 1;
  if (sel.clientId) return 0;
  return -1;
}

// ── Função pura: limpa campos futuros a partir de um stepIndex ──
function clearFutureFields(sel: WizardSelection, fromStep: number): WizardSelection {
  const next = { ...sel };
  for (let i = fromStep; i < STEP_ORDER.length; i++) {
    const toClear = FIELDS_TO_CLEAR[i];
    if (toClear) {
      for (const f of toClear) {
        if (typeof next[f] === 'string') (next as any)[f] = '';
        else if (typeof next[f] === 'number') (next as any)[f] = 0;
        else (next as any)[f] = null;
      }
    }
  }
  return next;
}

// ── Componente principal ──────────────────────────────────────
export function BookingWizard({ clients, services, staff, businessHours }: Props) {
  const navigate = useNavigate();

  // Mobile
  const [step, setStep] = useState<WizardStep>('client');
  const [direction, setDirection] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compartilhado
  const [selection, setSelection] = useState<WizardSelection>(defaultValues);
  const [completedUntil, setCompletedUntil] = useState(-1);

  const createMutation = useCreateAppointment();
  const currentIndex = STEP_ORDER.indexOf(step);
  const isLastStep = step === 'dateSlots';
  const allCompleted = completedUntil === 3;

  const canGoNext = (() => {
    switch (step) {
      case 'client': return !!selection.clientId;
      case 'service': return !!selection.serviceId;
      case 'professional': return !!selection.staffId;
      case 'dateSlots': return !!selection.date && !!selection.slotStartsAt;
      default: return false;
    }
  })();

  // ── Atualizar seleção com clear cascade ──
  const updateSelection = useCallback((patch: Partial<WizardSelection>) => {
    setSelection((prev) => {
      const patchedKeys = Object.keys(patch) as (keyof WizardSelection)[];
      let changedStep = -1;
      for (const key of patchedKeys) {
        if (['clientId', 'clientName'].includes(key)) changedStep = 0;
        else if (['serviceId', 'serviceName', 'serviceDuration', 'servicePrice'].includes(key)) changedStep = 1;
        else if (['staffId', 'staffName', 'staffAvatarUrl', 'staffColor'].includes(key)) changedStep = 2;
        else if (['date', 'slotStartsAt', 'slotEndsAt'].includes(key)) changedStep = 3;
      }

      const oldCompleted = calcCompletedUntil(prev);
      const merged = { ...prev, ...patch };

      if (changedStep >= 0 && changedStep < oldCompleted) {
        const cleaned = clearFutureFields(merged, changedStep);
        setCompletedUntil(calcCompletedUntil(cleaned));
        return cleaned;
      }

      setCompletedUntil(calcCompletedUntil(merged));
      return merged;
    });
  }, []);

  // 🔥 CORRIGIDO: reopenStep força completedUntil pro step anterior ao reaberto
  const reopenStep = useCallback((reopenIndex: number) => {
    setSelection((prev) => {
      const cleaned = clearFutureFields(prev, reopenIndex);
      setCompletedUntil(reopenIndex - 1);
      return cleaned;
    });
  }, []);

  // ── Mobile navigation ──
  const goNext = useCallback(() => {
    if (isLastStep) {
      setShowConfirm(true);
      return;
    }
    setDirection(1);
    const nextIdx = currentIndex + 1;
    if (nextIdx < STEP_ORDER.length) {
      const nextStep = STEP_ORDER[nextIdx]!;
      setStep(nextStep);
    }
  }, [currentIndex, isLastStep]);

  const goBack = useCallback(() => {
    if (showConfirm) {
      setShowConfirm(false);
      return;
    }
    if (currentIndex === 0) return;
    setDirection(-1);
    setStep(STEP_ORDER[currentIndex - 1]!);
  }, [currentIndex, showConfirm]);

  // ── Confirmar ──
  const handleConfirm = useCallback(() => {
    if (!allCompleted) return;
    if (!selection.clientId || !selection.serviceId || !selection.staffId || !selection.slotStartsAt || !selection.slotEndsAt) return;

    createMutation.mutate(
      {
        clientId: selection.clientId,
        serviceId: selection.serviceId,
        staffId: selection.staffId,
        startsAt: selection.slotStartsAt,
        endsAt: selection.slotEndsAt,
      },
      {
        onSuccess: () => {
          navigate({ to: '/admin/agendamentos' });
        },
      },
    );
  }, [selection, createMutation, navigate, allCompleted]);

  // ── Render step ──
  const renderStepComponent = (s: WizardStep) => {
    switch (s) {
      case 'client':
        return (
          <StepClient
            clients={clients}
            value={selection.clientId}
            onChange={(id, name) => updateSelection({ clientId: id, clientName: name })}
          />
        );
      case 'service':
        return (
          <StepService
            services={services}
            value={selection.serviceId}
            onChange={(id, name, duration, price) =>
              updateSelection({ serviceId: id, serviceName: name, serviceDuration: duration, servicePrice: price })
            }
          />
        );
      case 'professional':
        return (
          <StepProfessional
            staff={staff}
            value={selection.staffId}
            onChange={(id, name, avatarUrl, color) =>
              updateSelection({ staffId: id, staffName: name, staffAvatarUrl: avatarUrl, staffColor: color })
            }
          />
        );
      case 'dateSlots':
        return (
          <StepDateSlots
            value={selection.date}
            slotStartsAt={selection.slotStartsAt}
            slotEndsAt={selection.slotEndsAt}
            staffId={selection.staffId}
            serviceId={selection.serviceId}
            businessHours={businessHours}
            onChange={(date, startsAt, endsAt) =>
              updateSelection({ date, slotStartsAt: startsAt, slotEndsAt: endsAt })
            }
          />
        );
    }
  };

  // ── Render desktop column ──
  const renderDesktopColumn = (s: WizardStep, i: number) => {
    const isCompleted = i <= completedUntil;
    const isActive = !allCompleted && i === completedUntil + 1;
    const isLocked = !isCompleted && !isActive;
    const Icon = getStepIcon(s);
    const summary = getStepSummary(s, selection);

    return (
      <div
        key={s}
          className={cn(
          'flex flex-col rounded-2xl border p-4 transition-all duration-200 min-h-0',
          isActive && 'border-cyan-500/30 bg-slate-900 shadow-lg shadow-cyan-500/5',
          isCompleted && !isActive && 'border-slate-700/20 bg-slate-900/60',
          isLocked && 'border-slate-800/30 bg-slate-900/30 opacity-50',
        )}
      >
        {/* Header do step */}
        <div className="mb-3 flex items-center gap-2 border-b border-slate-700/20 pb-2.5">
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all',
              isCompleted && !isActive && 'bg-emerald-500 text-white',
              isActive && 'border-2 border-cyan-400 bg-slate-800 text-cyan-400',
              isLocked && 'border border-slate-600 bg-slate-800/50 text-slate-600',
            )}
          >
            {isCompleted && !isActive ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span
            className={cn(
              'text-[11px] font-bold uppercase tracking-wider',
              isCompleted && !isActive && 'text-emerald-400',
              isActive && 'text-cyan-400',
              isLocked && 'text-slate-600',
            )}
          >
            {STEP_LABELS[s]}
          </span>
        </div>

        {/* Conteúdo */}
        {isLocked && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Lock className="h-4 w-4 text-slate-600" />
            <p className="text-[11px] text-slate-600">Preencha o passo anterior</p>
          </div>
        )}

        {isCompleted && !isActive && summary && (
          <button
            type="button"
            onClick={() => reopenStep(i)}
            className="group flex flex-col gap-2 rounded-xl border border-slate-700/20 bg-slate-800/30 p-3 text-left transition-all duration-200 hover:border-cyan-500/20 hover:bg-slate-800/60"
          >
            <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
              {summary.label}
            </p>
            {summary.sub && (
              <p className="text-xs text-slate-500">{summary.sub}</p>
            )}
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 group-hover:text-cyan-500 transition-colors">
              Clique para alterar
            </span>
          </button>
        )}

        {isCompleted && !isActive && !summary && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Check className="h-4 w-4 text-emerald-500/50" />
            <p className="text-[11px] text-slate-600">Concluído</p>
          </div>
        )}

        {/* 🔥 Scroll interno quando o step ativo tiver muito conteúdo (ex: StepDateSlots) */}
        {isActive && (
          <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
            {renderStepComponent(s)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      {/* ─── DESKTOP (lg+) ─── */}
      {/* 🔥 px-3 → px-1 pra puxar tudo pra esquerda */}
      <div className="hidden lg:flex flex-1 flex-col overflow-hidden px-1 py-5">
        {/* Header mais compacto */}
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Novo Agendamento</h1>
            <p className="text-[10px] text-slate-500">Preencha os passos abaixo.</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[1.8fr_1fr_1.3fr_1.3fr] gap-3 overflow-hidden px-2">
          {STEP_ORDER.map((s, i) => renderDesktopColumn(s, i))}
        </div>

        {allCompleted && (
          <div className="mt-4 flex justify-center border-t border-slate-700/20 pt-4">
            <Button
              type="button"
              onClick={handleConfirm}
              variant="primary"
              size="lg"
              className="gap-2 min-w-[240px]"
              isLoading={createMutation.isPending}
            >
              <Check className="h-5 w-5" />
              Confirmar agendamento
            </Button>
          </div>
        )}
      </div>

      {/* ─── MOBILE (<lg) ─── */}
      <div className="flex flex-1 flex-col lg:hidden">
        {!showConfirm && <BookingWizardHeader currentStep={step} />}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            {showConfirm ? (
              <motion.div
                key="confirm"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="h-full"
              >
                <StepConfirm selection={selection} isSaving={createMutation.isPending} />
              </motion.div>
            ) : (
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {renderStepComponent(step)}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-20" />
        </div>

        <BookingWizardFooter
          onBack={goBack}
          onNext={showConfirm ? handleConfirm : goNext}
          canGoNext={showConfirm ? true : canGoNext}
          isFirstStep={step === 'client' && !showConfirm}
          isLastStep={false}
          isConfirming={showConfirm}
          isSaving={createMutation.isPending}
        />
      </div>
    </div>
  );
}