// src/features/appointments/components/ClientCombobox.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, UserPlus, Check, X, Loader2 } from 'lucide-react';
import type { ClientOption } from '../types';
import { useClientSearch } from '../hooks/useClientSearch';
import { maskPhoneBRInput } from '@/lib/core/utils';

interface Props {
  value: string;
  disabled?: boolean;
  onChange: (clientId: string) => void;
  onCreateNew: (initialName: string) => void;
  positionAbove?: boolean;
}

function formatPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return null;
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  if (digits.length === 0) return null;
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/** Destaca o termo buscado dentro do texto */
function highlightText(text: string, query: string): (string | { bold: string })[] {
  if (!query.trim()) return [text];
  const escaped = query.replace('/[.*+?^${}()|[\]\]/g', '\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part) =>
    regex.test(part) ? { bold: part } : part,
  );
}

function renderHighlighted(parts: (string | { bold: string })[]) {
  return parts.map((part, i) =>
    typeof part === 'string' ? (
      <span key={i}>{part}</span>
    ) : (
      <strong key={i} className="font-bold text-slate-100">
        {part.bold}
      </strong>
    ),
  );
}

const fieldInput =
  'w-full rounded-lg border border-slate-700/40 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-200 outline-none ' +
  'transition-all duration-200 placeholder:text-slate-500 ' +
  'focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-900';

export function ClientCombobox({
  value,
  disabled = false,
  onChange,
  onCreateNew,
  positionAbove = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { query, setQuery, data: clients = [], isLoading } = useClientSearch();

  const selected = useMemo(
    () => clients.find((c) => c.id === value) ?? null,
    [clients, value],
  );

  const selectedLabel = selected
    ? `${selected.name}${selected.phone ? ` — ${formatPhone(selected.phone)}` : ''}`
    : '';

  const isPhoneSearch = /^\d+$/.test(query);
  const displayValue = isPhoneSearch ? maskPhoneBRInput(query) : query;

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
  }, [open, setQuery]);

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
      setHighlight((h) => Math.min(h + 1, clients.length - 1));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const item = clients[highlight];
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
          value={displayValue}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            setQuery(isPhoneSearch ? raw : e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nome ou telefone…"
          autoComplete="off"
        />
      )}

      {open && (
        <div
          className={`absolute z-10 w-full overflow-hidden rounded-lg border border-slate-700/40 bg-slate-900 shadow-lg shadow-slate-950/50 ${
            positionAbove ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <ul ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {isLoading ? (
              <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando…
              </li>
            ) : clients.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">Nenhum cliente encontrado.</li>
            ) : (
              clients.map((c, idx) => {
                const active = idx === highlight;
                const isSel = c.id === value;
                const nameParts = highlightText(c.name, query);
                const phoneFormatted = formatPhone(c.phone);
                const phoneParts = phoneFormatted ? highlightText(phoneFormatted, query) : null;
                return (
                  <li key={c.id} data-idx={idx}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => pick(c)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                        active ? 'bg-slate-800' : ''
                      }`}
                    >
                      <span className="min-w-0 truncate text-slate-300">
                        {renderHighlighted(nameParts)}
                      </span>
                      {phoneParts && (
                        <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                          {renderHighlighted(phoneParts)}
                        </span>
                      )}
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