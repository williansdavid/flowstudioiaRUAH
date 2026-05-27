import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Gallery Section - Art Deco Contemporary Design
 * Premium gallery with luxury portfolio layout
 */
export default function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const galleryItems = [
    {
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-detail-cut-CpqWV5bA9dsLDY4DuSygmc.webp',
      title: 'Corte Premium',
      category: 'Cortes',
    },
    {
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-beard-grooming-BJhM8WnSf7eHMnsd7erAXf.webp',
      title: 'Barba Artesanal',
      category: 'Barba',
    },
    {
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-lounge-interior-Q7i6jQhuQJWrmQgUCYCXgo.webp',
      title: 'Ambiente Sofisticado',
      category: 'Espaço',
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-600/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1a3a3a]/5 to-transparent rounded-full blur-3xl" />

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
              Galeria Premium
            </span>
            <div className="h-1 w-12 bg-[#d4a574]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] mb-6">
            Nosso Trabalho
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Cada imagem conta a história de precisão, elegância e dedicação ao ofício
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {galleryItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-80 md:h-96"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <motion.div
                className="absolute inset-0 flex flex-col justify-end p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={hoveredIndex === idx ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2">
                  <span className="inline-block font-heading text-xs tracking-widest text-yellow-400 uppercase mb-2">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                  {item.title}
                </h3>
              </motion.div>

              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
