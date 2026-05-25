import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
}

/**
 * Input de senha com toggle de visibilidade (olho).
 * Mantém a API do Input mas substitui o tipo por password/text dinâmico.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-invalid={error || undefined}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-neutral-900',
            'placeholder:text-neutral-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-neutral-300 focus-visible:ring-[var(--brand-primary)]',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5',
            'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
          )}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
