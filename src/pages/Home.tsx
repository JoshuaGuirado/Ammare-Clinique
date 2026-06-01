import Header from '../components/Header';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import WhatsAppButton from '../components/WhatsAppButton';
import { Aperture, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function Home() {
  const [searchParams] = useSearchParams();
  const isExclusive = searchParams.has('items') || searchParams.get('theme') === 'exclusive';
  const showCurated = isExclusive && searchParams.get('view') !== 'all';

  useEffect(() => {
    if (showCurated) {
      document.body.style.backgroundColor = '#212322'; // ammare-dark when in exclusive
    } else {
      document.body.style.backgroundColor = ''; // revert to CSS variable
    }
    
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [showCurated]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`min-h-screen flex flex-col ${showCurated ? 'bg-ammare-dark' : 'bg-ammare-bg'}`}
    >
      <Header />
      {showCurated ? (
        <div className="pt-32 pb-10 text-center px-4 bg-ammare-dark max-w-4xl mx-auto no-print">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 bg-ammare-primary/10 text-ammare-primary px-4 py-1.5 rounded-full mb-6 border border-ammare-primary/20"
          >
            <Sparkles size={12} className="text-ammare-primary animate-pulse" />
            <span className="text-[0.6rem] uppercase tracking-widest font-semibold">Seleção Personalizada</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-serif text-3xl md:text-5xl text-ammare-white mb-4 tracking-tight leading-tight"
          >
            Recomendação Exclusiva
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-ammare-white/60 max-w-xl mx-auto font-light leading-relaxed font-sans text-xs md:text-sm"
          >
            Olá! Preparamos com todo o cuidado e carinho esta seleção especial de produtos recomendados para a excelência do seu pós-operatório e sua plena recuperação.
          </motion.p>
          
          <div className="w-12 h-[1px] bg-ammare-primary/20 mx-auto mt-8" />
        </div>
      ) : (
        <Hero />
      )}
      
      <main className={`flex-grow flex flex-col ${showCurated ? 'bg-ammare-dark' : 'bg-ammare-bg'}`}>
        <Catalog />
      </main>
      
      <footer className="bg-ammare-dark py-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <Aperture className="w-8 h-8 text-ammare-white/[0.15] mb-6" strokeWidth={1} />
          <h2 className="font-serif text-2xl tracking-[0.15em] text-ammare-white/90 uppercase mb-3">
            Ammare
          </h2>
          <span className="font-sans text-[0.6rem] tracking-[0.4em] uppercase text-ammare-white/40 mb-16 font-light">
            Clinique
          </span>
          <p className="text-[0.65rem] text-ammare-white/30 font-light text-center tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Ammare. Reservados todos os direitos.
          </p>
        </div>
      </footer>
      
      <WhatsAppButton />
    </motion.div>
  );
}
