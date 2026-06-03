/**
 * HeroSection â€” Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Hero acima da dobra. AnimaÃ§Ãµes SNAPPY (premium â‰  lento).
 *
 * BACKGROUND: vÃ­deo Ãºnico em loop (autoplay/muted/playsInline).
 *   â€¢ Poster (.webp) como fallback atÃ© o vÃ­deo carregar (LCP-safe).
 *   â€¢ Respeita prefers-reduced-motion (pausa o vÃ­deo, mostra poster).
 *   â€¢ Mobile-first: playsInline obrigatÃ³rio (iOS).
 *
 * Timing das animaÃ§Ãµes de entrada (total â‰ˆ 750ms atÃ© CTAs visÃ­veis):
 *   eyebrow      â†’ 0ms    + 500ms
 *   headline     â†’ 80ms   + 600ms
 *   subheadline  â†’ 180ms  + 500ms
 *   ctas         â†’ 280ms  + 500ms
 *   scroll arrow â†’ 600ms  + 400ms
 *
 * Easing: cubic-bezier(0.22, 1, 0.36, 1) â€” easeOutExpo customizado.
 * ----------------------------------------------------------------
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { content } from "@/sites/ruah";

// Easing premium reutilizÃ¡vel (easeOutExpo customizado)
const EASE = [0.22, 1, 0.36, 1] as const;

// Fontes do background â€” vÃ­deo + poster fallback
const HERO_VIDEO_SRC = "/ruah/videos/v1.mp4";
const HERO_POSTER_SRC = "/ruah/images/gallery/showreel-poster.webp";

export function HeroSection() {
  const { hero } = content;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detecta prefers-reduced-motion (SSR-safe)
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Pausa o vÃ­deo se o usuÃ¡rio preferir menos movimento
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => {
        /* autoplay bloqueado em alguns browsers â€” poster cobre */
      });
    }
  }, [reducedMotion]);

  return (
    <section id="inicio" className="ruah-hero" aria-label="ApresentaÃ§Ã£o">
      {/* Background â€” vÃ­deo Ãºnico em loop */}
      <div className="ruah-hero__bg" aria-hidden="true">
        <video
          ref={videoRef}
          className="ruah-hero__video"
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
        />
      </div>

      {/* Overlays */}
      <div className="ruah-hero__overlay" aria-hidden="true" />
      <div className="ruah-hero__vignette" aria-hidden="true" />

      {/* ConteÃºdo */}
      <div className="ruah-hero__content">
        <motion.div
          className="ruah-hero__eyebrow"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="ruah-hero__eyebrow-line" aria-hidden="true" />
          <span className="ruah-hero__eyebrow-text">{hero.eyebrow}</span>
        </motion.div>

        <motion.h1
          className="ruah-hero__headline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          <span className="ruah-hero__headline-line">
            {hero.headlineLine1}
          </span>
          <span className="ruah-hero__headline-line ruah-hero__headline-accent">
            {hero.headlineLine2}
          </span>
        </motion.h1>

        <motion.p
          className="ruah-hero__subheadline"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
        >
          {hero.subheadline}
        </motion.p>

        <motion.div
          className="ruah-hero__ctas"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
        >
          {/* CTA primÃ¡rio â†’ WhatsApp (nova aba) */}
          <a
            href={hero.primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ruah-btn ruah-btn--primary"
          >
            {hero.primaryCta.label}
          </a>

          {/* CTA secundÃ¡rio â†’ Ã¢ncora interna (mesma aba) */}
          {hero.secondaryCta && (
            <a
              href={hero.secondaryCta.href}
              className="ruah-btn ruah-btn--ghost"
            >
              {hero.secondaryCta.label}
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#sobre"
        className="ruah-hero__scroll"
        aria-label="Rolar para prÃ³xima seÃ§Ã£o"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: EASE }}
      >
        <motion.span
          className="ruah-hero__scroll-icon"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} strokeWidth={1.5} />
        </motion.span>
      </motion.a>
    </section>
  );
}
