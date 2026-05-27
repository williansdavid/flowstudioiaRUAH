import { motion } from 'framer-motion';
import { Scissors, Sparkles, Zap, Leaf, Eye, Gift } from 'lucide-react';

/**
 * Services Section - Art Deco Contemporary Design
 * Premium service cards with hover animations
 */
export default function ServicesSection() {
  const services = [
    {
      icon: Scissors,
      title: 'Corte Masculino',
      description: 'Cortes precisos com as técnicas mais modernas, personalizados para seu estilo',
      price: 'A partir de R$ 89',
    },
    {
      icon: Sparkles,
      title: 'Barba Premium',
      description: 'Modelagem e acabamento impecável com produtos de luxo',
      price: 'A partir de R$ 69',
    },
    {
      icon: Zap,
      title: 'Acabamento Facial',
      description: 'Limpeza e tonificação da pele com produtos premium',
      price: 'A partir de R$ 59',
    },
    {
      icon: Leaf,
      title: 'Tratamento Capilar',
      description: 'Hidratação e revitalização com produtos naturais de alta qualidade',
      price: 'A partir de R$ 79',
    },
    {
      icon: Eye,
      title: 'Design de Sobrancelha',
      description: 'Modelagem precisa que realça a expressão e sofisticação',
      price: 'A partir de R$ 49',
    },
    {
      icon: Gift,
      title: 'Combo Premium',
      description: 'Experiência completa: corte + barba + acabamento facial',
      price: 'A partir de R$ 189',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4a574]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1a3a3a]/5 rounded-full blur-3xl" />

      <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-[#d4a574]" />
            <span className="font-heading text-sm tracking-widest text-[#d4a574] uppercase">
              Nossos Serviços
            </span>
            <div className="h-1 w-12 bg-[#d4a574]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] mb-6">
            Serviços Premium
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Cada serviço é cuidadosamente desenvolvido para oferecer a melhor experiência de barbearia de luxo
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover="hover"
                className="group relative bg-white rounded-lg p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a574]/5 rounded-full blur-2xl group-hover:bg-[#d4a574]/10 transition-colors duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-block p-3 bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 rounded-lg group-hover:from-yellow-600/20 group-hover:to-yellow-600/10 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-[#d4a574]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-xl text-[#1a3a3a] mb-3 group-hover:text-[#d4a574] transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-gray-600 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="pt-6 border-t border-gray-100">
                    <p className="font-heading text-sm font-semibold text-[#d4a574]">
                      {service.price}
                    </p>
                  </div>

                  {/* Hover Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
