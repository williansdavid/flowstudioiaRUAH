import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Spinner de loading com acessibilidade.
 *
 * @example
 * <Spinner size="md" label="Carregando clientes..." />
 */
export function Spinner({
  size = 'md',
  label = 'Carregando',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span
        className={cn(
          'inline-block animate-spin rounded-full',
          'border-neutral-300 border-t-neutral-900',
          sizeStyles[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
