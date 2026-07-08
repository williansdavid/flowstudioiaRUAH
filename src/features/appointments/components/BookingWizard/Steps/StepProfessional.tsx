// src/features/appointments/components/BookingWizard/Steps/StepProfessional.tsx

import { cn } from '@/lib/cn';
import { staffColor } from '@/features/appointments/components/DayCalendar/staffColor';
import type { BookableStaffItem } from '@/features/appointments/types';

interface Props {
  staff: BookableStaffItem[];
  value: string;
  onChange: (staffId: string, staffName: string, avatarUrl: string | null, color: string | null) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]![0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : '';
  return (first + last).toUpperCase();
}

function StaffAvatar({
  name,
  avatarUrl,
  color,
}: {
  name: string;
  avatarUrl: string | null;
  color: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-full object-cover"
        style={{ boxShadow: `0 0 0 3px ${color}` }}
      />
    );
  }
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}40` }}
    >
      {initials(name)}
    </div>
  );
}

export function StepProfessional({ staff, value, onChange }: Props) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 pt-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
          <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Nenhum profissional disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Escolha o profissional</h2>
        <p className="text-sm text-slate-500">Selecione quem vai realizar o serviço.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {staff.map((s) => {
          const isSelected = value === s.id;
          const color = s.color ?? staffColor(s.id);

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id, s.name, s.avatarUrl ?? null, s.color)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200 active:scale-[0.97]',
                isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'border-slate-700/30 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-800/70',
              )}
            >
              <StaffAvatar name={s.name} avatarUrl={s.avatarUrl ?? null} color={color} />
              <p className={cn('text-sm font-bold leading-tight', isSelected ? 'text-cyan-300' : 'text-slate-100')}>
                {s.name}
              </p>
              {isSelected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Selecionado
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
