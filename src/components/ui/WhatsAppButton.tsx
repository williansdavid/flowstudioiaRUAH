// src/components/ui/WhatsAppButton.tsx
import { cn } from '@/lib/cn';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface WhatsAppButtonProps {
  /** Link wa.me gerado por toWhatsAppHref(). Se null, o botão não renderiza. */
  href: string | null;
  /** Texto ao lado do ícone (padrão: "WhatsApp"). Ignorado se iconOnly. */
  label?: string;
  /** Apenas o ícone, sem label — formato circular (uso na listagem). */
  iconOnly?: boolean;
  /** Classes extras. */
  className?: string;
}

/**
 * WhatsAppButton — Botão padrão da marca.
 *
 * Duas variantes:
 *   - `iconOnly={false}` (padrão): Pill com ícone + label "WhatsApp"
 *   - `iconOnly={true}`: Circular, só o ícone (espaço reduzido)
 *
 * Estilo: outline verde WhatsApp com hover glow.
 * Se href for null, retorna null (seguro pra telefones inválidos).
 */
export function WhatsAppButton({
  href,
  label = 'WhatsApp',
  iconOnly = false,
  className,
}: WhatsAppButtonProps) {
  if (!href) return null;

  const baseStyle =
    'inline-flex items-center justify-center gap-1.5 border font-bold uppercase tracking-wider ' +
    'border-emerald-500/20 text-emerald-400 ' +
    'hover:bg-emerald-500/10 hover:border-emerald-500/40 ' +
    'transition-all duration-200 active:scale-95';

  if (iconOnly) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        title="Conversar no WhatsApp"
        className={cn(
          baseStyle,
          'h-8 w-8 shrink-0 rounded-full text-[11px]',
          className,
        )}
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      title="Conversar no WhatsApp"
      className={cn(
        baseStyle,
        'rounded-lg px-3 py-2 text-[11px]',
        className,
      )}
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}