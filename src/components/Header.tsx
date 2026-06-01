import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Aperture, Moon, Sun, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../store';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('ammare_theme') === 'dark';
  });
  
  const [searchParams] = useSearchParams();
  const isExclusive = searchParams.has('items') || searchParams.get('theme') === 'exclusive';
  
  const { customKitSelectedIds } = useAppContext();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ammare_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ammare_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-700 ${isExclusive ? 'bg-ammare-dark/90 border-ammare-white/10' : 'bg-ammare-bg/80 border-ammare-dark/5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          <Link to="/" className="flex flex-col items-center group">
            <motion.div 
               initial={{ opacity: 0, rotate: -90 }} 
               animate={{ opacity: 1, rotate: 0 }} 
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="mb-1"
            >
              <Aperture className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-500 ${isExclusive ? 'text-ammare-white group-hover:text-ammare-white/60' : 'text-ammare-dark group-hover:text-ammare-dark/60'}`} strokeWidth={1} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
              className={`font-serif text-[1.2rem] md:text-[1.4rem] tracking-[0.15em] uppercase leading-none ${isExclusive ? 'text-ammare-white' : 'text-ammare-dark'}`}
            >
              Ammare
            </motion.h1>
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
              className={`font-sans text-[0.5rem] md:text-[0.55rem] tracking-[0.4em] mt-1 md:mt-2 uppercase font-light leading-none ${isExclusive ? 'text-ammare-white/40' : 'text-ammare-dark/40'}`}
            >
              Clinique
            </motion.span>
          </Link>

          <nav className="flex items-center space-x-6 md:space-x-10">
            <button 
              onClick={toggleTheme}
              className={`transition-colors duration-300 ${isExclusive ? 'text-ammare-white/40 hover:text-ammare-white' : 'text-ammare-dark/40 hover:text-ammare-dark'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-[14px] h-[14px] md:w-4 md:h-4" /> : <Moon className="w-[14px] h-[14px] md:w-4 md:h-4" />}
            </button>
            <Link to="/" className={`hidden md:block text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] transition-colors duration-300 ${isExclusive ? 'text-ammare-white hover:text-ammare-white/50' : 'text-ammare-dark hover:text-ammare-dark/50'}`}>Catálogo</Link>
            
            <Link to="/meu-kit" className={`flex items-center space-x-1.5 md:space-x-2 text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] transition-all duration-300 ${isExclusive ? 'text-ammare-white hover:text-ammare-white/80' : 'text-ammare-dark hover:text-ammare-dark/80'}`}>
              <span className="hidden sm:inline">Seu Kit Personalizado</span>
              <span className="sm:hidden">Kit</span>
              <AnimatePresence mode="popLayout">
                {customKitSelectedIds.length > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full text-[0.5rem] md:text-[0.55rem] font-medium ${isExclusive ? 'bg-ammare-white text-ammare-dark' : 'bg-ammare-dark text-ammare-white'}`}
                  >
                    {customKitSelectedIds.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link to="/admin" className={`hidden md:block text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] transition-colors duration-300 ${isExclusive ? 'text-ammare-white/30 hover:text-ammare-white' : 'text-ammare-dark/30 hover:text-ammare-dark'}`}>Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
