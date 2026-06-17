// src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
  // Ação principal — âmbar sólido, levanta no hover
  primary:
    'bg-accent text-surface-dark shadow-md ' +
    'hover:bg-accent-hover hover:shadow-accent hover:-translate-y-0.5',

  // Ação secundária — borda + texto, sem fundo
  ghost:
    'bg-transparent text-text-body border border-border ' +
    'hover:bg-surface-alt hover:text-text-heading hover:border-border-accent',

  // Ação destrutiva — vermelho ghost
  danger:
    'bg-transparent text-danger border border-danger/40 ' +
    'hover:bg-danger/10 hover:border-danger',

  // Ação positiva — verde ghost
  success:
    'bg-transparent text-success border border-success/40 ' +
    'hover:bg-success/10 hover:border-success',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',   // Pequeno — ações inline, tabelas
  md: 'px-5 py-2.5 text-sm',   // Médio  — ações de formulário (padrão)
  lg: 'px-7 py-3.5 text-base', // Grande — CTAs, cabeçalhos de página
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