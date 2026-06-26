// src/features/products/components/ProductFormModal.tsx
import { useEffect, useState } from 'react';
import { Loader2, X, Camera } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../hooks';
import { uploadProductImage, validateProductImage } from '../utils/uploadProductImage';
import type { ProductItem } from '../types';

interface ProductFormModalProps {
  open: boolean;
  product: ProductItem | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  department: string;
  price: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  department: '',
  price: '',
  isActive: true,
};

const inputCls =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-500';

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const isEdit = product !== null;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        department: product.department ?? '',
        price: product.price.toFixed(2),
        isActive: product.isActive,
      });
      setAvatarPreview(product.avatarUrl);
    } else {
      setForm(EMPTY_FORM);
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setAvatarRemoved(false);
    setError(null);
  }, [open, product]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAvatarChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;

    const err = validateProductImage(file);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setAvatarRemoved(false);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);
    ev.target.value = '';
  }

  function handleRemoveAvatar() {
    setError(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(form.price.replace(',', '.'));

    if (!form.name.trim()) return setError('Informe o nome do produto.');
    if (Number.isNaN(price) || price < 0) return setError('Preço inválido.');

    try {
      if (isEdit && product) {
        // Upload da imagem se tiver arquivo novo
        let avatarUrl: string | null | undefined;
        if (avatarFile) {
          const up = await uploadProductImage(avatarFile, product.id);
          if (!up.ok) {
            setError(up.message);
            return;
          }
          avatarUrl = up.url;
        } else if (avatarRemoved) {
          avatarUrl = null;
        }

        await updateMutation.mutateAsync({
          id: product.id,
          name: form.name.trim(),
          price,
          department: form.department.trim() || null,
          isActive: form.isActive,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        });
      } else {
        // Criação: primeiro cria o produto, depois faz upload se tiver imagem
        const created = await createMutation.mutateAsync({
          name: form.name.trim(),
          price,
          department: form.department.trim() || null,
          isActive: form.isActive,
        });

        if (avatarFile) {
          const up = await uploadProductImage(avatarFile, created.id);
          if (!up.ok) {
            setError(up.message);
            return;
          }
          // Atualiza o avatar_url no produto recem-criado
          await updateMutation.mutateAsync({
            id: created.id,
            name: form.name.trim(),
            price,
            department: form.department.trim() || null,
            isActive: form.isActive,
            avatarUrl: up.url,
          });
        }
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
            {isEdit ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar / Imagem do produto */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Produto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  <Camera className="h-8 w-8" />
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
              <span className="text-xs text-zinc-500">
                PNG, JPG ou WEBP · máx. 2 MB
              </span>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remover imagem
                </button>
              )}
            </div>
          </div>

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

          {/* Departamento */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Departamento
            </label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              placeholder="Ex: Finalização, Coloração, Cabelo…"
              className={inputCls}
            />
          </div>

          {/* Preço */}
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

          {/* Ativo */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 accent-amber-500"
            />
            Produto ativo
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