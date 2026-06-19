// src/features/appointments/components/QuickClientModal.tsx
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, UserPlus } from 'lucide-react';
import type { ClientOption } from '../types';
import { useCreateQuickClient } from '../hooks';

interface Props {
  open: boolean;
  initialName?: string;
  onClose: () => void;
  onCreated: (client: ClientOption) => void;
}

const fieldLabel = 'text-xs font-medium text-text-muted';
const fieldInput =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

/** Formata o telefone dinamicamente para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
function formatPhone(value: string) {
  const v = value.replace(/\D/g, ''); // Remove tudo que não é número
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

  // Validações dinâmicas em laranja
  const missingFields: string[] = [];
  if (fullName.trim().length < 2) missingFields.push('Nome');
  
  // Exige pelo menos 10 dígitos reais (DDD + 8 números)
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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col rounded-card border border-border bg-surface shadow-md focus:outline-none">
          
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-3 text-lg font-bold tracking-tight text-text-body">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <UserPlus className="h-4 w-4" />
              </div>
              Novo cliente
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-surface-2 hover:text-text-body"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
            <label className="flex flex-col gap-1">
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

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Telefone *</span>
              <input
                type="tel"
                maxLength={15} // (11) 99999-9999 tem 15 caracteres
                className={fieldInput}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
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

            {/* Linha de Aniversário */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
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
              <label className="flex flex-col gap-1">
                <span className={fieldLabel}>Mês de Nasc. (opcional)</span>
                <select
                  className={fieldInput}
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                >
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

            <div className="mt-1 flex items-center justify-end gap-3">
              {/* Validações em Laranja */}
              {missingFields.length > 0 && (
                <span className="text-sm font-medium text-orange-500 text-right max-w-[200px] leading-tight">
                  Falta: {missingFields.join(', ')}
                </span>
              )}
              
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Cadastrar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}