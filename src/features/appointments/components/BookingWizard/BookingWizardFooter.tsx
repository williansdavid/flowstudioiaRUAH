// src/features/appointments/components/BookingWizard/BookingWizardFooter.tsx

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface Props {
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isConfirming: boolean;
  isSaving?: boolean;
}

export function BookingWizardFooter({
  onBack,
  onNext,
  canGoNext,
  isFirstStep,
  isLastStep,
  isConfirming,
  isSaving,
}: Props) {
  return (
    <div className="sticky bottom-0 border-t border-slate-700/20 bg-slate-900/90 backdrop-blur-xl px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Voltar */}
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95',
            isFirstStep
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        {/* Avançar / Confirmar */}
        {isConfirming ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSaving}
            isLoading={isSaving}
            variant="primary"
            size="sm"
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            Confirmar agendamento
          </Button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95',
              canGoNext
                ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed',
            )}
          >
            Continuar
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}