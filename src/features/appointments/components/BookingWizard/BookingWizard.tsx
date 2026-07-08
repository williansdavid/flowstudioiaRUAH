import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useCreateAppointment } from '@/features/appointments/hooks';
import { useCreateClientAppointment } from '@/features/appointments/hooks';
import { BookingWizardHeader } from './BookingWizardHeader';
import { BookingWizardFooter } from './BookingWizardFooter';
import { StepClient } from './Steps/StepClient';
import { StepService } from './Steps/StepService';
import { StepProfessional } from './Steps/StepProfessional';
import { StepDateSlots } from './Steps/StepDateSlots';
import { StepConfirm } from './Steps/StepConfirm';
import { User } from 'lucide-react';
import type { WizardStep, WizardSelection } from './BookingWizard.types';
import { STEP_ORDER } from './BookingWizard.types';
import type { BookableStaffItem, ServiceOption } from '@/features/appointments/types';

interface Props {
  services: ServiceOption[];
  staff: BookableStaffItem[];
  mode: 'admin' | 'client' | 'staff';
  clientName?: string;
}

// ── Mobile animation

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

// ── Helpers

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
  clientId: '',
  clientName: '',
  serviceId: '',
  serviceName: '',
  clientPhone: null,
  serviceDuration: 0,
  servicePrice: 0,
  staffId: '',
  staffName: '',
  staffAvatarUrl: null,
  staffColor: null,
  date: '',
  slotStartsAt: '',
  slotEndsAt: '',
};

function calcCompletedUntil(sel: WizardSelection): number {
  if (sel.clientId && sel.serviceId && sel.staffId && sel.date && sel.slotStartsAt) return 3;
  if (sel.clientId && sel.serviceId && sel.staffId) return 2;
  if (sel.clientId && sel.serviceId) return 1;
  if (sel.clientId) return 0;
  return -1;
}

function clearFutureFields(sel: WizardSelection, fromStep: number): WizardSelection {
  const next = { ...sel };
  for (let i = fromStep; i < STEP_ORDER.length; i++) {
    const toClear = FIELDS_TO_CLEAR[i];
    if (toClear) {
      for (const f of toClear) {
        if (typeof next[f] === 'string') (next as Record<string, unknown>)[f] = '';
        else if (typeof next[f] === 'number') (next as Record<string, unknown>)[f] = 0;
        else (next as Record<string, unknown>)[f] = null;
      }
    }
  }
  return next;
}

/** Steps que aparecem no mobile (admin tem client, client/staff não) */
function getSteps(mode: Props['mode']): WizardStep[] {
  if (mode === 'admin') return ['client', 'service', 'professional', 'dateSlots'];
  return ['service', 'professional', 'dateSlots'];
}

// ── Componente principal

export function BookingWizard({ services, staff, mode, clientName }: Props) {
  const navigate = useNavigate();

  const steps = getSteps(mode);
  const isClientMode = mode === 'client' || mode === 'staff';
  const isAdminMode = mode === 'admin';

  // Mobile
  const [step, setStep] = useState<WizardStep>(isAdminMode ? 'client' : 'service');
  const [direction, setDirection] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compartilhado
  const [selection, setSelection] = useState<WizardSelection>({
    ...defaultValues,
    clientId: isClientMode ? 'self' : '',
    clientName: isClientMode ? (clientName ?? '') : '',
  });

  const initialCompleted = isClientMode && clientName ? 0 : -1;
  const [completedUntil, setCompletedUntil] = useState(initialCompleted);

  const createMutation = useCreateAppointment();
  const createClientMutation = useCreateClientAppointment();

  const currentIndex = steps.indexOf(step);
  const isLastStep = step === steps[steps.length - 1];
  const allCompleted = completedUntil === 3;

  const canGoNext = (() => {
    switch (step) {
      case 'client':
        return !!selection.clientId;
      case 'service':
        return !!selection.serviceId;
      case 'professional':
        return !!selection.staffId;
      case 'dateSlots':
        return !!selection.date && !!selection.slotStartsAt;
      default:
        return false;
    }
  })();

  // ── Atualizar seleção com clear cascade

  const updateSelection = useCallback(
    (patch: Partial<WizardSelection>) => {
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
    },
    [],
  );

  // ── Mobile navigation

  const goNext = useCallback(() => {
    if (isLastStep) {
      setShowConfirm(true);
      return;
    }
    setDirection(1);
    const nextIdx = currentIndex + 1;
    if (nextIdx < steps.length) {
      setStep(steps[nextIdx]!);
    }
  }, [currentIndex, isLastStep, steps]);

  const goBack = useCallback(() => {
    if (showConfirm) {
      setShowConfirm(false);
      return;
    }
    if (currentIndex === 0) return;
    setDirection(-1);
    setStep(steps[currentIndex - 1]!);
  }, [currentIndex, showConfirm, steps]);

  // ── Confirmar

  const handleConfirm = useCallback(() => {
    if (!allCompleted) return;
    if (!selection.clientId || !selection.serviceId || !selection.staffId || !selection.slotStartsAt || !selection.slotEndsAt) return;

    const payload = {
      clientId: isClientMode ? 'self' : selection.clientId,
      serviceId: selection.serviceId,
      staffId: selection.staffId,
      startsAt: selection.slotStartsAt,
      endsAt: selection.slotEndsAt,
    };

    if (isClientMode) {
      createClientMutation.mutate(payload, {
        onSuccess: () => {
          navigate({ to: '/cliente/agendamentos' });
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate({ to: '/admin/agendamentos' });
        },
      });
    }
  }, [selection, createMutation, createClientMutation, navigate, allCompleted, isClientMode]);

  // ── Render step (mobile)

  const renderStepComponent = (s: WizardStep) => {
    switch (s) {
      case 'client':
        return (
          <StepClient
            value={selection.clientId}
            onChange={(id, name, phone) => updateSelection({ clientId: id, clientName: name, clientPhone: phone })}
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
// No BookingWizard.tsx, encontrar o case 'dateSlots' no switch
case 'dateSlots':
  return (
    <StepDateSlots
      value={selection.date}
      slotStartsAt={selection.slotStartsAt}
      slotEndsAt={selection.slotEndsAt}
      staffId={selection.staffId}
      serviceId={selection.serviceId}
      onChange={(date, slotStartsAt, slotEndsAt) =>
        updateSelection({ date, slotStartsAt, slotEndsAt })
      }
      onSlotConfirmed={goNext}  // 🔥 NOVO — fecha modal + avança pro Confirm direto
    />
  );
    }
  };

  // ── Card fixo do cliente no desktop (client/staff mode)

  const renderClientCard = () => (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/20 bg-gradient-to-b from-slate-800/30 to-slate-800/10 p-5">
      <p className="text-lg font-bold text-slate-100">Cliente</p>
      <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/30 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <User className="size-5" />
        </div>
        <span className="text-sm font-semibold text-slate-200">
          {selection.clientName || '—'}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP (lg+) ─── */}
      <div className="hidden flex-col gap-6 lg:flex">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {isAdminMode ? 'Novo Agendamento' : 'Agendar Serviço'}
          </h1>
          <p className="text-sm text-slate-400">Preencha os passos abaixo.</p>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {/* Coluna 1 — Cliente */}
          {isAdminMode ? (
            <StepClient
              value={selection.clientId}
              onChange={(id, name, phone) => updateSelection({ clientId: id, clientName: name, clientPhone: phone })}
            />
          ) : (
            renderClientCard()
          )}

          {/* Coluna 2 — Serviço */}
          <StepService
            services={services}
            value={selection.serviceId}
            onChange={(id, name, duration, price) =>
              updateSelection({ serviceId: id, serviceName: name, serviceDuration: duration, servicePrice: price })
            }
          />

          {/* Coluna 3 — Profissional */}
          <StepProfessional
            staff={staff}
            value={selection.staffId}
            onChange={(id, name, avatarUrl, color) =>
              updateSelection({ staffId: id, staffName: name, staffAvatarUrl: avatarUrl, staffColor: color })
            }
          />

{/* Coluna 4 — Data e horário */}
<div className="min-w-0">
  <StepDateSlots
    staffId={selection.staffId}
    serviceId={selection.serviceId}
    value={selection.date}
    slotStartsAt={selection.slotStartsAt}
    slotEndsAt={selection.slotEndsAt}
    onChange={(date, startsAt, endsAt) =>
      updateSelection({ date, slotStartsAt: startsAt, slotEndsAt: endsAt })
    }
    onSlotConfirmed={goNext}
  />
</div>
        </div>

        {/* Barra de confirmação */}
        {allCompleted && (
          <div className="flex items-center justify-end gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 p-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-300">Todos os dados preenchidos</p>
              <p className="text-xs text-slate-500">Revise as informações e confirme o agendamento.</p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={createMutation.isPending || createClientMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
              {(createMutation.isPending || createClientMutation.isPending) ? 'Salvando…' : 'Confirmar agendamento'}
            </button>
          </div>
        )}
      </div>

      {/* ─── MOBILE (<lg) ─── */}
      <div className="flex flex-col gap-4 lg:hidden">
        {<BookingWizardHeader currentStep={step} onBack={goBack} />}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={showConfirm ? 'confirm' : step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {!showConfirm && (
              <div className="flex-1">
                {renderStepComponent(step)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {showConfirm ? (
          <StepConfirm
            selection={selection}
            onBack={goBack}
            onConfirm={handleConfirm}
            isSaving={createMutation.isPending || createClientMutation.isPending}
          />
        ) : (
          <BookingWizardFooter
            onNext={goNext}
            canGoNext={canGoNext}
            isLastStep={isLastStep}
            isSaving={createMutation.isPending || createClientMutation.isPending}
          />
        )}
      </div>
    </>
  );
}