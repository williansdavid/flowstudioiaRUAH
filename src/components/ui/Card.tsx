import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type CardVariant =
  | 'default'      // card padrão (listas, formulários)
  | 'elevated'     // card com sombra média (destaques moderados)
  | 'interactive'  // clicável (hover dourado)
  | 'luxury'       // borda dourada sutil + shadow-gold (premium)
  | 'flat'         // sem borda nem sombra (containers internos)
  | 'dark';        // tema escuro (mantido por compat)

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-bg-card border border-border-subtle shadow-raised ' +
    '[box-shadow:var(--elevation-raised),var(--metal-highlight)]',
  elevated:
    'bg-bg-elevated border border-border-subtle ' +
    '[box-shadow:var(--elevation-floating),var(--metal-highlight)]',
  interactive:
    'bg-bg-card border border-border-subtle ' +
    '[box-shadow:var(--elevation-raised),var(--metal-highlight)] ' +
    'transition-all duration-base ' +
    'hover:border-brand-500/40 hover:[box-shadow:var(--elevation-floating),var(--metal-highlight)] ' +
    'cursor-pointer',
  luxury:
    'bg-bg-card border border-brand-500/30 ' +
    '[box-shadow:var(--shadow-gold),var(--metal-highlight)]',
  flat:
    'bg-transparent',
  dark:
    'bg-surface-dark border border-border-strong text-white',
};


const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4 md:p-6',
  lg:   'p-6 md:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantStyles[variant],
          paddingStyles[padding],
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-text-strong tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-text-subtle', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 flex items-center gap-2', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
