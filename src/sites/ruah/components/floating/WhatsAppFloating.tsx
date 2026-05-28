import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/sites/ruah/lib/whatsapp'
import '@/sites/ruah/styles/whatsapp-floating.css'
/**
 * WhatsAppFloating — Botão flutuante de WhatsApp
 * ----------------------------------------------------------------
 * Duas variantes visuais controladas por `VARIANT`:
 *
 *   'A' → Clássico Premium
 *         Verde WhatsApp oficial (#25D366) com pulse dourado sutil.
 *         Seguro, conversão alta, padrão de mercado refinado.
 *
 *   'B' → Dark Luxury Ruah (recomendado)
 *         Preto profundo + borda/ícone dourado + glow accent.
 *         Casa com a identidade premium do Ruah Barber Lounge.
 *
 * Comportamento:
 *   - Aparece após 400px de scroll (fade + slide-up).
 *   - SSR-safe (não renderiza no servidor → evita hydration mismatch).
 *   - Acessibilidade: aria-label + role + foco visível.
 *   - Safe-area mobile (notch iOS).
 *   - Tooltip opcional ao hover (desktop).
 *
 * Para trocar de variante: edite a const VARIANT abaixo.
 * ----------------------------------------------------------------
 */

// 🎨 TROQUE AQUI PARA ALTERNAR: 'A' (clássico) ou 'B' (dark luxury)
const VARIANT: 'A' | 'B' = 'A'

const SCROLL_THRESHOLD = 200
const WHATSAPP_MESSAGE =
  'Olá! Vim pelo site da Ruah Barber Lounge e quero agendar um horário.'

export function WhatsAppFloating() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evita render no SSR (hydration-safe)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    handleScroll() // checa estado inicial
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  if (!mounted) return null

  const href = buildWhatsAppUrl(WHATSAPP_MESSAGE)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'ruah-wa-float',
        `ruah-wa-float--${VARIANT.toLowerCase()}`,
        visible ? 'ruah-wa-float--visible' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Agendar pelo WhatsApp (abre em nova aba)"
      role="button"
    >
      {/* Pulse rings (decorativos) */}
      <span className="ruah-wa-float__pulse" aria-hidden="true" />
      <span className="ruah-wa-float__pulse ruah-wa-float__pulse--delayed" aria-hidden="true" />

      {/* Ícone */}
      <span className="ruah-wa-float__icon" aria-hidden="true">
        <WhatsAppIcon />
      </span>

      {/* Tooltip (desktop hover) */}
      <span className="ruah-wa-float__tooltip" aria-hidden="true">
        Agende pelo WhatsApp
      </span>
    </a>
  )
}

/* ───────────────────────────────────────────────────────────────── */
/* WhatsApp Icon SVG — oficial, otimizado                            */
/* ───────────────────────────────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
