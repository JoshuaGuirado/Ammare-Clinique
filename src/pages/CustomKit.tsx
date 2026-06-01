import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { useAppContext } from '../store';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

export default function CustomKit() {
  const { kits, customKitSelectedIds, removeFromCustomKit, customKitImage, isGeneratingImage } = useAppContext();

  const selectedItems = useMemo(() => {
    return customKitSelectedIds.map(id => kits.find(k => k.id === id)).filter(Boolean) as typeof kits;
  }, [customKitSelectedIds, kits]);

  const handleWhatsApp = () => {
    if (selectedItems.length === 0) return;
    
    const itemNames = selectedItems.map(item => `- ${item.name}`).join('\n');
    const text = encodeURIComponent(`Olá! Montei um kit personalizado no site e gostaria de saber mais informações. Os itens são:\n\n${itemNames}`);
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-ammare-bg">
      <Header />
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-ammare-primary/10 text-ammare-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={16} />
              <span className="text-[0.65rem] uppercase tracking-widest font-medium">powered by Nando Banana AI</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-ammare-dark mb-6 tracking-tight"
            >
              Seu Kit Personalizado
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-ammare-dark/60 max-w-2xl mx-auto font-light leading-relaxed font-sans text-sm md:text-base"
            >
              Visualização exclusiva do seu kit gerada automaticamente por Inteligência Artificial a partir dos itens selecionados.
            </motion.p>
          </div>

          {selectedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-ammare-light/10 rounded-sm border border-ammare-dark/5"
            >
              <p className="text-ammare-dark/50 mb-8 font-light tracking-wide">Seu kit está vazio.</p>
              <Link 
                to="/"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-ammare-dark text-ammare-white text-[0.7rem] uppercase tracking-[0.2em] transition-colors hover:bg-black"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Image preview area */}
              <div className="w-full lg:w-1/2 flex flex-col order-1 lg:order-2">
                <div className="sticky top-32">
                  <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/50 mb-6 font-medium">Pré-visualização do Kit</h3>
                  <div className="relative aspect-square w-full bg-ammare-light/10 border border-ammare-dark/5 overflow-hidden flex items-center justify-center rounded-sm">
                    {isGeneratingImage ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ammare-bg/80 backdrop-blur-sm z-10 transition-all duration-300">
                        <Loader2 className="w-8 h-8 text-ammare-primary animate-spin mb-4" />
                        <span className="text-[0.65rem] uppercase tracking-widest text-ammare-primary font-medium animate-pulse">
                          Gerando Imagem com IA...
                        </span>
                      </div>
                    ) : null}
                    
                    {customKitImage ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1, filter: isGeneratingImage ? 'blur(8px)' : 'blur(0px)' }}
                        transition={{ duration: 0.8 }}
                        src={customKitImage} 
                        alt="Seu Kit Personalizado" 
                        className="w-full h-full object-cover"
                      />
                    ) : !isGeneratingImage && (
                      <div className="text-ammare-dark/30 text-[0.65rem] uppercase tracking-widest">
                        Nenhuma imagem gerada
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-ammare-dark/5 pb-4">
                  <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/80 font-medium">
                    Itens Selecionados ({selectedItems.length})
                  </h3>
                </div>

                <div className="space-y-6 mb-12">
                  <AnimatePresence mode="popLayout">
                    {selectedItems.map((item, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        key={item.id}
                        className="flex items-center gap-6 group"
                      >
                        <div className="w-20 h-24 bg-ammare-light/20 shrink-0 overflow-hidden relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl || undefined} alt={item.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <span className="text-[0.55rem] uppercase tracking-widest text-ammare-dark/40 mb-1 truncate">
                            {item.category}
                          </span>
                          <h4 className="font-serif text-lg text-ammare-dark mb-1 truncate">
                            {item.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => removeFromCustomKit(item.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-full text-ammare-dark/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-auto pt-8 border-t border-ammare-dark/5">
                  <button 
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-ammare-dark text-ammare-white hover:bg-black transition-colors text-[0.7rem] uppercase tracking-[0.2em] font-medium shadow-xl"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Solicitar Kit no WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
