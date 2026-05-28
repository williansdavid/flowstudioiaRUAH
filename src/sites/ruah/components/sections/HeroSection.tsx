/**
 * HeroSection — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Hero acima da dobra. Animações SNAPPY (premium ≠ lento).
 *
 * NOVO nesta versão: carrossel de fundo com crossfade.
 *
 *   • Ativa automaticamente se hero.backgroundImage for array com 2+ itens.
 *   • 7s por slide, crossfade de 1.2s (controlado por CSS).
 *   • Respeita prefers-reduced-motion (pausa o ciclo).
 *   • LCP-safe: 1ª img eager + high priority, demais lazy + low.
 *
 * Timing das animações de entrada (total ≈ 750ms até CTAs visíveis):
 *   eyebrow      → 0ms    + 500ms
 *   headline     → 80ms   + 600ms
 *   subheadline  → 180ms  + 500ms
 *   ctas         → 280ms  + 500ms
 *   scroll arrow → 600ms  + 400ms
 *
 * Easing: cubic-bezier(0.22, 1, 0.36, 1) — easeOutExpo customizado.
 * ----------------------------------------------------------------
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { content } from "@/sites/ruah";

// Easing premium reutilizável (easeOutExpo customizado)
const EASE = [0.22, 1, 0.36, 1] as const;

// Tempo que cada slide do carrossel permanece visível
const SLIDE_INTERVAL_MS = 7000;

export function HeroSection() {
  const { hero } = content;

  // Normaliza backgroundImage (string | string[]) para sempre array
  const images = useMemo<string[]>(() => {
    return Array.isArray(hero.backgroundImage)
      ? hero.backgroundImage
      : [hero.backgroundImage];
  }, [hero.backgroundImage]);

  const hasCarousel = images.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Ciclo do carrossel — só roda se houver 2+ imagens e o user não pediu reduzir movimento
  useEffect(() => {
    if (!hasCarousel || reducedMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [hasCarousel, reducedMotion, images.length]);

  return (
    <section id="inicio" className="ruah-hero" aria-label="Apresentação">
      {/* Background — 1 imagem ou carrossel crossfade */}
      <div className="ruah-hero__bg" aria-hidden="true">
        {images.map((src, idx) => (
          <div
            key={src}
            className={`ruah-hero__slide${
              idx === activeIndex ? " ruah-hero__slide--active" : ""
            }`}
          >
            <img
              src={src}
              alt=""
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx === 0 ? "high" : "low"}
            />
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="ruah-hero__overlay" aria-hidden="true" />
      <div className="ruah-hero__vignette" aria-hidden="true" />
		{/* Progress bar dourada — sincronizada com SLIDE_INTERVAL_MS */}
		{hasCarousel && !reducedMotion && (
		  <div className="ruah-hero__progress" aria-hidden="true">
			<span
			  key={activeIndex}
			  className="ruah-hero__progress-bar"
			  style={{ animationDuration: `${SLIDE_INTERVAL_MS}ms` }}
			/>
		  </div>
		)}
	
      {/* Conteúdo */}
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
          {/* CTA primário → WhatsApp (nova aba) */}
          <a
            href={hero.primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ruah-btn ruah-btn--primary"
          >
            {hero.primaryCta.label}
          </a>

          {/* CTA secundário → âncora interna (mesma aba) */}
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
        aria-label="Rolar para próxima seção"
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
