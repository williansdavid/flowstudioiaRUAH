// src/features/appointments/components/ClientCombobox.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, UserPlus, Check, X } from 'lucide-react';
import type { ClientOption } from '../types';

interface Props {
  clients: ClientOption[];
  value: string;
  disabled?: boolean;
  onChange: (clientId: string) => void;
  onCreateNew: (initialName: string) => void;
}

const MAX_VISIBLE = 50;

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normPhone(s: string): string {
  return s.replace(/\D/g, '');
}

// 🔥 NOVA: máscara de telefone brasileiro (14) 99999-0001
function formatPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return null;

  // Remove DDI 55 de números brasileiros
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }

  if (digits.length === 0) return null;

  // Celular: (XX) XXXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  // Fixo: (XX) XXXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  // Fallback: retorna original se não conseguir formatar
  return phone;
}

// Remove +55 para exibição limpa e aplica máscara
function displayPhone(phone: string | null | undefined): string | null {
  return formatPhone(phone);
}

const fieldInput =
  'w-full rounded-lg border border-slate-700/40 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-200 outline-none ' +
  'transition-all duration-200 placeholder:text-slate-500 ' +
  'focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-900';

export function ClientCombobox({
  clients,
  value,
  disabled = false,
  onChange,
  onCreateNew,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => clients.find((c) => c.id === value) ?? null,
    [clients, value],
  );

  // Telefone com máscara
  const selectedLabel = selected
    ? `${selected.name}${selected.phone ? ` — ${formatPhone(selected.phone)}` : ''}`
    : '';

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return clients.slice(0, MAX_VISIBLE);
    const nq = norm(q);
    const pq = normPhone(q);
    const out: ClientOption[] = [];
    for (const c of clients) {
      const byName = norm(c.name).includes(nq);
      const byPhone = pq.length > 0 && c.phone && normPhone(c.phone).includes(pq);
      if (byName || byPhone) {
        out.push(c);
        if (out.length >= MAX_VISIBLE) break;
      }
    }
    return out;
  }, [clients, query]);

  useEffect(() => { setHighlight(0); }, [query, open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(ev: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function openDropdown() {
    if (disabled) return;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function pick(client: ClientOption) {
    onChange(client.id);
    setOpen(false);
    setQuery('');
  }

  function clearSelection() {
    onChange('');
    setQuery('');
    openDropdown();
  }

  function handleKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const item = filtered[highlight];
      if (item) pick(item);
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      setOpen(false);
      setQuery('');
    }
  }

  if (disabled) {
    return (
      <div className={`${fieldInput} cursor-not-allowed opacity-70 flex items-center`}>
        {selectedLabel || 'Selecione…'}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={openDropdown}
          className={`${fieldInput} flex items-center justify-between text-left`}
        >
          <span className={selected ? 'text-slate-200' : 'text-slate-500'}>
            {selectedLabel || 'Selecione…'}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {selected && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar"
                onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </span>
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          className={fieldInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nome ou telefone…"
          autoComplete="off"
        />
      )}

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-700/40 bg-slate-900 shadow-lg shadow-slate-950/50">
          <ul ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">Nenhum cliente encontrado.</li>
            ) : (
              filtered.map((c, idx) => {
                const active = idx === highlight;
                const isSel = c.id === value;
                return (
                  <li key={c.id} data-idx={idx}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => pick(c)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                        active ? 'bg-slate-800' : ''
                      }`}
                    >
                      <span className="truncate text-slate-200">
                        {c.name}
                        {c.phone ? (
                          <span className="text-slate-500"> — {formatPhone(c.phone)}</span>
                        ) : null}
                      </span>
                      {isSel && (
                        <Check className="h-4 w-4 shrink-0 text-orange-400" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-slate-700/30">
            <button
              type="button"
              onClick={() => { onCreateNew(query.trim()); setOpen(false); setQuery(''); }}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm font-medium text-orange-400 transition-colors hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4" />
              {query.trim() ? `Cadastrar "${query.trim()}"` : 'Novo cliente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}