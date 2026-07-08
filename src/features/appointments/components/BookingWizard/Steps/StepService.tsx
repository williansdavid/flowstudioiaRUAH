import { Scissors } from 'lucide-react';
import { Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ServiceOption } from '@/features/appointments/types';

interface Props {
  services: ServiceOption[];
  value: string;
  onChange: (id: string, name: string, duration: number, price: number) => void;
}

export function StepService({ services, value, onChange }: Props) {
  return (
    <div className="px-0 pt-0 sm:px-5 sm:pt-2">
      <p className="hidden text-lg font-bold text-slate-100 sm:block">
        Qual o serviço?
      </p>
      <p className="hidden text-sm text-slate-400 sm:block">
        Escolha o serviço que será realizado.
      </p>

      <div className="mt-0 sm:mt-4 flex flex-col gap-2">
        {services.map((svc) => {
          const selected = value === svc.id;

          return (
            <button
              key={svc.id}
              type="button"
              onClick={() =>
                onChange(svc.id, svc.name, svc.durationMinutes, svc.price)
              }
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-gradient-to-b p-3.5 text-left transition-all duration-200 hover:brightness-125 active:scale-[0.99]',
                selected
                  ? 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/10'
                  : 'from-slate-800/40 to-slate-800/10 border-slate-700/30',
              )}
            >
              {/* Scissors icon */}
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors',
                  selected
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'bg-slate-700/30 text-slate-500',
                )}
              >
                <Scissors className="size-5" />
              </div>

              {/* Texto */}
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-200">
                  {svc.name}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {svc.durationMinutes}min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-3" />
                    R$ {svc.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Circle indicator */}
              <div
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border transition-all',
                  selected
                    ? 'border-cyan-400 bg-cyan-500 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-500/20'
                    : 'border-slate-600',
                )}
              >
                {selected && (
                  <div className="size-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}