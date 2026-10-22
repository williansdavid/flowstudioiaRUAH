import { ArrowLeft, ArrowLeftCircleIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { WizardStep } from './BookingWizard.types';
import { STEP_LABELS, STEP_ORDER } from './BookingWizard.types';

interface Props {
  currentStep: WizardStep;
  onBack?: () => void;
}

export function BookingWizardHeader({ currentStep, onBack }: Props) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex flex-col gap-2 px-5 pt-5 pb-2">
      {/* Dots + linha conectando */}
      <div className="flex items-center justify-center gap-1">
        {STEP_ORDER.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={step} className="flex items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  isCompleted && 'bg-cyan-500 text-white',
                  isCurrent && 'border-2 border-cyan-400 bg-slate-800 text-cyan-400',
                  isFuture && 'border border-slate-600 bg-slate-800/50 text-slate-600',
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {i < STEP_ORDER.length - 1 && (
                <div
                  className={cn(
                    'h-px w-8 sm:w-12 transition-colors duration-300',
                    i < currentIndex ? 'bg-cyan-500/60' : 'bg-slate-700/40',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Label do passo atual + back (mobile) */}
      <div
        className={cn(
          'flex items-center gap-1',
          onBack && currentIndex > 0 ? 'justify-center' : 'justify-center',
        )}
      >
        {onBack && currentIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center rounded-lg p-1 text-slate-400 transition hover:text-slate-200 sm:hidden"
            aria-label="Voltar"
          >
            <ArrowLeftCircleIcon className="h-7 w-7 text-cyan-400" />
          </button>
        )}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-cyan-400">
          {STEP_LABELS[currentStep]}
        </p>
      </div>
    </div>
  );
}