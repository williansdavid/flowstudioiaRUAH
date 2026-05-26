import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant =
  | 'primary'     // dourado (brand) — CTA principal com gradiente
  | 'secondary'   // grafite quente
  | 'outline'     // borda + fundo card
  | 'ghost'       // sem fundo, hover dourado translúcido
  | 'destructive' // vermelho (ação destrutiva)
  | 'danger'      // @alias de 'destructive' (compat)
  | 'brand';      // @deprecated alias para 'primary'

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/**
 * Gradiente dourado RURH — usado em primary/brand.
 * Top mais claro, bottom mais envelhecido → efeito metal escovado.
 */
const GOLD_GRADIENT =
  'bg-[linear-gradient(180deg,oklch(0.78_0.13_82)_0%,oklch(0.62_0.11_75)_100%)]';

const GOLD_GRADIENT_HOVER =
  'hover:bg-[linear-gradient(180deg,oklch(0.82_0.13_82)_0%,oklch(0.66_0.11_75)_100%)]';

const GOLD_GRADIENT_ACTIVE =
  'active:bg-[linear-gradient(180deg,oklch(0.70_0.12_80)_0%,oklch(0.56_0.10_72)_100%)]';

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    GOLD_GRADIENT,
    GOLD_GRADIENT_HOVER,
    GOLD_GRADIENT_ACTIVE,
    'text-brand-fg',
    'shadow-[0_8px_24px_-8px_oklch(0.72_0.12_80/.5),inset_0_1px_0_oklch(1_0_0/.18)]',
    'hover:shadow-[0_10px_28px_-8px_oklch(0.72_0.12_80/.6),inset_0_1px_0_oklch(1_0_0/.22)]',
    'disabled:opacity-50 disabled:shadow-none',
  ),
  brand: cn(
    GOLD_GRADIENT,
    GOLD_GRADIENT_HOVER,
    GOLD_GRADIENT_ACTIVE,
    'text-brand-fg',
    'shadow-[0_8px_24px_-8px_oklch(0.72_0.12_80/.5),inset_0_1px_0_oklch(1_0_0/.18)]',
    'hover:shadow-[0_10px_28px_-8px_oklch(0.72_0.12_80/.6),inset_0_1px_0_oklch(1_0_0/.22)]',
    'disabled:opacity-50 disabled:shadow-none',
  ),
  secondary:
    'bg-bg-elevated text-text-strong border border-border-default ' +
    'hover:bg-bg-subtle hover:border-border-strong ' +
    'active:bg-bg-card ' +
    'disabled:opacity-50',
  outline:
    'border border-border-default bg-bg-card text-text-default ' +
    'hover:bg-bg-subtle hover:border-brand-500/40 hover:text-text-strong ' +
    'active:bg-bg-elevated ' +
    'disabled:opacity-50',
  ghost:
    'bg-transparent text-text-default ' +
    'hover:bg-brand-500/[0.08] hover:text-brand-400 ' +
    'active:bg-brand-500/[0.12] ' +
    'disabled:opacity-50',
  destructive:
    'bg-feedback-error text-white hover:opacity-90 active:opacity-80 disabled:opacity-50',
  danger:
    'bg-feedback-error text-white hover:opacity-90 active:opacity-80 disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
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
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
