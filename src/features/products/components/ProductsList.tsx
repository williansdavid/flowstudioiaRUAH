// src/features/products/components/ProductsList.tsx
import { useState } from 'react';
import { Pencil, Plus, Power, PowerOff, Loader2, AlertCircle, Package } from 'lucide-react';
import { useProducts, useToggleProductActive } from '../hooks';
import { ProductFormModal } from './ProductFormModal';
import { Button } from '@/components/ui/Button';
import type { ProductItem } from '../types';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function ProductsList() {
  const { data, isLoading, isError, refetch } = useProducts();
  const toggleActive = useToggleProductActive();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductItem) {
    setEditing(product);
    setModalOpen(true);
  }

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col p-0 sm:p-6 lg:px-8 overflow-hidden sm:gap-6 min-h-0">
        {/* Header — desktop only */}
        <div className="flex-shrink-0 hidden sm:flex items-center justify-between">
          <h1 className="text-xl font-semibold">Produtos</h1>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-zinc-500">Erro ao carregar produtos.</p>
              <button
                onClick={() => refetch()}
                className="text-sm font-medium underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data && data.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-zinc-500">Nenhum produto cadastrado.</p>
              <button
                onClick={openCreate}
                className="text-sm font-medium underline underline-offset-2"
              >
                Cadastrar o primeiro
              </button>
            </div>
          )}

          {/* Grid de cards */}
          {!isLoading && !isError && data && data.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {data.map((product) => (
                <div
                  key={product.id}
                  className={[
                    'group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-200',
                    product.isActive
                      ? 'hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20'
                      : 'opacity-60',
                  ].join(' ')}
                >
                  {/* Avatar / Imagem */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-800">
                    {product.avatarUrl ? (
                      <img
                        src={product.avatarUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-zinc-700" />
                      </div>
                    )}

{!product.isActive && (
  <div className="absolute left-2 top-2 rounded-md bg-red-500/20 px-3 py-1 text-sm font-bold text-red-400 ring-1 ring-red-500/30 backdrop-blur-sm">
    Inativo
  </div>
)}

                    {/* Departamento badge */}
                    {product.department && (
                      <div className="absolute right-2 top-2 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400 backdrop-blur-sm">
                        {product.department}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                    <div>
                      <h3 className="truncate text-sm font-semibold text-white">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-amber-500">
                        {currency.format(product.price)}
                      </span>
                    </div>

                    {/* Ações — visíveis sempre */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-700 px-2 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                        title="Editar"
                      >
                        <Pencil className="h-3 w-3" />
                        Editar
                      </button>
                      {/* Toggle ativar/desativar */}
                      <button
                        onClick={() =>
                          toggleActive.mutate(
                            { id: product.id, isActive: !product.isActive },
                            { onSuccess: () => refetch() }
                          )
                        }
                        disabled={toggleActive.isPending}
                        className={[
                          'relative inline-flex h-7 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
                          product.isActive
                            ? 'bg-emerald-500/80 hover:bg-emerald-500'
                            : 'bg-zinc-700 hover:bg-zinc-600',
                        ].join(' ')}
                        title={product.isActive ? 'Desativar' : 'Reativar'}
                      >
                        <span
                          className={[
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                            product.isActive ? 'translate-x-5' : 'translate-x-0.5',
                          ].join(' ')}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer mobile — Novo Produto */}
      <div className="flex-shrink-0 sm:hidden px-3 pb-4 pt-3 border-t border-slate-800/60 bg-slate-950">
        <Button variant="primary" size="md" className="w-full" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <ProductFormModal
        open={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}