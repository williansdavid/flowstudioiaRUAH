/**
 * Normaliza valor de input[type=date].
 * Rejeita anos < 1900 ou > hoje (clamp = retorna string vazia).
 * Browsers permitem digitar "0006" mesmo com min/max — defesa client-side.
 */
function sanitizeDateInput(value: string): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '';
  const year = Number(match[1]);
  if (year < 1900) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return '';
  return value;
}

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Dialog,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { maskPhoneBR } from '@/lib/masks/phone';
import { useCreateClient, useUpdateClient } from '../hooks';
import { createClientInputSchema } from '../types';
import type { AdminClientItem } from '../types';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando preenchido → edição. Null → criação (walk-in). */
  client: AdminClientItem | null;
}

type FormState = {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  email: '',
  birthDate: '',
  notes: '',
};

const NOTES_MAX = 2000;
const TODAY_ISO = new Date().toISOString().slice(0, 10);
const MIN_BIRTH_ISO = '1900-01-01';

/**
 * Valida o form inteiro usando o mesmo schema Zod do server.
 * Retorna mapa de erros por campo (vazio se válido).
 */
function validateForm(form: FormState): FormErrors {
  const result = createClientInputSchema.safeParse({
    name: form.name,
    phone: form.phone || null,
    email: form.email || null,
    birthDate: form.birthDate || null,
    notes: form.notes || null,
  });

  if (result.success) return {};

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FormState | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const isEdit = client !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && client) {
      setForm({
        name: client.displayName,
        phone: client.displayPhone ? maskPhoneBR(client.displayPhone) : '',
        email: client.displayEmail ?? '',
        birthDate: client.birthDate ?? '',
        notes: client.notes ?? '',
      });
    } else if (open && !client) {
      setForm(EMPTY_FORM);
    }
    if (open) {
      setTouched({});
      setSubmitAttempted(false);
    }
  }, [open, client]);

  // Validação reativa
  const errors = useMemo(() => validateForm(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  // Mostra erro só se campo foi tocado ou se já tentou submeter
  const showError = (field: keyof FormState): string | undefined => {
    if (!touched[field] && !submitAttempted) return undefined;
    return errors[field];
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (raw: string) => {
    setForm((prev) => ({ ...prev, phone: maskPhoneBR(raw) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!isValid) return;

    const optStr = (v: string): string | null => {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    };

    const payload = {
      name: form.name.trim(),
      phone: optStr(form.phone),
      email: optStr(form.email),
      birthDate: optStr(form.birthDate),
      notes: optStr(form.notes),
    };

    if (isEdit && client) {
      await updateMutation.mutateAsync({ id: client.id, patch: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isAccountClient = isEdit && client?.origin === 'account';
  const notesLength = form.notes.length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {isEdit ? 'Editar cliente' : 'Novo cliente'}
            </Dialog.Title>
            <Dialog.Description>
              {isEdit
                ? 'Atualize as informações do cliente.'
                : 'Cadastre um novo cliente walk-in (sem conta no studio).'}
            </Dialog.Description>
          </Dialog.Header>

          {isAccountClient && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              Este cliente possui conta vinculada. As alterações aqui salvam
              dados internos do studio — não modificam o perfil público do
              usuário.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 py-2" noValidate>
            {/* ── Nome ── */}
            <div className="space-y-1.5">
              <Label htmlFor="name" required>
                Nome
              </Label>
              <Input
                id="name"
                required
                maxLength={120}
                placeholder="Ex: Maria Silva"
                value={form.name}
                aria-invalid={!!showError('name')}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => handleBlur('name')}
              />
              {showError('name') && (
                <p className="text-xs text-red-600">{showError('name')}</p>
              )}
            </div>

            {/* ── Telefone + Nascimento ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="(14) 99999-9999"
                  value={form.phone}
                  aria-invalid={!!showError('phone')}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
                {showError('phone') && (
                  <p className="text-xs text-red-600">{showError('phone')}</p>
                )}
              </div>

				<div className="space-y-1.5">
				  <Label htmlFor="birthDate">Nascimento</Label>
				  <Input
					id="birthDate"
					type="date"
					min={MIN_BIRTH_ISO}
					max={TODAY_ISO}
					value={form.birthDate}
					aria-invalid={!!showError('birthDate')}
					onChange={(e) => {
					  // Durante digitação: aceita qualquer valor sem sanitizar
					  setForm({ ...form, birthDate: e.target.value });
					}}
					onBlur={() => {
					  // Ao sair do campo: sanitiza e marca como tocado
					  const sanitized = sanitizeDateInput(form.birthDate);
					  if (sanitized !== form.birthDate) {
						setForm((prev) => ({ ...prev, birthDate: sanitized }));
					  }
					  handleBlur('birthDate');
					}}
				  />
				  {showError('birthDate') && (
					<p className="text-xs text-red-600">{showError('birthDate')}</p>
				  )}
				</div>
            </div>

            {/* ── E-mail ── */}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                maxLength={255}
                placeholder="cliente@exemplo.com"
                value={form.email}
                aria-invalid={!!showError('email')}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => handleBlur('email')}
              />
              {showError('email') && (
                <p className="text-xs text-red-600">{showError('email')}</p>
              )}
            </div>

            {/* ── Anotações ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Anotações internas</Label>
                <span
                  className={`text-xs ${
                    notesLength > NOTES_MAX
                      ? 'text-red-600'
                      : 'text-neutral-500'
                  }`}
                >
                  {notesLength}/{NOTES_MAX}
                </span>
              </div>
              <Textarea
                id="notes"
                rows={3}
                maxLength={NOTES_MAX}
                placeholder="Preferências, alergias, observações... (opcional)"
                value={form.notes}
                aria-invalid={!!showError('notes')}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                onBlur={() => handleBlur('notes')}
                className="bg-white text-neutral-900 placeholder:text-neutral-400"
              />
              {showError('notes') && (
                <p className="text-xs text-red-600">{showError('notes')}</p>
              )}
            </div>

            <Dialog.Footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={!isValid || isPending}
              >
                {isEdit ? 'Salvar alterações' : 'Criar cliente'}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
