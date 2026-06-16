import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-button font-heading ' +
  'font-semibold uppercase tracking-wide select-none ' +
  'transition-all duration-200 ease-out ' +
  'active:scale-[0.97] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-bg ' +
  'disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none';

const variants: Record<ButtonVariant, string> = {
  // v1 do PRIMÁRIO — dourado, sombra que levanta no hover
  primary:
    'bg-accent text-surface-dark shadow-md ' +
    'hover:bg-accent-hover hover:shadow-accent hover:-translate-y-0.5',
  accent: 'bg-accent text-text-on-dark hover:bg-accent-hover',
  ghost: 'bg-transparent text-text-body border border-border hover:bg-surface-alt',
  danger: 'bg-danger text-text-on-dark hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
