import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface PdvHeaderProps {
  clientName: string;
  appointmentId?: string;
}

export function PdvHeader({ clientName, appointmentId }: PdvHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 border-b border-slate-700/20 pb-4">
      <button
        onClick={() => navigate({ to: appointmentId ? '/admin/agendamentos' : '/admin' })}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-orange-400" />
        <div>
          <p className="text-sm font-medium text-slate-200">{clientName}</p>
          <p className="text-xs text-slate-500">
            {appointmentId ? 'PDV via agendamento' : 'PDV avulso'}
          </p>
        </div>
      </div>
    </div>
  );
}