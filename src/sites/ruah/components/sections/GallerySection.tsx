import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { content, useReveal } from '@/sites/ruah'
import type { GalleryMedia } from '@/sites/ruah/types'


/**
 * GallerySection — Carrossel premium de fotos e vídeos
 * ----------------------------------------------------
 * - Spotlight central + laterais reduzidas (desktop)
 * - Slide único + swipe nativo (mobile)
 * - Vídeo autoplay/muted/loop SOMENTE no slide ativo
 * - Lightbox modal ao clicar
 * - Navegação por teclado (←/→/Esc) quando lightbox aberto
 * - Guard: se gallery ausente ou vazia, não renderiza
 */
export function GallerySection() {
  const gallery = content.gallery

  // Guard SSR-safe — section opcional
  if (!gallery || !gallery.items || gallery.items.length === 0) {
    return null
  }

  const { eyebrow, title, subtitle, items } = gallery

  const headerRef = useReveal<HTMLDivElement>()
  const carouselRef = useReveal<HTMLDivElement>()

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const total = items.length

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % total) + total) % total
      setActiveIndex(next)
    },
    [total],
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  // Teclado: navegação + fechar lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, goPrev, goNext])

  // Lock scroll quando lightbox aberto
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  return (
    <section id="galeria" className="ruah-gallery">
      <div className="ruah-gallery__container">
        {/* Header */}
        <div ref={headerRef} className="ruah-gallery__header reveal-stroke">
          {eyebrow && <span className="ruah-gallery__eyebrow">{eyebrow}</span>}
          <h2 className="ruah-gallery__title">{title}</h2>
          {subtitle && <p className="ruah-gallery__subtitle">{subtitle}</p>}
        </div>

        {/* Carrossel */}
        <div ref={carouselRef} className="ruah-gallery__carousel reveal-stroke">
          <button
            type="button"
            className="ruah-gallery__nav ruah-gallery__nav--prev"
            onClick={goPrev}
            aria-label="Item anterior"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>

          <div className="ruah-gallery__track">
            {items.map((item, index) => {
              const offset = index - activeIndex
              const isActive = offset === 0

              return (
                <GallerySlide
                  key={`${item.type}-${item.src}-${index}`}
                  item={item}
                  offset={offset}
                  isActive={isActive}
                  total={total}
                  onClick={() => {
                    if (isActive) {
                      setLightboxOpen(true)
                    } else {
                      goTo(index)
                    }
                  }}
                />
              )
            })}
          </div>

          <button
            type="button"
            className="ruah-gallery__nav ruah-gallery__nav--next"
            onClick={goNext}
            aria-label="Próximo item"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Dots */}
        <div className="ruah-gallery__dots" role="tablist">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`ruah-gallery__dot ${
                index === activeIndex ? 'ruah-gallery__dot--active' : ''
              }`}
              onClick={() => goTo(index)}
              aria-label={`Ir para item ${index + 1}`}
              aria-selected={index === activeIndex}
              role="tab"
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && items[activeIndex] && (
        <GalleryLightbox
          item={items[activeIndex]!}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
          currentIndex={activeIndex}
          total={total}
        />
      )}
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Slide individual
// ════════════════════════════════════════════════════════════════
interface GallerySlideProps {
  item: GalleryMedia
  offset: number
  isActive: boolean
  total: number
  onClick: () => void
}

function GallerySlide({ item, offset, isActive, onClick }: GallerySlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Autoplay/pause condicional ao slide ativo (economia de CPU)
  useEffect(() => {
    if (item.type !== 'video') return
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.play().catch(() => {
        // Autoplay bloqueado por política do browser — silencioso
      })
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive, item.type])

  // Slides fora da janela visível (|offset| > 2) ficam ocultos
  const isVisible = Math.abs(offset) <= 2

  return (
    <button
      type="button"
      className={`ruah-gallery__slide ${
        isActive ? 'ruah-gallery__slide--active' : ''
      }`}
      style={{
        // @ts-expect-error CSS var customizada
        '--offset': offset,
        opacity: isVisible ? undefined : 0,
        pointerEvents: isVisible ? undefined : 'none',
      }}
      onClick={onClick}
      aria-label={item.alt}
      tabIndex={isActive ? 0 : -1}
    >
      <div className="ruah-gallery__slide-inner">
        {item.type === 'image' ? (
          <img
            src={item.src}
            alt={item.alt}
            className="ruah-gallery__media"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              className="ruah-gallery__media"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={item.alt}
            />
            {!isActive && (
              <span className="ruah-gallery__play-badge" aria-hidden="true">
                <Play size={20} strokeWidth={1.5} fill="currentColor" />
              </span>
            )}
          </>
        )}
      </div>
    </button>
  )
}

// ════════════════════════════════════════════════════════════════
// Lightbox modal
// ════════════════════════════════════════════════════════════════
interface GalleryLightboxProps {
  item: GalleryMedia
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  total: number
}

function GalleryLightbox({
  item,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  total,
}: GalleryLightboxProps) {
  return (
    <div
      className="ruah-gallery__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada"
      onClick={onClose}
    >
      <button
        type="button"
        className="ruah-gallery__lightbox-close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <X size={28} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        className="ruah-gallery__lightbox-nav ruah-gallery__lightbox-nav--prev"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Anterior"
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>

      <div
        className="ruah-gallery__lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img
            src={item.src}
            alt={item.alt}
            className="ruah-gallery__lightbox-media"
          />
        ) : (
          <video
            src={item.src}
            poster={item.poster}
            className="ruah-gallery__lightbox-media"
            controls
            autoPlay
            loop
            playsInline
            aria-label={item.alt}
          />
        )}
      </div>

      <button
        type="button"
        className="ruah-gallery__lightbox-nav ruah-gallery__lightbox-nav--next"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Próximo"
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      <span className="ruah-gallery__lightbox-counter">
        {currentIndex + 1} / {total}
      </span>
    </div>
  )
}
