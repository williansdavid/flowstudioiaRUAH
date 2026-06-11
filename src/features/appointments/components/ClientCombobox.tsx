// src/features/appointments/components/ClientCombobox.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, UserPlus, Check, X } from 'lucide-react';
import type { ClientOption } from '../types';

interface Props {
  clients: ClientOption[];
  value: string;
  disabled?: boolean;
  onChange: (clientId: string) => void;
  /** Dispara o cadastro rápido, levando o termo digitado como nome inicial. */
  onCreateNew: (initialName: string) => void;
}

const MAX_VISIBLE = 50;

/** Normaliza para busca: minúsculas, sem acento, sem separadores de telefone. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normPhone(s: string): string {
  return s.replace(/\D/g, '');
}

const fieldInput =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

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

  const selectedLabel = selected
    ? `${selected.name}${selected.phone ? ` — ${selected.phone}` : ''}`
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

  // Reseta highlight quando a lista muda.
  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  // Click-outside fecha.
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

  // Mantém item destacado visível.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${highlight}"]`,
    );
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

  // Modo edit: campo fixo, sem interação.
  if (disabled) {
    return (
      <div className={`${fieldInput} cursor-not-allowed opacity-70`}>
        {selectedLabel || 'Selecione…'}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger / valor selecionado */}
      {!open ? (
        <button
          type="button"
          onClick={openDropdown}
          className={`${fieldInput} flex items-center justify-between text-left`}
        >
          <span className={selected ? 'text-text-body' : 'text-text-muted'}>
            {selectedLabel || 'Selecione…'}
          </span>
          <span className="flex items-center gap-1">
            {selected && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="inline-flex h-5 w-5 items-center justify-center rounded-pill text-text-muted hover:bg-surface-2 hover:text-text-body"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-text-muted" />
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

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-button border border-border bg-surface shadow-md">
          <ul ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-muted">
                Nenhum cliente encontrado.
              </li>
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
                        active ? 'bg-surface-2' : ''
                      }`}
                    >
                      <span className="truncate text-text-body">
                        {c.name}
                        {c.phone ? (
                          <span className="text-text-muted"> — {c.phone}</span>
                        ) : null}
                      </span>
                      {isSel && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Rodapé fixo: cadastrar novo */}
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => {
                onCreateNew(query.trim());
                setOpen(false);
                setQuery('');
              }}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-surface-2"
            >
              <UserPlus className="h-4 w-4" />
              {query.trim() ? `Cadastrar “${query.trim()}”` : 'Novo cliente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
