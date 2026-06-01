import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Aperture, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../store';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('ammare_theme') === 'dark';
  });
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isExclusive = searchParams.has('items') || searchParams.get('theme') === 'exclusive';
  const showCurated = isExclusive && searchParams.get('view') !== 'all';
  
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

  const getURLWithView = (view: 'all' | 'personalized') => {
    const newParams = new URLSearchParams(searchParams);
    if (view === 'all') {
      newParams.set('view', 'all');
    } else {
      newParams.delete('view');
    }
    return `/?${newParams.toString()}`;
  };

  const getKitBuilderURL = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('view');
    return `/meu-kit?${newParams.toString()}`;
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-700 ${showCurated ? 'bg-ammare-dark/90 border-ammare-white/10' : 'bg-ammare-bg/80 border-ammare-dark/5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          <Link to={isExclusive ? getURLWithView('personalized') : "/"} className="flex flex-col items-center group">
            <motion.div 
               initial={{ opacity: 0, rotate: -90 }} 
               animate={{ opacity: 1, rotate: 0 }} 
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="mb-1"
            >
              <Aperture className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-500 ${showCurated ? 'text-ammare-white group-hover:text-ammare-white/60' : 'text-ammare-dark group-hover:text-ammare-dark/60'}`} strokeWidth={1} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
              className={`font-serif text-[1.2rem] md:text-[1.4rem] tracking-[0.15em] uppercase leading-none ${showCurated ? 'text-ammare-white' : 'text-ammare-dark'}`}
            >
              Ammare
            </motion.h1>
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
              className={`font-sans text-[0.5rem] md:text-[0.55rem] tracking-[0.4em] mt-1 md:mt-2 uppercase font-light leading-none ${showCurated ? 'text-ammare-white/40' : 'text-ammare-dark/40'}`}
            >
              Clinique
            </motion.span>
          </Link>

          <nav className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10">
            <button 
              onClick={toggleTheme}
              className={`transition-colors duration-300 ${showCurated ? 'text-ammare-white/40 hover:text-ammare-white' : 'text-ammare-dark/40 hover:text-ammare-dark'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-[14px] h-[14px] md:w-4 md:h-4" /> : <Moon className="w-[14px] h-[14px] md:w-4 md:h-4" />}
            </button>

            {isExclusive ? (
              <>
                <Link 
                  to={getURLWithView('all')} 
                  className={`text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 pb-0.5 font-medium
                    ${location.pathname === '/' && searchParams.get('view') === 'all'
                      ? 'text-ammare-primary border-b border-ammare-primary'
                      : showCurated
                        ? 'text-ammare-white/60 hover:text-ammare-white'
                        : 'text-ammare-dark/60 hover:text-ammare-dark'
                    }
                  `}
                >
                  <span className="hidden sm:inline">Catálogo Geral</span>
                  <span className="sm:hidden">Normal</span>
                </Link>
                <Link 
                  to={getURLWithView('personalized')} 
                  className={`text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 pb-0.5 font-medium
                    ${location.pathname === '/' && searchParams.get('view') !== 'all'
                      ? 'text-ammare-primary border-b border-ammare-primary'
                      : showCurated
                        ? 'text-ammare-white/60 hover:text-ammare-white'
                        : 'text-ammare-dark/60 hover:text-ammare-dark'
                    }
                  `}
                >
                  <span className="hidden sm:inline">Catálogo Personalizado</span>
                  <span className="sm:hidden">Personalizado</span>
                </Link>
              </>
            ) : (
              <Link 
                to="/" 
                className={`text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 pb-0.5 font-medium
                  ${location.pathname === '/' 
                    ? 'text-ammare-primary border-b border-ammare-primary'
                    : showCurated
                      ? 'text-ammare-white/60 hover:text-ammare-white'
                      : 'text-ammare-dark/60 hover:text-ammare-dark'
                  }
                `}
              >
                Catálogo
              </Link>
            )}
            
            <Link 
              to={getKitBuilderURL()} 
              className={`flex items-center space-x-1.5 text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 pb-0.5 font-medium
                ${location.pathname === '/meu-kit'
                  ? 'text-ammare-primary border-b border-ammare-primary'
                  : showCurated
                    ? 'text-ammare-white/60 hover:text-ammare-white'
                    : 'text-ammare-dark/60 hover:text-ammare-dark'
                }
              `}
            >
              <span className="hidden md:inline">Seu Kit Personalizado</span>
              <span className="md:hidden">Meu Kit</span>
              <AnimatePresence mode="popLayout">
                {customKitSelectedIds.length > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full text-[0.5rem] md:text-[0.55rem] font-medium ${showCurated ? 'bg-ammare-white text-ammare-dark' : 'bg-ammare-dark text-ammare-white'}`}
                  >
                    {customKitSelectedIds.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link 
              to={isExclusive ? `/admin?${searchParams.toString()}` : "/admin"} 
              className={`hidden md:block text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-300 ${showCurated ? 'text-ammare-white/30 hover:text-ammare-white' : 'text-ammare-dark/30 hover:text-ammare-dark'}`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
