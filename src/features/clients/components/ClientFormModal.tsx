// src/features/clients/components/ClientFormModal.tsx
import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, Camera, Plus, Hash } from 'lucide-react';
import { Button } from '@/features/utils/ui/Button';
import { cn } from '@/lib/cn';
import { useCreateClient, useUpdateClient } from '../hooks';
import type { ClientProfile } from '../types';

/* ───────── Formatação ───────── */

function formatPhone(value: string): string {
  const v = value.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
}

function formatCPF(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]![0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? '') : '';
  return (first + last).toUpperCase();
}

function parseBirthDate(dateStr: string | null): { day: string; month: string } {
  if (!dateStr) return { day: '', month: '' };
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return { day: String(d.getDate()), month: String(d.getMonth() + 1) };
  } catch {
    return { day: '', month: '' };
  }
}

function buildBirthDate(day: string, month: string): string | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  if (!d || !m || d < 1 || d > 31 || m < 1 || m > 12) return null;
  return `2000-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ───────── Constantes de UI ───────── */

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400';
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 focus:bg-slate-800';
const fieldSelect = fieldInput;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'new', label: 'Novo' },
] as const;

/* ───────── Props ───────── */

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  client?: ClientProfile['client'] | null;
}

/* ───────── State ───────── */

interface FormState {
  name: string;
  phone: string;
  email: string;
  birthDay: string;
  birthMonth: string;
  cpf: string;
  address: string;
  notes: string;
  tags: string[];
  status: 'active' | 'vip' | 'inactive' | 'new';
  avatar_file: File | null;
  avatar_preview: string | null;
}

const EMPTY: FormState = {
  name: '',
  phone: '',
  email: '',
  birthDay: '',
  birthMonth: '',
  cpf: '',
  address: '',
  notes: '',
  tags: [],
  status: 'active',
  avatar_file: null,
  avatar_preview: null,
};

/* ════════════════════ COMPONENTE ════════════════════ */

export function ClientFormModal({
  open,
  onClose,
  mode = 'create',
  client,
}: Props) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();
  const isSaving = createMut.isPending || updateMut.isPending;

  /* ─── Preencher em modo edição ─── */
  useEffect(() => {
    if (!open) return;
    if (isEdit && client) {
      const { day, month } = parseBirthDate(client.birth_date ?? null);
      setForm({
        name: client.name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        birthDay: day,
        birthMonth: month,
        cpf: client.cpf ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
        tags: client.tags ?? [],
        status: (client.status as FormState['status']) ?? 'active',
        avatar_file: null,
        avatar_preview: client.avatar_url ?? null,
      });
    } else {
      setForm(EMPTY);
    }
    setTagInput('');
  }, [open, isEdit, client]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ─── Avatar ─── */
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatar_file: file,
        avatar_preview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setForm((prev) => ({ ...prev, avatar_file: null, avatar_preview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ─── Tags ─── */
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  /* ─── Validação ─── */
  const missingFields: string[] = [];
  if (form.name.trim().length < 2) missingFields.push('Nome');
  if (form.phone.replace(/\D/g, '').length < 10) missingFields.push('Telefone');
  const canSubmit = missingFields.length === 0 && !isSaving;

  /* ─── Submit ─── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      if (isEdit && client) {
        const payload: Record<string, unknown> = {};
        if (form.name !== (client.name ?? '')) payload.name = form.name;
        if (form.phone !== (client.phone ?? '')) payload.phone = form.phone;
        if (form.email !== (client.email ?? '')) payload.email = form.email || null;

        const clientBirth = parseBirthDate(client.birth_date ?? null);
        if (form.birthDay !== clientBirth.day || form.birthMonth !== clientBirth.month) {
          payload.birth_date = buildBirthDate(form.birthDay, form.birthMonth);
        }

        if (form.cpf !== (client.cpf ?? '')) payload.cpf = form.cpf || null;
        if (form.address !== (client.address ?? '')) payload.address = form.address || null;
        if (form.notes !== (client.notes ?? '')) payload.notes = form.notes || null;
        if (JSON.stringify(form.tags) !== JSON.stringify(client.tags ?? [])) payload.tags = form.tags;
        if (form.status !== (client.status ?? 'active')) payload.status = form.status;

        if (Object.keys(payload).length === 0) {
          onClose();
          return;
        }
        await updateMut.mutateAsync({ clientId: client.id, data: payload });
        onClose();
      } else {
        await createMut.mutateAsync({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          birth_date: buildBirthDate(form.birthDay, form.birthMonth),
          cpf: form.cpf.replace(/\D/g, '') || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          tags: form.tags,
          status: form.status,
        });
        onClose();
      }
    } catch {
      // erro tratado pelo hook (onError)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md" />

        <Dialog.Content
          className={cn(
            'fixed z-[60] flex w-[calc(100vw-2rem)] sm:max-w-md flex-col',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-slate-900 border border-slate-700/30 ring-1 ring-slate-700/20 shadow-2xl',
            'rounded-2xl focus:outline-none',
            'max-h-[90vh] overflow-hidden',
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-700/20 px-5 py-4">
            <Dialog.Title className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {isEdit ? 'Editar cliente' : 'Novo cliente'}
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
          <form
            id="client-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 overflow-y-auto px-5 py-5"
          >
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {form.avatar_preview ? (
                  <img
                    src={form.avatar_preview}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-700/30"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-700/30">
                    <span className="text-2xl font-bold text-slate-500">
                      {form.name ? initials(form.name) : '?'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-600/40 bg-slate-700 text-slate-300 transition hover:bg-slate-600"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-slate-500">
                {form.avatar_preview
                  ? 'Clique no ícone da câmera para trocar'
                  : 'Clique na câmera para adicionar'}
              </p>
              {form.avatar_preview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remover foto
                </button>
              )}
            </div>

            {/* Nome */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Nome *</span>
              <input
                type="text"
                maxLength={120}
                className={fieldInput}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </label>

            {/* Telefone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Telefone *</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  className={fieldInput}
                  value={form.phone}
                  onChange={(e) => set('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Email</span>
                <input
                  type="email"
                  maxLength={255}
                  className={fieldInput}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="cliente@email.com"
                />
              </label>
            </div>

            {/* Nascimento + CPF */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Nascimento</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    inputMode="numeric"
                    className={fieldInput}
                    value={form.birthDay}
                    onChange={(e) => set('birthDay', e.target.value)}
                    placeholder="DD"
                  />
                  <select
                    className={fieldSelect}
                    value={form.birthMonth}
                    onChange={(e) => set('birthMonth', e.target.value)}
                  >
                    <option value="">Mês</option>
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
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>CPF</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  className={fieldInput}
                  value={form.cpf}
                  onChange={(e) => set('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </label>
            </div>

            {/* Endereço */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Endereço</span>
              <input
                type="text"
                maxLength={255}
                className={fieldInput}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade"
              />
            </label>

            {/* Status */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Status</span>
              <select
                className={fieldSelect}
                value={form.status}
                onChange={(e) => set('status', e.target.value as FormState['status'])}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Tags */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Tags</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={30}
                  className={fieldInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Ex: cabelo curto, barba, vip"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-700/40 bg-slate-800/60 text-slate-400 transition hover:border-slate-600/50 hover:text-slate-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700/30 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 text-slate-500 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </label>

            {/* Observações */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Observações</span>
              <textarea
                maxLength={1000}
                rows={3}
                className={fieldInput + ' resize-none'}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Informações adicionais sobre o cliente..."
              />
            </label>
          </form>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-700/20 bg-slate-900/80 px-5 py-4 backdrop-blur-xl">
            <div className="flex-1">
              {missingFields.length > 0 && (
                <span className="text-xs font-medium text-red-400">
                  Falta: {missingFields.join(', ')}
                </span>
              )}
            </div>
            <Button
              type="submit"
              form="client-form"
              variant="primary"
              size="sm"
              disabled={!canSubmit}
              isLoading={isSaving}
            >
              {isEdit ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}