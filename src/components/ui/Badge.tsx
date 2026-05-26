import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'muted'
  | 'brand';

type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    'bg-feedback-success/15 text-feedback-success border border-feedback-success/30',
  danger:
    'bg-feedback-error/15 text-feedback-error border border-feedback-error/30',
  warning:
    'bg-feedback-warning/15 text-feedback-warning border border-feedback-warning/30',
  info:
    'bg-feedback-info/15 text-feedback-info border border-feedback-info/30',
  muted:
    'bg-bg-subtle text-text-subtle border border-border-subtle',
  brand:
    'bg-brand-500/15 text-brand-300 border border-brand-500/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'muted', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium tracking-wide',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
