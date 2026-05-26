import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Aperture } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-ammare-bg/80 backdrop-blur-md border-b border-ammare-dark/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex flex-col items-center group">
            <motion.div 
               initial={{ opacity: 0, rotate: -90 }} 
               animate={{ opacity: 1, rotate: 0 }} 
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="mb-1"
            >
              <Aperture className="w-7 h-7 text-ammare-dark group-hover:text-ammare-dark/60 transition-colors duration-500" strokeWidth={1} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-[1.4rem] tracking-[0.15em] text-ammare-dark uppercase leading-none"
            >
              Ammare
            </motion.h1>
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
              className="font-sans text-[0.55rem] tracking-[0.4em] mt-2 uppercase text-ammare-dark/40 font-light leading-none"
            >
              Clinique
            </motion.span>
          </Link>

          <nav className="flex items-center space-x-10">
            <Link to="/" className="text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark hover:text-ammare-dark/50 transition-colors duration-300">Catálogo</Link>
            <Link to="/admin" className="text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/30 hover:text-ammare-dark transition-colors duration-300">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
