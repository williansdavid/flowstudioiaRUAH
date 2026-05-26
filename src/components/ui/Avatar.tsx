import { forwardRef, type HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarShape = 'circle' | 'square';
type AvatarTone = 'neutral' | 'gold';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  fallbackIcon?: LucideIcon;
  size?: AvatarSize;
  shape?: AvatarShape;
  tone?: AvatarTone;
  alt?: string;
  ring?: boolean;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const iconSizeStyles: Record<AvatarSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const shapeStyles: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
};

const toneStyles: Record<AvatarTone, string> = {
  neutral: 'bg-bg-subtle text-text-subtle',
  gold:    'bg-brand-500/10 text-brand-400 border border-brand-500/20',
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src, name, fallbackIcon: FallbackIcon,
      size = 'md', shape = 'circle', tone = 'neutral',
      alt = '', ring = false, className, ...props
    },
    ref,
  ) => {
    const base = cn(
      'flex flex-shrink-0 items-center justify-center overflow-hidden font-semibold',
      sizeStyles[size],
      shapeStyles[shape],
      toneStyles[tone],
      ring && 'ring-1 ring-brand-500/40 ring-offset-1 ring-offset-bg-page',
      className,
    );

    if (src) {
      return (
        <div ref={ref} className={base} {...props}>
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      );
    }

    if (FallbackIcon) {
      return (
        <div ref={ref} className={base} {...props}>
          <FallbackIcon className={iconSizeStyles[size]} />
        </div>
      );
    }

    return (
      <div ref={ref} className={base} {...props}>
        {getInitials(name ?? '')}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
