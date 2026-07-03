// src/features/clients/components/ClientFormModal.tsx
import { useEffect, useState, useRef, type KeyboardEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, AlertTriangle, Camera, Plus, Hash } from 'lucide-react'
import { Button } from '@/features/utils/ui/Button'
import { cn } from '@/lib/cn'
import { useCreateClient, useUpdateClient } from '../hooks'
import type { ClientProfile } from '../types'

/* ───────── Formatação ───────── */

function formatPhone(value: string): string {
  const v = value.replace(/\D/g, '')
  if (!v) return ''
  if (v.length <= 2) return `(${v}`
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
}

function formatCPF(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 3) return v
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
}

/* ───────── Constantes de UI ───────── */

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400'
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 focus:bg-slate-800'
const fieldSelect = fieldInput

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'new', label: 'Novo' },
] as const

/* ───────── Props ───────── */

interface Props {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  client?: ClientProfile['client'] | null
}

/* ───────── State ───────── */

interface FormState {
  name: string
  phone: string
  email: string
  birth_date: string
  cpf: string
  address: string
  notes: string
  tags: string[]
  status: 'active' | 'vip' | 'inactive' | 'new'
  avatar_file: File | null
  avatar_preview: string | null
}

const EMPTY: FormState = {
  name: '',
  phone: '',
  email: '',
  birth_date: '',
  cpf: '',
  address: '',
  notes: '',
  tags: [],
  status: 'active',
  avatar_file: null,
  avatar_preview: null,
}

/* ════════════════════ COMPONENTE ════════════════════ */

export function ClientFormModal({ open, onClose, mode = 'create', client }: Props) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState<FormState>(EMPTY)
  const [tagInput, setTagInput] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMut = useCreateClient()
  const updateMut = useUpdateClient()
  const isSaving = createMut.isPending || updateMut.isPending

  /* ─── Preencher em modo edição ─── */
  useEffect(() => {
    if (!open) return
    if (isEdit && client) {
      setForm({
        name: client.name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        birth_date: client.birth_date ?? '',
        cpf: client.cpf ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
        tags: client.tags ?? [],
        status: (client.status as FormState['status']) ?? 'active',
        avatar_file: null,
        avatar_preview: client.avatar_url ?? null,
      })
    } else {
      setForm(EMPTY)
    }
    setTagInput('')
    setFormError(null)
  }, [open, isEdit, client])

  /* ─── Helpers de campo ─── */
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /* ─── Avatar ─── */
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatar_file: file,
        avatar_preview: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    setForm((prev) => ({ ...prev, avatar_file: null, avatar_preview: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ─── Tags ─── */
  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (!t || form.tags.includes(t)) return
    setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  /* ─── Validação ─── */
  const missingFields: string[] = []
  if (form.name.trim().length < 2) missingFields.push('Nome')
  if (form.phone.replace(/\D/g, '').length < 10) missingFields.push('Telefone')
  const canSubmit = missingFields.length === 0 && !isSaving

  /* ─── Submit ─── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setFormError(null)

    try {
      if (isEdit && client) {
        const payload: Record<string, unknown> = {}

        if (form.name !== (client.name ?? '')) payload.name = form.name
        if (form.phone !== (client.phone ?? '')) payload.phone = form.phone
        if (form.email !== (client.email ?? '')) payload.email = form.email || null
        if (form.birth_date !== (client.birth_date ?? '')) payload.birth_date = form.birth_date || null
        if (form.cpf !== (client.cpf ?? '')) payload.cpf = form.cpf || null
        if (form.address !== (client.address ?? '')) payload.address = form.address || null
        if (form.notes !== (client.notes ?? '')) payload.notes = form.notes || null
        if (JSON.stringify(form.tags) !== JSON.stringify(client.tags ?? [])) payload.tags = form.tags
        if (form.status !== (client.status ?? 'active')) payload.status = form.status

        if (Object.keys(payload).length === 0) {
          onClose()
          return
        }

        await updateMut.mutateAsync({ clientId: client.id, data: payload })
        onClose()
      } else {
        await createMut.mutateAsync({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          birth_date: form.birth_date || null,
          cpf: form.cpf.replace(/\D/g, '') || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          tags: form.tags,
          status: form.status,
        })
        onClose()
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar cliente.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={cn(
              'relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-700/30 bg-surface shadow-2xl',
            )}
          >
            {/* ─── Header ─── */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-700/20 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-100">
                {isEdit ? 'Editar cliente' : 'Novo cliente'}
              </h2>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700/30 hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* ─── Form ─── */}
            <form
              id="client-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              <div className="flex flex-col gap-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0">
                    {form.avatar_preview ? (
                      <img
                        src={form.avatar_preview}
                        alt="Avatar"
                        className="size-16 rounded-full object-cover ring-2 ring-slate-700/30"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white ring-2 ring-slate-700/30">
                        {form.name ? initials(form.name) : '?'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-slate-600/40 bg-slate-700 text-slate-300 transition hover:bg-slate-600"
                    >
                      <Camera className="size-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-300">Foto do cliente</p>
                    <p className="text-[11px] text-slate-500">
                      {form.avatar_preview
                        ? 'Clique no ícone da câmera para trocar'
                        : 'Clique na câmera para adicionar'}
                    </p>
                    {form.avatar_preview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="mt-1 text-[11px] text-red-400 hover:text-red-300"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>

                {/* Nome */}
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabel}>Nome *</label>
                  <input
                    className={fieldInput}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                {/* Telefone + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Telefone *</label>
                    <input
                      className={fieldInput}
                      value={form.phone}
                      onChange={(e) => set('phone', formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Email</label>
                    <input
                      className={fieldInput}
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="cliente@email.com"
                    />
                  </div>
                </div>

                {/* CPF + Data nascimento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>CPF</label>
                    <input
                      className={fieldInput}
                      value={form.cpf}
                      onChange={(e) => set('cpf', formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Data de nascimento</label>
                    <input
                      type="date"
                      className={fieldInput}
                      value={form.birth_date}
                      onChange={(e) => set('birth_date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabel}>Endereço</label>
                  <input
                    className={fieldInput}
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabel}>Status</label>
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
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabel}>Tags</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        className={cn(fieldInput, 'pl-8')}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Ex: cabelo curto, barba, vip"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                      className="flex size-[38px] shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 transition hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-600/30 bg-slate-700/30 px-2.5 py-0.5 text-xs font-medium text-slate-300"
                        >
                          <Hash className="size-2.5 text-slate-500" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 text-slate-500 hover:text-red-400"
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabel}>Observações</label>
                  <textarea
                    className={cn(fieldInput, 'resize-none')}
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Informações adicionais sobre o cliente..."
                    maxLength={1000}
                  />
                </div>

                {/* Erro */}
                {formError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2.5 text-xs text-red-400">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>
            </form>

            {/* ─── Footer ─── */}
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}