// src/features/appointments/components/BookingWizard/Steps/StepClient.tsx
import { UserPlus, CheckCircle2, ArrowLeft, Phone } from 'lucide-react';
import { ClientCombobox } from '@/features/appointments/components/ClientCombobox';
import { QuickClientModal } from '@/features/appointments/components/QuickClientModal';
import { useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (clientId: string, clientName: string) => void;
}

function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '').replace(/^55/, '');
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}

export function StepClient({ value, onChange }: Props) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Cliente selecionado → card de confirmação
  if (value) {
    return (
      <div className="flex flex-col gap-6 px-5 pt-2">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/70">
              Cliente selecionado
            </p>
            <h3 className="text-xl font-bold text-slate-100">{selectedName}</h3>
            {selectedPhone && (
              <p className="flex items-center justify-center gap-1.5 text-base text-slate-400">
                <Phone className="h-4 w-4" />
                {formatPhone(selectedPhone)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onChange('', ''); setSelectedName(''); setSelectedPhone(null); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/40 px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:border-slate-600/50 hover:text-slate-300 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Trocar cliente
          </button>
        </div>

        <QuickClientModal
          open={quickOpen}
          initialName={quickName}
          onClose={() => setQuickOpen(false)}
          onCreated={(c) => {
            onChange(c.id, c.name);
            setSelectedName(c.name);
            setSelectedPhone(c.phone ?? null);
            setQuickOpen(false);
          }}
        />
      </div>
    );
  }

  // Nenhum cliente selecionado → busca + cadastro
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
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-500/30 py-2 text-sm font-semibold text-orange-400 transition-all duration-200 hover:border-orange-500/50 hover:text-orange-300 hover:bg-orange-500/10 active:scale-[0.98]"
        >
          <UserPlus className="h-5 w-5" />
          Cadastrar novo cliente
        </button>
        <div className="flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-500/30 py-2 text-sm font-semibold text-orange-400 transition-all duration-200 hover:border-orange-500/50 hover:text-orange-300 hover:bg-orange-500/10 active:scale-[0.98]">
          <ClientCombobox
            value={value}
            onChange={(id, name, phone) => {
              setSelectedName(name);
              setSelectedPhone(phone);
              onChange(id, name);
            }}
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
          setSelectedName(c.name);
          setSelectedPhone(c.phone ?? null);
          setQuickOpen(false);
        }}
      />
    </div>
  );
}