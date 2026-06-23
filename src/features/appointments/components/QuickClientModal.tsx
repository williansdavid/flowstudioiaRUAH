// src/features/appointments/components/QuickClientModal.tsx
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, UserPlus } from 'lucide-react';
import type { ClientOption } from '../types';
import { useCreateQuickClient } from '../hooks';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
interface Props {
  open: boolean;
  initialName?: string;
  onClose: () => void;
  onCreated: (client: ClientOption) => void;
}

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400';
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-800';

function formatPhone(value: string) {
  const v = value.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
}

export function QuickClientModal({
  open,
  initialName,
  onClose,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');

  const createMut = useCreateQuickClient();

  useEffect(() => {
    if (open) {
      setFullName(initialName ?? '');
      setPhone('');
      setEmail('');
      setBirthDay('');
      setBirthMonth('');
    }
  }, [open, initialName]);

  const missingFields: string[] = [];
  if (fullName.trim().length < 2) missingFields.push('Nome');

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) missingFields.push('Telefone');

  const canSubmit = missingFields.length === 0 && !createMut.isPending;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;
    try {
      const client = await createMut.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        birthDay: birthDay ? parseInt(birthDay, 10) : undefined,
        birthMonth: birthMonth ? parseInt(birthMonth, 10) : undefined,
      });
      onCreated(client);
      onClose();
    } catch {
      // toast tratado no hook
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* ═══ OVERLAY premium ═══ */}
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        {/* ═══ CONTENT premium ═══ */}
        <Dialog.Content
          className={cn(
            'fixed z-[60] flex w-[calc(100vw-2rem)] sm:max-w-md flex-col',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            // Fundo + borda premium, igual ao AppointmentFormModal
            'bg-slate-900 border border-slate-700/30 ring-1 ring-slate-700/20 shadow-2xl',
            'rounded-2xl focus:outline-none',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/20 px-5 py-4">
            <Dialog.Title className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Novo cliente
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Nome *</span>
              <input
                autoFocus
                type="text"
                maxLength={120}
                className={fieldInput}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Telefone *</span>
              <input
                type="tel"
                maxLength={15}
                className={fieldInput}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>E-mail (opcional)</span>
              <input
                type="email"
                maxLength={255}
                className={fieldInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </label>

            {/* Aniversário */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Dia de Nasc. (opcional)</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className={fieldInput}
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  placeholder="DD"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Mês de Nasc. (opcional)</span>
                <select className={fieldInput} value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700/20 pt-4">
              {missingFields.length > 0 && (
                <span className="text-right text-xs font-medium leading-tight text-orange-400 max-w-[200px]">
                  Falta: {missingFields.join(', ')}
                </span>
              )}
<Button
  type="submit"
  variant="primary"
  size="sm"
  disabled={!canSubmit}
  isLoading={createMut.isPending}
>
  {createMut.isPending ? 'Salvando…' : 'Cadastrar'}
</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}