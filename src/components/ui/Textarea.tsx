import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
          'flex w-full rounded-lg border bg-white px-3 py-2 text-sm',
          'placeholder:text-neutral-500 resize-y min-h-[80px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
          error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-neutral-300 focus-visible:ring-neutral-900',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
