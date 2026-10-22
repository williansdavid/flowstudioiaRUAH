// src/features/appointments/components/ServicePicker.tsx
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Search, Scissors, Trash2 } from 'lucide-react';
import type { ServiceOption } from '../types';
import { cn } from '@/lib/cn';

// ── Item selecionado (compartilhado com o AppointmentFormModal) ──
export interface ServiceLine {
  serviceId: string;
  quantity: number;
}

interface ServicePickerProps {
  services: ServiceOption[];
  items: ServiceLine[];
  onChange: (items: ServiceLine[]) => void;
}

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ServicePicker({ services, items, onChange }: ServicePickerProps) {
  const [search, setSearch] = useState('');

  // Filtro por nome
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, search]);

  // Quantidade por serviço (para badge nos cards)
  const qtyByService = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.serviceId, it.quantity);
    return map;
  }, [items]);

  // Linhas selecionadas com o serviço resolvido
  const selectedList = useMemo(
    () =>
      items
        .map((it) => {
          const svc = services.find((s) => s.id === it.serviceId);
          return svc ? { ...it, service: svc } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items, services],
  );

  const total = selectedList.reduce(
    (sum, it) => sum + it.service.price * it.quantity,
    0,
  );
  const totalQty = items.reduce((n, it) => n + it.quantity, 0);

  // Tocar no card = adicionar ou incrementar (igual PDV)
  function addService(serviceId: string) {
    const current = qtyByService.get(serviceId) ?? 0;
    if (current > 0) {
      onChange(
        items.map((it) =>
          it.serviceId === serviceId ? { ...it, quantity: it.quantity + 1 } : it,
        ),
      );
    } else {
      onChange([...items, { serviceId, quantity: 1 }]);
    }
  }

  // Diminuir: remove se quantity = 1, senão decrementa
  function decrement(serviceId: string) {
    const it = items.find((i) => i.serviceId === serviceId);
    if (!it) return;
    if (it.quantity <= 1) {
      onChange(items.filter((i) => i.serviceId !== serviceId));
    } else {
      onChange(
        items.map((i) =>
          i.serviceId === serviceId ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      );
    }
  }

  function removeService(serviceId: string) {
    onChange(items.filter((i) => i.serviceId !== serviceId));
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar serviço..."
          className="w-full rounded-lg border border-slate-700/30 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/30"
        />
      </div>

      {/* Grid de cards */}
      {services.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Nenhum serviço cadastrado.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Nenhum serviço encontrado para "{search.trim()}".
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {filtered.map((svc) => {
            const qty = qtyByService.get(svc.id) ?? 0;
            const selected = qty > 0;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => addService(svc.id)}
                aria-pressed={selected}
                className={cn(
                  'relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 active:scale-95',
                  selected
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-slate-700/20 bg-slate-800/40 hover:border-slate-600/40 hover:bg-slate-800/70',
                )}
              >
                {/* Badge de quantidade */}
                {selected && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white shadow">
                    {qty}
                  </span>
                )}
                <span className="flex w-full items-center gap-1.5 text-sm font-semibold text-slate-200">
                  <Scissors className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                  <span className="truncate">{svc.name}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {svc.durationMinutes}min
                </span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    selected ? 'text-orange-400' : 'text-emerald-400',
                  )}
                >
                  {fmtBRL(svc.price)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Listinha dos selecionados */}
      <AnimatePresence mode="popLayout">
        {selectedList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-slate-700/20 bg-slate-800/40 p-3"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Selecionados ({totalQty})
            </p>
            <div className="space-y-2">
              {selectedList.map(({ serviceId, quantity, service }) => (
                <motion.div
                  key={serviceId}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {service.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {fmtBRL(service.price)} · {service.durationMinutes}min
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => decrement(serviceId)}
                      title="Diminuir"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700/30 text-slate-300 transition-colors hover:border-orange-500/40 hover:text-orange-400 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-200">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addService(serviceId)}
                      title="Aumentar"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700/30 text-slate-300 transition-colors hover:border-orange-500/40 hover:text-orange-400 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeService(serviceId)}
                      title="Remover"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-700/20 pt-2">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-sm font-bold text-orange-400">
                {fmtBRL(total)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}