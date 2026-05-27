import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { content } from "@/sites/ruah";

export function HeroSection() {
  const { hero } = content;

  return (
    <section id="inicio" className="ruah-hero" aria-label="Apresentação">
      {/* Background image */}
      <div className="ruah-hero__bg">
        <img
          src={hero.backgroundImage}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Overlays */}
      <div className="ruah-hero__overlay" aria-hidden="true" />
      <div className="ruah-hero__vignette" aria-hidden="true" />

      {/* Conteúdo */}
      <div className="ruah-hero__content">
        <motion.div
          className="ruah-hero__eyebrow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="ruah-hero__eyebrow-line" aria-hidden="true" />
          <span className="ruah-hero__eyebrow-text">{hero.eyebrow}</span>
        </motion.div>

        <motion.h1
          className="ruah-hero__headline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        >
          {hero.subheadline}
        </motion.p>

        <motion.div
          className="ruah-hero__ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <a href={hero.primaryCta.href} className="ruah-btn ruah-btn--primary">
            {hero.primaryCta.label}
          </a>
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
        transition={{ duration: 0.8, delay: 1.2 }}
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
