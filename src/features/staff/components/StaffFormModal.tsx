// src/features/staff/components/StaffFormModal.tsx
import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, AlertTriangle, Camera } from 'lucide-react';
import { useCreateStaff, useUpdateStaff } from '../hooks';
import { uploadAvatar, validateAvatarFile } from '../utils/uploadAvatar';
import type { CreateStaffInput } from '../server/createStaff';
import type { UpdateStaffInput } from '../server/updateStaff';
import type { StaffListItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  /** Obrigatório quando mode === 'edit'. */
  staff?: StaffListItem | null;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  is_bookable: boolean;
  role: 'staff' | 'admin';
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  specialty: '',
  is_bookable: true,
  role: 'staff',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{8,20}$/;

const fieldLabel = 'text-xs font-medium text-text-muted';
const fieldInput =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';
const fieldInputDisabled =
  'w-full rounded-button border border-border bg-surface-2 px-3 py-2 text-sm text-text-muted outline-none cursor-not-allowed';

export function StaffFormModal({ open, onClose, mode = 'create', staff }: Props) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<FormState>(EMPTY);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // marca remoção explícita do avatar existente (null no submit)
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const createMut = useCreateStaff();
  const updateMut = useUpdateStaff();
  const isSaving = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (!open) return;
    setEmailError(null);
    setFormError(null);
    setAvatarFile(null);
    setAvatarRemoved(false);
    setAvatarPreview(isEdit && staff ? staff.avatarUrl : null);

    if (isEdit && staff) {
      setForm({
        full_name: staff.name,
        email: staff.email ?? '',
        phone: staff.phone ?? '',
        specialty: staff.specialty ?? '',
        is_bookable: staff.isBookable,
        role: 'staff',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, isEdit, staff]);

  // Libera o object URL do preview pra não vazar memória.
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const errors = useMemo(() => {
    const e: string[] = [];
    if (form.full_name.trim().length < 2) e.push('Informe o nome completo.');
    // email só é validado no create (no edit é read-only)
    if (!isEdit && !EMAIL_RE.test(form.email.trim())) e.push('Email inválido.');
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim()))
      e.push('Telefone inválido.');
    return e;
  }, [form, isEdit]);

  const canSubmit = errors.length === 0 && !isSaving;

  function handleAvatarChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;

    const err = validateAvatarFile(file);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);

    // escolher um arquivo novo cancela uma remoção pendente
    setAvatarRemoved(false);

    // troca o preview, revogando o blob anterior se houver
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);

    // permite reescolher o mesmo arquivo depois de remover
    ev.target.value = '';
  }

  function handleRemoveAvatar() {
    setFormError(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;
    setEmailError(null);
    setFormError(null);

    try {
      if (isEdit) {
        if (!staff) return;

        // Resolve o avatar_url do input (3 casos):
        //   arquivo novo  -> URL do upload
        //   removido      -> null
        //   inalterado    -> undefined (não mexe)
        let avatarUrl: string | null | undefined;
        if (avatarFile) {
          const up = await uploadAvatar(avatarFile, staff.id);
          if (!up.ok) {
            setFormError(up.message);
            return;
          }
          avatarUrl = up.url;
        } else if (avatarRemoved) {
          avatarUrl = null;
        }

        const input: UpdateStaffInput = {
          id: staff.id,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          specialty: form.specialty.trim(),
          is_bookable: form.is_bookable,
          ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        };
        const res = await updateMut.mutateAsync(input);
        if (res.ok) {
          onClose();
          return;
        }
        switch (res.reason) {
          case 'FORBIDDEN':
            setFormError('Você não tem permissão para editar este profissional.');
            break;
          case 'NOT_FOUND':
            setFormError('Profissional não encontrado.');
            break;
          case 'UNKNOWN':
            setFormError(res.message || 'Falha ao atualizar profissional.');
            break;
        }
        return;
      }

      // create
      const input: CreateStaffInput = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialty: form.specialty.trim(),
        is_bookable: form.is_bookable,
        role: form.role,
      };
      const res = await createMut.mutateAsync(input);
      if (res.ok) {
        onClose();
        return;
      }
      switch (res.reason) {
        case 'EMAIL_TAKEN':
          setEmailError('Email já cadastrado.');
          break;
        case 'FORBIDDEN':
          setFormError('Você não tem permissão para cadastrar profissionais.');
          break;
        case 'UNKNOWN':
          setFormError(res.message || 'Falha ao cadastrar profissional.');
          break;
      }
    } catch {
      /* sessão inválida etc — toast já tratado no hook */
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-card border border-border bg-surface shadow-md focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-lg font-bold tracking-tight text-text-body">
              {isEdit ? 'Editar profissional' : 'Novo profissional'}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-surface-2 hover:text-text-body"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 overflow-y-auto px-5 py-4"
          >
            {isEdit && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Pré-visualização do avatar"
                      className="h-20 w-20 rounded-pill object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-surface-2 text-text-muted ring-1 ring-border">
                      <Camera className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                  <label
                    className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-pill bg-primary text-white shadow-md transition-colors hover:bg-primary-hover"
                    title="Trocar foto"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      disabled={isSaving}
                    />
                  </label>
                </div>
                <span className="text-xs text-text-muted">
                  PNG, JPG ou WEBP · máx. 2 MB
                </span>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving}
                    className="text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Nome completo</span>
              <input
                type="text"
                autoComplete="name"
                className={fieldInput}
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Ex: Maria Silva"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Email</span>
              <input
                type="email"
                autoComplete="off"
                className={isEdit ? fieldInputDisabled : fieldInput}
                value={form.email}
                onChange={(e) => {
                  if (isEdit) return;
                  set('email', e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="profissional@email.com"
                disabled={isEdit}
                readOnly={isEdit}
                aria-invalid={emailError ? true : undefined}
              />
              {isEdit && (
                <span className="text-xs text-text-muted">
                  O email não pode ser alterado.
                </span>
              )}
              {emailError && (
                <span className="text-xs text-red-600">{emailError}</span>
              )}
            </label>

            {!isEdit && (
              <label className="flex flex-col gap-1">
                <span className={fieldLabel}>Função</span>
                <select
                  className={fieldInput}
                  value={form.role}
                  onChange={(e) => set('role', e.target.value as FormState['role'])}
                >
                  <option value="staff">Profissional</option>
                  <option value="admin">Administrador</option>
                </select>
                {form.role === 'admin' && (
                  <span className="text-xs text-text-muted">
                    Administradores têm acesso total ao painel.
                  </span>
                )}
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Telefone</span>
              <input
                type="tel"
                autoComplete="tel"
                className={fieldInput}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="Opcional"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Especialidade</span>
              <input
                type="text"
                className={fieldInput}
                value={form.specialty}
                onChange={(e) => set('specialty', e.target.value)}
                placeholder="Opcional (ex: Cabeleireira, Manicure)"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-1 focus:ring-primary"
                checked={form.is_bookable}
                onChange={(e) => set('is_bookable', e.target.checked)}
              />
              <span className="text-sm text-text-body">
                Disponível para agendamento
              </span>
            </label>

            {errors.length > 0 && (
              <p className="text-xs text-red-600">{errors[0]}</p>
            )}
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-button border border-amber-300 bg-amber-100 px-3 py-2.5 text-sm font-medium text-amber-900"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <div className="mt-1 flex items-center justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
