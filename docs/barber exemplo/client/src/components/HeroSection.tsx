import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Hero Section - Art Deco Contemporary Design
 * Premium opening with parallax effect and elegant typography
 * Background: Premium barber shop image with overlay
 */
export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/hero-barber-premium-eKFFycqqwuEbBTsXa2GmC5.webp"
          alt="Premium Barber Shop"
          className="h-full w-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        {/* Decorative Gold Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen items-center justify-start">
        <motion.div
          className="container max-w-6xl px-4 md:px-8 lg:px-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Brand Mark */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-[#d4a574]" />
              <span className="font-heading text-sm tracking-widest text-[#d4a574] uppercase">
                Experiência Premium
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-white"
          >
            RUAH
            <br />
            <span className="text-[#d4a574]">BARBER LOUNGE</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mb-12 max-w-2xl font-body text-lg md:text-xl text-gray-200 leading-relaxed"
          >
            Onde a sofisticação encontra a precisão. Descubra a experiência premium de barbearia que define novos padrões de elegância masculina.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <Button
              size="lg"
              className="bg-[#d4a574] hover:bg-yellow-700 text-black font-heading font-semibold px-8 py-6 text-lg rounded-sm transition-all duration-200 hover:shadow-lg hover:shadow-yellow-600/30"
            >
              Agendar Horário
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 font-heading font-semibold px-8 py-6 text-lg rounded-sm transition-all duration-200"
            >
              Conheça a Barbearia
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-[#d4a574]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
