// src/features/appointments/components/QuickClientModal.tsx
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
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

export function QuickClientModal({
  open,
  initialName,
  onClose,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const createMut = useCreateQuickClient();

  useEffect(() => {
    if (open) {
      setFullName(initialName ?? '');
      setPhone('');
      setEmail('');
    }
  }, [open, initialName]);

  const canSubmit = fullName.trim().length >= 2 && !createMut.isPending;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;
    try {
      const client = await createMut.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
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
            <Dialog.Title className="text-lg font-bold tracking-tight text-text-body">
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
              <span className={fieldLabel}>Nome</span>
              <input
                autoFocus
                type="text"
                maxLength={120}
                className={fieldInput}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Telefone</span>
              <input
                type="tel"
                maxLength={30}
                className={fieldInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Opcional"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>E-mail</span>
              <input
                type="email"
                maxLength={255}
                className={fieldInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Opcional"
              />
            </label>

            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-button px-3 py-2 text-sm text-text-muted hover:text-text-body"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
