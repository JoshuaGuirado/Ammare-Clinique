import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { useAppContext } from '../store';
import KitCard from './KitCard';

export default function Catalog() {
  const { kits, categories } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKits = kits.filter(kit => {
    const matchesCategory = activeCategory === 'Todos' || kit.category === activeCategory;
    const isActive = kit.isActive !== false;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      kit.name.toLowerCase().includes(searchLower) || 
      kit.shortDescription.toLowerCase().includes(searchLower) ||
      kit.fullDescription.toLowerCase().includes(searchLower);
      
    return matchesCategory && isActive && matchesSearch;
  });

  return (
    <section id="catalogo" className="py-24 bg-ammare-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Categories */}
        <div className="flex flex-col mb-16 gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-ammare-dark mb-4">
                Coleção de Kits
              </h2>
              <p className="font-sans text-sm text-ammare-dark/50 font-light max-w-md">
                Explore nossa seleção de produtos desenhados para uma recuperação tranquila e resultados excelentes.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ammare-dark/5 pb-2">
            <div className="flex flex-wrap gap-6 md:gap-8">
              {categories.map((cat, i) => (
                <button
                  key={`${cat}-${i}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[0.65rem] uppercase tracking-[0.2em] transition-colors duration-500 pb-1 relative ${
                    activeCategory === cat 
                      ? 'text-ammare-dark font-medium' 
                      : 'text-ammare-dark/40 hover:text-ammare-dark/80 font-light'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="absolute -bottom-[9px] left-0 right-0 h-[1px] bg-ammare-dark"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0 pb-1">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ammare-dark/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR KITS..."
                className="w-full bg-transparent border-0 border-b border-transparent focus:border-ammare-dark/20 pl-7 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark focus:outline-none transition-colors placeholder:text-ammare-dark/30 font-light"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
        >
          <AnimatePresence>
            {filteredKits.map((kit, index) => (
              <motion.div
                layout
                key={kit.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
              >
                <KitCard kit={kit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredKits.length === 0 && (
          <div className="text-center py-32">
            <span className="text-[0.7rem] uppercase tracking-widest text-ammare-dark/40">
              Nenhum kit encontrado nesta categoria.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
