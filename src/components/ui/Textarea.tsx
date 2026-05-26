import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={error || undefined}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 transition-colors',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
          'resize-y',
          error
            ? 'border-feedback-error focus:border-feedback-error focus:ring-feedback-error/20'
            : 'border-neutral-300 focus:border-brand-500',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
