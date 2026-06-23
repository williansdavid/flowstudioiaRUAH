// src/features/appointments/components/BookingWizard/Steps/StepClient.tsx

import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { ClientCombobox } from '@/features/appointments/components/ClientCombobox';
import { QuickClientModal } from '@/features/appointments/components/QuickClientModal';
import type { ClientOption } from '@/features/appointments/types';

interface Props {
  clients: ClientOption[];
  value: string;
  onChange: (clientId: string, clientName: string) => void;
}

export function StepClient({ clients, value, onChange }: Props) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState('');

  return (
    <div className="flex flex-col gap-6 px-5 pt-2">
      {/* Header do passo */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Quem é o cliente?</h2>
        <p className="text-sm text-slate-500">Selecione um cliente existente ou cadastre um novo.</p>
      </div>

      {/* Campo de busca */}
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          <ClientCombobox
            clients={clients}
            value={value}
            onChange={(id) => {
              const client = clients.find((c) => c.id === id);
              onChange(id, client?.name ?? 'Cliente');
            }}
            onCreateNew={(name) => {
              setQuickName(name);
              setQuickOpen(true);
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setQuickName('');
            setQuickOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700/40 py-4 text-sm font-semibold text-slate-400 transition-all duration-200 hover:border-orange-500/30 hover:text-orange-400 hover:bg-orange-500/5 active:scale-[0.98]"
        >
          <UserPlus className="h-5 w-5" />
          Cadastrar novo cliente
        </button>
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