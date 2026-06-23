// src/features/appointments/components/BookingWizard/Steps/StepService.tsx

import { Scissors, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ServiceOption } from '@/features/appointments/types';

interface Props {
  services: ServiceOption[];
  value: string;
  onChange: (serviceId: string, serviceName: string, duration: number, price: number) => void;
}

export function StepService({ services, value, onChange }: Props) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 pt-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
          <Scissors className="h-6 w-6 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-500">Nenhum serviço disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Qual o serviço?</h2>
        <p className="text-sm text-slate-500">Escolha o serviço que será realizado.</p>
      </div>

      <div className="flex flex-col gap-2">
        {services.map((service) => {
          const isSelected = value === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onChange(service.id, service.name, service.durationMinutes, Number(service.price))}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]',
                isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'border-slate-700/30 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-800/70',
              )}
            >
              {/* Ícone */}
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                  isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/30 text-slate-500',
                )}
              >
                <Scissors className="h-5 w-5" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-bold', isSelected ? 'text-cyan-300' : 'text-slate-100')}>
                  {service.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {service.durationMinutes}min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {Number(service.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* Check */}
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all',
                  isSelected ? 'bg-cyan-500 text-white' : 'border border-slate-600',
                )}
              >
                {isSelected && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}