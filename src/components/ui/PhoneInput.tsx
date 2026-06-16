// src/components/ui/PhoneInput.tsx
import { forwardRef } from 'react';
import { maskPhoneBRInput } from '@/lib/core/utils';

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  /** Valor mascarado (string de exibição). */
  value: string;
  /** Recebe o novo valor JÁ mascarado. */
  onChange: (masked: string) => void;
}

const DEFAULT_CLASS =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

/**
 * Input de telefone BR com máscara progressiva.
 * - Apenas exibição/UX: a validação/normalização real é o phoneBRSchema.
 * - SSR-safe: sem acesso a window/document.
 * - Aceita colar número sujo/com +55 — a máscara limpa.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, className, ...rest }, ref) {
    return (
      <input
        {...rest}
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={16} // "(99) 99999-9999"
        className={className ?? DEFAULT_CLASS}
        value={value}
        onChange={(e) => onChange(maskPhoneBRInput(e.target.value))}
      />
    );
  },
);
