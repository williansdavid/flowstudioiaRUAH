import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, AlertTriangle, Camera } from 'lucide-react';
import { useCreateStaff, useUpdateStaff } from '../hooks';
import { uploadAvatar, validateAvatarFile } from '../utils/uploadAvatar';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneBRSchema, formatPhoneBR } from '@/lib/core/utils';
import type { CreateStaffInput } from '../server/createStaff';
import type { UpdateStaffInput } from '../server/updateStaff';
import type { StaffListItem } from '../types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const STAFF_PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
];

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  staff?: StaffListItem | null;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  is_bookable: boolean;
  is_active: boolean;        
  role: 'staff' | 'admin';
  color: string;
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  specialty: '',
  is_bookable: true,
  is_active: true,          // <--- NOVO
  role: 'staff',
  color: STAFF_PALETTE[0]!,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400';
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-800';
const fieldInputDisabled =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed';

export function StaffFormModal({ open, onClose, mode = 'create', staff }: Props) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<FormState>(EMPTY);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
        phone: formatPhoneBR(staff.phone),
        specialty: staff.specialty ?? '',
        is_bookable: staff.isBookable,
         is_active: staff.isActive,
        role: 'staff',
        color: staff.color ?? STAFF_PALETTE[0]!,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, isEdit, staff]);

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
    if (!isEdit && !EMAIL_RE.test(form.email.trim())) e.push('Email inválido.');

    const phone = form.phone.trim();
    if (!phone) {
      e.push('Informe o telefone.');
    } else {
      const parsed = phoneBRSchema.safeParse(phone);
      if (!parsed.success) {
        e.push(parsed.error.issues[0]?.message ?? 'Telefone inválido.');
      }
    }
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
    setAvatarRemoved(false);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);
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

    const phoneParsed = phoneBRSchema.safeParse(form.phone.trim());
    if (!phoneParsed.success) {
      setFormError(phoneParsed.error.issues[0]?.message ?? 'Telefone inválido.');
      return;
    }
    const phoneCanonical = phoneParsed.data;

    try {
      if (isEdit) {
        if (!staff) return;

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
          phone: phoneCanonical,
          specialty: form.specialty.trim(),
          is_bookable: form.is_bookable,
          is_active: form.is_active,
          color: form.color,
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

      const input: CreateStaffInput = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: phoneCanonical,
        specialty: form.specialty.trim(),
        is_bookable: form.is_bookable,
        role: form.role,
        color: form.color,
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
      // toast já tratado no hook
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay vidro */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        {/* Content premium */}
        <Dialog.Content
          className={cn(
            'fixed z-50 flex flex-col',
            'inset-0 sm:inset-auto',
            'sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-full sm:max-w-md',
            'max-h-[100dvh]',
            'bg-slate-900 border border-slate-700/30 ring-1 ring-slate-700/20 shadow-2xl',
            'sm:rounded-2xl focus:outline-none',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'pb-safe',
          )}
        >
          {/* Scroll container */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/20 px-5 py-4">
              <Dialog.Title className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {isEdit ? 'Editar profissional' : 'Novo profissional'}
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

            {/* Form body */}
            <form
              id="staff-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 p-5"
            >
              {/* Avatar */}
              {isEdit && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-700/30 bg-slate-800/60">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">
                      PNG, JPG ou WEBP · máx. 2 MB
                    </span>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Cor de Identificação */}
              <div className="flex flex-col gap-2">
                <span className={fieldLabel}>Cor da agenda</span>
                <div className="flex flex-wrap gap-2">
                  {STAFF_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('color', c)}
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                        form.color === c
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Selecionar cor ${c}`}
                    />
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Nome completo</span>
                <input
                  autoFocus
                  type="text"
                  maxLength={120}
                  className={fieldInput}
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Email</span>
                <input
                  type="email"
                  maxLength={255}
                  className={isEdit ? fieldInputDisabled : fieldInput}
                  value={form.email}
                  onChange={(e) => {
                    if (isEdit) return;
                    set('email', e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="obrigatório para login"
                  disabled={isEdit}
                  readOnly={isEdit}
                  aria-invalid={emailError ? true : undefined}
                />
                {isEdit && (
                  <span className="text-[11px] text-slate-500">
                    O email não pode ser alterado.
                  </span>
                )}
                {emailError && (
                  <span className="text-xs font-medium text-red-400">
                    {emailError}
                  </span>
                )}
              </label>

              {!isEdit && (
                <label className="flex flex-col gap-1.5">
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
                    <span className="text-[11px] text-amber-400">
                      Administradores têm acesso total ao painel.
                    </span>
                  )}
                </label>
              )}

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Telefone</span>
                <PhoneInput
                  className={fieldInput}
                  value={form.phone}
                  onChange={(masked) => set('phone', masked)}
                  placeholder="(14) 99999-9999"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Especialidade</span>
                <input
                  type="text"
                  maxLength={100}
                  className={fieldInput}
                  value={form.specialty}
                  onChange={(e) => set('specialty', e.target.value)}
                  placeholder="Opcional (ex: Cabelo, Barba)"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700/30 bg-slate-800/60 text-orange-500 accent-orange-500 focus:ring-orange-500/50"
                  checked={form.is_bookable}
                  onChange={(e) => set('is_bookable', e.target.checked)}
                />
                <span className="text-sm text-slate-300">
                  Disponível para agendamento
                </span>
              </label>

              {/* Spacer pro footer fixo não encobrir */}
              <div className="h-16 sm:h-0" />
{/* ═══ ATIVO/INATIVO — só no modo edição ═══ */}
{isEdit && (
  <label className="flex items-center justify-between rounded-lg border border-slate-700/20 bg-slate-800/40 px-4 py-3">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-slate-200">
        Profissional ativo
      </span>
      <span className="text-[11px] text-slate-500">
        {form.is_active
          ? 'Pode acessar o sistema e a agenda'
          : 'Acesso bloqueado — não aparece na agenda'}
      </span>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={form.is_active}
      onClick={() => {
        const newActive = !form.is_active;
        set('is_active', newActive);
        // Quando desativa, tira da agenda também
        if (!newActive) set('is_bookable', false);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        form.is_active ? 'bg-emerald-500' : 'bg-slate-600',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          form.is_active ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  </label>
)}              
            </form>
          </div>

          {/* ═══ FOOTER FIXO — vidro premium ═══ */}
          <div className="shrink-0 border-t border-slate-700/20 bg-slate-900/80 backdrop-blur-xl px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {errors.length > 0 && (
                  <span className="text-xs font-medium text-orange-400">
                    {errors[0]}
                  </span>
                )}
                {formError && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {formError}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="staff-form"
                  variant="primary"
                  size="sm"
                  disabled={!canSubmit}
                  isLoading={isSaving}
                >
                  {isEdit ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}