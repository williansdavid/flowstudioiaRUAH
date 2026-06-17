// src/features/services/components/ServiceFormModal.tsx
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useCreateService, useUpdateService } from '../hooks';
import type { ServiceItem } from '../types';

interface ServiceFormModalProps {
  open: boolean;
  service: ServiceItem | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  category: string;
  description: string;
  durationMinutes: string;
  price: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: '',
  description: '',
  durationMinutes: '',
  price: '',
  isActive: true,
};

const inputCls =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-500';

export function ServiceFormModal({ open, service, onClose }: ServiceFormModalProps) {
  const isEdit = service !== null;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setForm({
        name: service.name,
        category: service.category ?? '',
        description: service.description ?? '',
        durationMinutes: String(service.durationMinutes),
        price: service.price.toFixed(2),
        isActive: service.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, service]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const duration = Number(form.durationMinutes);
    const price = Number(form.price.replace(',', '.'));

    if (!form.name.trim()) return setError('Informe o nome do serviço.');
    if (!Number.isInteger(duration) || duration <= 0)
      return setError('Duração inválida.');
    if (Number.isNaN(price) || price < 0) return setError('Preço inválido.');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      durationMinutes: duration,
      price,
      isActive: form.isActive,
    };

    try {
      if (isEdit && service) {
        await updateMutation.mutateAsync({ id: service.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* toast já tratado no hook */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-zinc-900 p-5 shadow-xl sm:rounded-2xl border border-zinc-800">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-amber-500">
            {isEdit ? 'Editar serviço' : 'Novo serviço'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputCls}
              autoFocus
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Categoria
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="Ex: Cabelo, Barba…"
              className={inputCls}
            />
          </div>

          {/* Duração + Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Duração (min)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => update('durationMinutes', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Preço (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Ativo */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 accent-amber-500"
            />
            Serviço ativo
          </label>

          {/* Erro */}
          {error && (
            <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}