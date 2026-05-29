import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative bg-ammare-bg flex items-center justify-center min-h-[80vh] overflow-hidden">
      {/* Decorative subtle element - optimized for performance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ammare-light/5 rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <span className="block text-[0.65rem] tracking-[0.4em] uppercase text-ammare-dark/40 mb-8 font-light">
            Catálogo Exclusivo
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] text-ammare-dark mb-10 leading-[1.05] tracking-tight">
            A arte da recuperação<br />perfeita.
          </h2>
          <p className="font-sans text-sm md:text-base text-ammare-dark/60 mb-14 max-w-lg mx-auto font-light leading-relaxed">
            Soluções pós-operatórias cuidadosamente desenhadas para garantir conforto absoluto, segurança e resultados primorosos em cada detalhe.
          </p>
          
          <button 
            onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center justify-center px-12 py-5 text-[0.65rem] uppercase tracking-[0.3em] text-ammare-dark overflow-hidden font-medium"
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-ammare-white">Ver Catálogo</span>
            <div className="absolute inset-0 border border-ammare-dark/10 group-hover:border-transparent transition-colors duration-500" />
            <div className="absolute inset-0 bg-ammare-dark scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
