// src/features/appointments/components/BookingWizard/Steps/StepClient.tsx
import { UserPlus } from 'lucide-react';
import { ClientCombobox } from '@/features/appointments/components/ClientCombobox';
import { QuickClientModal } from '@/features/appointments/components/QuickClientModal';
import { useState, useEffect } from 'react';


interface Props {
  value: string;
  onChange: (clientId: string, clientName: string) => void;
}

export function StepClient({ value, onChange }: Props) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Quem é o cliente?</h2>
        <p className="text-sm text-slate-500">Selecione um cliente existente ou cadastre um novo.</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setQuickName('');
            setQuickOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-500/30 py-4 text-sm font-semibold text-orange-400 transition-all duration-200 hover:border-orange-500/50 hover:text-orange-300 hover:bg-orange-500/10 active:scale-[0.98]"
        >
          <UserPlus className="h-5 w-5" />
          Cadastrar novo cliente
        </button>
        <div className="flex-1">
      <ClientCombobox
        value={value}
        onChange={(id) => onChange(id, 'Cliente')}
        onCreateNew={(name) => {
          setQuickName(name);
          setQuickOpen(true);
        }}
        positionAbove={isMobile}
      />
        </div>
      </div>

      <QuickClientModal
        open={quickOpen}
        initialName={quickName}
        onClose={() => setQuickOpen(false)}
        onCreated={(c) => {
          onChange(c.id, c.name);
          setQuickOpen(false);
        }}
      />
    </div>
  );
}