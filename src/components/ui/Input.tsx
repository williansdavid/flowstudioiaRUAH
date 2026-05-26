import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={error || undefined}
        className={cn(
          // Base
          'h-10 w-full rounded-md border px-3 text-sm transition-colors',
          'bg-bg-input text-text-strong',
          'placeholder:text-text-disabled',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500',
          // Disabled
          'disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-text-disabled',
          // Error / default border
          error
            ? 'border-feedback-error focus:border-feedback-error focus:ring-feedback-error/25'
            : 'border-border',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
