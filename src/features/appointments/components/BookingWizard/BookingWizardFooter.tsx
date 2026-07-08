import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/features/utils/ui/Button';

interface Props {
  onNext: () => void;
  canGoNext: boolean;
  isLastStep: boolean;
  isSaving?: boolean;
}

export function BookingWizardFooter({
  onNext,
  canGoNext,
  isLastStep,
  isSaving,
}: Props) {
  return (
    <div className="sticky bottom-0 border-t border-slate-700/20 bg-slate-900/90 backdrop-blur-xl px-5 py-4">
      <div className="flex items-center justify-end gap-3">
        {isLastStep ? (
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