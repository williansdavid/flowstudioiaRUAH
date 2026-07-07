import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CalendarDays, Check, Scissors, User, Lock } from 'lucide-react';
import { useCreateClientAppointment } from '@/features/appointments/hooks/useCreateClientAppointment';
import { StepService } from './BookingWizard/Steps/StepService';
import { StepProfessional } from './BookingWizard/Steps/StepProfessional';
import { StepDateSlots } from './BookingWizard/Steps/StepDateSlots';
import { StepConfirm } from './BookingWizard/Steps/StepConfirm';
import { Button } from '@/features/utils/ui/Button';
import type { BookableStaffItem, ServiceOption } from '@/features/appointments/types';
import { cn } from '@/lib/cn';

// ── Types ─────────────────────────────────────────────────────
type ClientStep = 'service' | 'professional' | 'dateSlots';

const STEP_LABELS: Record<ClientStep, string> = {
  service: 'Serviço',
  professional: 'Profissional',
  dateSlots: 'Data e horário',
};

const STEP_ORDER: ClientStep[] = ['service', 'professional', 'dateSlots'];

interface ClientSelection {
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  staffColor: string | null;
  date: string;
  slotStartsAt: string;
  slotEndsAt: string;
}

interface Props {
  services: ServiceOption[];
  staff: BookableStaffItem[];
  clientName: string;
}

// ── Helpers ───────────────────────────────────────────────────
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

function getSummary(s: ClientStep, sel: ClientSelection): { label: string; sub: string } | null {
  switch (s) {
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

function getStepIcon(s: ClientStep) {
  switch (s) {
    case 'service': return Scissors;
    case 'professional': return User;
    case 'dateSlots': return CalendarDays;
  }
}

const defaultValues: ClientSelection = {
  serviceId: '',
  serviceName: '',
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

// ── Componente principal ──────────────────────────────────────
export function ClientBookingWizard({ services, staff, clientName }: Props) {
  const navigate = useNavigate();
  const createMutation = useCreateClientAppointment();

  const [step, setStep] = useState<ClientStep>('service');
  const [selection, setSelection] = useState<ClientSelection>(defaultValues);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentIndex = STEP_ORDER.indexOf(step);
  const isLastStep = step === 'dateSlots';

  const allCompleted = !!(
    selection.serviceId &&
    selection.staffId &&
    selection.date &&
    selection.slotStartsAt
  );

  const canGoNext = (() => {
    switch (step) {
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

  // ── Navegação ──
  const goNext = () => {
    if (isLastStep) {
      setShowConfirm(true);
      return;
    }
    const nextIdx = currentIndex + 1;
    if (nextIdx < STEP_ORDER.length) {
      setStep(STEP_ORDER[nextIdx]!);
    }
  };

  const goBack = () => {
    if (showConfirm) {
      setShowConfirm(false);
      return;
    }
    if (currentIndex === 0) return;
    setStep(STEP_ORDER[currentIndex - 1]!);
  };

  // ── Confirmar ──
  const handleConfirm = () => {
    if (!allCompleted) return;
    createMutation.mutate(
      {
        serviceId: selection.serviceId,
        staffId: selection.staffId,
        startsAt: selection.slotStartsAt,
        endsAt: selection.slotEndsAt,
      },
      {
        onSuccess: () => {
          navigate({ to: '/cliente/agendamentos' });
        },
      },
    );
  };

  // ── Render step ──
  const renderStepComponent = () => {
    switch (step) {
      case 'service':
        return (
          <StepService
            services={services}
            value={selection.serviceId}
            onChange={(id, name, duration, price) =>
              setSelection({
                ...defaultValues,
                serviceId: id,
                serviceName: name,
                serviceDuration: duration,
                servicePrice: price,
              })
            }
          />
        );
      case 'professional':
        return (
          <StepProfessional
            staff={staff}
            value={selection.staffId}
            onChange={(id, name, avatarUrl, color) =>
              setSelection((prev) => ({
                ...prev,
                staffId: id,
                staffName: name,
                staffAvatarUrl: avatarUrl,
                staffColor: color,
                date: '',
                slotStartsAt: '',
                slotEndsAt: '',
              }))
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
            onChange={(date, startsAt, endsAt) =>
              setSelection((prev) => ({
                ...prev,
                date,
                slotStartsAt: startsAt,
                slotEndsAt: endsAt,
              }))
            }
          />
        );
    }
  };

  // ── Desktop: coluna por step ──
  const renderDesktopColumn = (s: ClientStep, i: number) => {
    const completedUntil = (() => {
      if (selection.serviceId && selection.staffId && selection.date && selection.slotStartsAt) return 2;
      if (selection.serviceId && selection.staffId) return 1;
      if (selection.serviceId) return 0;
      return -1;
    })();

    const isCompleted = i <= completedUntil;
    const isActive = i === completedUntil + 1;
    const isLocked = !isCompleted && !isActive;
    const Icon = getStepIcon(s);
    const summary = getSummary(s, selection);

    const handleReopen = () => {
      setStep(s);
      if (s === 'service') {
        setSelection({ ...defaultValues, serviceId: selection.serviceId, serviceName: selection.serviceName, serviceDuration: selection.serviceDuration, servicePrice: selection.servicePrice });
      } else if (s === 'professional') {
        setSelection((prev) => ({ ...prev, date: '', slotStartsAt: '', slotEndsAt: '' }));
      }
      setShowConfirm(false);
    };

    return (
      <div key={s} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {isCompleted && !isActive ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-4 w-4 text-emerald-400" />
            </div>
          ) : (
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold',
                isActive
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-600',
              )}
            >
              {i + 1}
            </div>
          )}
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600',
            )}
          >
            {STEP_LABELS[s]}
          </span>
        </div>

        {isLocked && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-700/30 p-4 text-center">
            <Lock className="h-5 w-5 text-slate-600" />
            <p className="text-xs text-slate-600">Preencha o passo anterior</p>
          </div>
        )}

        {isCompleted && !isActive && summary && (
          <button
            type="button"
            onClick={handleReopen}
            className="group flex flex-col gap-2 rounded-xl border border-slate-700/20 bg-slate-800/30 p-3 text-left transition-all duration-200 hover:border-cyan-500/20 hover:bg-slate-800/60"
          >
            <p className="text-sm font-semibold text-slate-200">{summary.label}</p>
            {summary.sub && <p className="text-xs text-slate-500">{summary.sub}</p>}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500 opacity-0 transition-opacity group-hover:opacity-100">
              Clique para alterar
            </p>
          </button>
        )}

        {isCompleted && !isActive && !summary && (
          <div className="rounded-xl border border-slate-700/20 bg-slate-800/30 p-3 text-center">
            <p className="text-xs text-emerald-500">Concluído</p>
          </div>
        )}

        {isActive && (
          <div className="max-h-[400px] overflow-y-auto">
            {renderStepComponent()}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ─── DESKTOP (lg+) ─── */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Novo Agendamento</h2>
          <p className="text-sm text-slate-500">Preencha os passos abaixo.</p>
        </div>

        <div className="flex flex-col gap-5">
          {STEP_ORDER.map((s, i) => renderDesktopColumn(s, i))}
        </div>

        {allCompleted && !showConfirm && (
          <Button type="button" onClick={() => setShowConfirm(true)} className="w-full">
            Revisar agendamento
          </Button>
        )}

        {showConfirm && (
          <div className="flex flex-col gap-4">
            <StepConfirm
              selection={{
                clientId: '',
                clientName,
                serviceId: selection.serviceId,
                serviceName: selection.serviceName,
                serviceDuration: selection.serviceDuration,
                servicePrice: selection.servicePrice,
                staffId: selection.staffId,
                staffName: selection.staffName,
                staffAvatarUrl: selection.staffAvatarUrl,
                staffColor: selection.staffColor,
                date: selection.date,
                slotStartsAt: selection.slotStartsAt,
                slotEndsAt: selection.slotEndsAt,
              }}
              isSaving={createMutation.isPending}
            />
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowConfirm(false)}>
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Salvando…' : 'Confirmar agendamento'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MOBILE (<lg) ─── */}
      <div className="flex flex-col lg:hidden">
        {/* Header com steps */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {currentIndex + 1}/{STEP_ORDER.length}
            </span>
            <span className="text-sm font-bold text-slate-100">{STEP_LABELS[step]}</span>
          </div>
          <div className="flex gap-1">
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 w-6 rounded-full transition-colors',
                  i < currentIndex
                    ? 'bg-emerald-500'
                    : i === currentIndex
                      ? 'bg-cyan-500'
                      : 'bg-slate-700',
                )}
              />
            ))}
          </div>
        </div>

        {!showConfirm && (
          <div className="flex-1 overflow-y-auto">{renderStepComponent()}</div>
        )}

        {showConfirm ? (
          <div className="flex flex-col gap-4 p-4">
            <StepConfirm
              selection={{
                clientId: '',
                clientName,
                serviceId: selection.serviceId,
                serviceName: selection.serviceName,
                serviceDuration: selection.serviceDuration,
                servicePrice: selection.servicePrice,
                staffId: selection.staffId,
                staffName: selection.staffName,
                staffAvatarUrl: selection.staffAvatarUrl,
                staffColor: selection.staffColor,
                date: selection.date,
                slotStartsAt: selection.slotStartsAt,
                slotEndsAt: selection.slotEndsAt,
              }}
              isSaving={createMutation.isPending}
            />
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Salvando…' : 'Confirmar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentIndex === 0}
            >
              Voltar
            </Button>
            <Button type="button" onClick={goNext} disabled={!canGoNext}>
              {isLastStep ? 'Revisar' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}