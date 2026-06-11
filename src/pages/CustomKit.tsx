import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, ArrowRight, Loader2, MessageCircle, Download, Gift, Plus, Check, Box } from 'lucide-react';
import { useAppContext } from '../store';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import LuxuryBackground from '../components/LuxuryBackground';

const THEMES = [
  { id: 'minimalist_white', name: 'Minimalist White', color: 'bg-white', border: 'border-zinc-300', text: 'text-zinc-700', desc: 'Fundo branco limpo minimalista com iluminação natural suave.' },
  { id: 'champagne_luxury', name: 'Warm Sand', color: 'bg-[#F5F2EC]', border: 'border-[#C4A47C]', text: 'text-[#8A714C]', desc: 'Texturas de areia quente e pedras orgânicas sob luz solar.' },
  { id: 'black_gold', name: 'Luxury Dark', color: 'bg-[#1C1C1E]', border: 'border-yellow-600', text: 'text-yellow-500', desc: 'Mármore preto com reflexos dourados e luz de estúdio.' },
  { id: 'rose_gold_blossom', name: 'Botanical Rose', color: 'bg-[#FAF0ED]', border: 'border-[#E8C1B5]', text: 'text-[#C98A7B]', desc: 'Argila rosa com sombras de folhas e toques botânicos.' }
];

const UnboxingLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-20 h-20 relative mb-6 flex items-center justify-center bg-ammare-primary/10 rounded-full border border-ammare-primary/20"
      >
        <Sparkles className="w-8 h-8 text-ammare-primary animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-0 bg-ammare-primary/5 rounded-full blur-md" />
      </motion.div>

      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-ammare-primary font-semibold animate-pulse">
        Gerando Imagem com IA...
      </span>
      <span className="text-[0.55rem] text-ammare-dark/40 uppercase tracking-widest mt-2 block">
        Renderizando sua combinação exclusiva
      </span>
    </div>
  );
};

export default function CustomKit() {
  const { 
    kits, 
    customKitSelectedIds, 
    removeFromCustomKit, 
    addToCustomKit,
    customKitImage, 
    isGeneratingImage,
    customKitTheme,
    setCustomKitTheme,
    generateCustomKitImage
  } = useAppContext();

  const selectedItems = useMemo(() => {
    return customKitSelectedIds.map(id => kits.find(k => k.id === id)).filter(Boolean) as typeof kits;
  }, [customKitSelectedIds, kits]);

  const complementaryProducts = useMemo(() => {
    // Filter kits that are individual products and not yet selected
    return kits.filter(k => k.isIndividual === true && k.isActive !== false);
  }, [kits]);

  const handleWhatsApp = () => {
    if (selectedItems.length === 0) return;
    
    const itemNames = selectedItems.map(item => `- ${item.name} (${item.category})`).join('\n');
    const text = encodeURIComponent(`Olá! Montei um kit pós-operatório personalizado no site e gostaria de um orçamento.\n\n*Produtos Selecionados:*\n${itemNames}\n\nObrigado(a)!`);
    window.open(`https://wa.me/5544999665711?text=${text}`, '_blank');
  };

  const handleDownloadImage = () => {
    if (!customKitImage) return;
    const link = document.createElement('a');
    link.href = customKitImage;
    link.download = `meu-kit-ammare-${customKitTheme}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-ammare-bg transition-colors duration-700 relative overflow-hidden"
    >
      <LuxuryBackground />
      <Header />
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-ammare-primary/10 text-ammare-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[0.65rem] uppercase tracking-widest font-semibold">Tecnologia Inteligente</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-ammare-dark mb-4 tracking-tight"
            >
              Seu Kit Personalizado
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-ammare-dark/60 max-w-2xl mx-auto font-light leading-relaxed font-sans text-sm"
            >
              Selecione o cenário fotográfico desejado e adicione os itens essenciais para sua recuperação. Nossa IA criará uma pré-visualização fotorrealista exclusiva dos seus produtos juntos.
            </motion.p>
          </div>

          {selectedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-ammare-white/40 rounded-sm border border-ammare-dark/5 shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center p-8"
            >
              <Box className="w-12 h-12 text-ammare-dark/20 mb-4" strokeWidth={1} />
              <p className="text-ammare-dark/50 mb-8 font-light tracking-wide text-sm">Nenhum produto selecionado para seu kit pós-operatório ainda.</p>
              <Link 
                to="/"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-ammare-dark text-ammare-white text-[0.7rem] uppercase tracking-[0.2em] transition-all hover:bg-black rounded-sm shadow-md"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Left Column: Configurator & List */}
              <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col gap-10">
                
                {/* 1. Selected Items list */}
                <div className="bg-ammare-white/50 p-6 md:p-8 rounded-sm border border-ammare-dark/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-ammare-dark/5 pb-4">
                    <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/80 font-semibold">
                      1. Itens Selecionados ({selectedItems.length})
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {selectedItems.map((item, index) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-ammare-white border border-ammare-dark/5 rounded-sm hover:shadow-sm transition-all"
                        >
                          <div className="w-12 h-14 bg-ammare-light/10 overflow-hidden relative shrink-0 rounded-sm">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-ammare-light/20 flex items-center justify-center text-[8px] text-ammare-dark/40">ITEM</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-[0.55rem] uppercase tracking-widest text-ammare-primary font-medium block">
                              {item.category}
                            </span>
                            <h4 className="font-serif text-sm text-ammare-dark truncate">
                              {item.name}
                            </h4>
                          </div>

                          <button
                            onClick={() => removeFromCustomKit(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-ammare-dark/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                            title="Remover do Kit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 2. Complementary Products (Carousel / Selector) */}
                {complementaryProducts.length > 0 && (
                  <div className="bg-ammare-white/50 p-6 md:p-8 rounded-sm border border-ammare-dark/5 shadow-sm w-full overflow-hidden">
                    <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/80 font-semibold mb-6">
                      2. Adicione Itens Individuais para Complementar
                    </h3>
                    
                    <div className="flex overflow-x-auto gap-4 pb-4 ammare-scrollbar">
                      {complementaryProducts.map((prod) => {
                        const isAdded = customKitSelectedIds.includes(prod.id);
                        return (
                          <div 
                            key={prod.id}
                            className={`w-40 shrink-0 bg-ammare-white border rounded-sm p-3 flex flex-col justify-between transition-all duration-300 ${
                              isAdded ? 'border-ammare-primary shadow-sm bg-ammare-primary/[0.02]' : 'border-ammare-dark/5'
                            }`}
                          >
                            <div className="w-full aspect-[4/3] bg-ammare-light/10 overflow-hidden mb-3 rounded-sm relative">
                              {prod.imageUrl ? (
                                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-ammare-light/20 flex items-center justify-center text-[8px] text-ammare-dark/30">PROD</div>
                              )}
                              <span className="absolute top-1 left-1 bg-ammare-dark/60 text-ammare-white text-[0.45rem] px-1 py-0.5 rounded-sm uppercase tracking-widest font-light scale-75 origin-top-left">
                                {prod.category}
                              </span>
                            </div>
                            
                            <div className="flex-grow min-h-[44px] flex flex-col justify-between mb-3">
                              <h4 className="font-serif text-xs text-ammare-dark line-clamp-2 leading-tight">
                                {prod.name}
                              </h4>
                            </div>

                            <button
                              onClick={() => isAdded ? removeFromCustomKit(prod.id) : addToCustomKit(prod.id)}
                              className={`w-full py-1.5 rounded-sm text-[0.55rem] uppercase tracking-wider font-semibold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                                isAdded 
                                  ? 'bg-ammare-dark text-ammare-white border-transparent hover:bg-black' 
                                  : 'bg-transparent border-ammare-dark/20 text-ammare-dark hover:bg-ammare-dark hover:text-ammare-white hover:border-transparent'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={10} strokeWidth={2.5} /> Adicionado
                                </>
                              ) : (
                                <>
                                  <Plus size={10} strokeWidth={2.5} /> Adicionar
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: AI Visualizer Frame */}
              <div className="w-full lg:w-1/2 flex flex-col order-1 lg:order-2">
                <div className="sticky top-32">
                  <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ammare-dark/50 mb-4 font-semibold">
                    Pré-visualização Digital
                  </h3>
                  
                  <div className="relative aspect-square w-full bg-ammare-white rounded-sm border border-ammare-dark/5 shadow-xl overflow-hidden flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                      {isGeneratingImage ? (
                        <motion.div 
                          key="loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 flex items-center justify-center bg-ammare-white z-20"
                        >
                          <UnboxingLoader />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    
                    {customKitImage ? (
                      <div className="w-full h-full relative group">
                        <motion.img 
                          initial={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          src={customKitImage} 
                          alt="Seu Kit Personalizado" 
                          className="w-full h-full object-cover rounded-sm"
                        />
                        
                        {/* Download Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 rounded-sm">
                          <button
                            onClick={handleDownloadImage}
                            className="bg-ammare-white text-ammare-dark p-3 rounded-full hover:scale-105 hover:bg-ammare-bg transition-all flex items-center justify-center shadow-lg cursor-pointer"
                            title="Baixar Foto do Kit"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </div>
                    ) : !isGeneratingImage && (
                      <div className="text-center p-8 flex flex-col items-center gap-4">
                        <Box className="w-10 h-10 text-ammare-dark/20" strokeWidth={1} />
                        <span className="text-[0.6rem] uppercase tracking-widest text-ammare-dark/40 font-medium">
                          Adicione itens e escolha um tema para gerar a visualização por IA.
                        </span>
                        {selectedItems.length > 0 && (
                          <button
                            onClick={generateCustomKitImage}
                            className="mt-2 px-6 py-3 bg-ammare-dark text-ammare-white hover:bg-black transition-all text-[0.65rem] uppercase tracking-[0.2em] font-semibold rounded-sm shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Sparkles size={12} className="text-ammare-primary animate-pulse" />
                            Gerar Imagem com IA
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar under preview */}
                  {customKitImage && !isGeneratingImage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-col sm:flex-row gap-4"
                    >
                      <button 
                        onClick={generateCustomKitImage}
                        className="flex-1 flex items-center justify-center gap-2 py-4 border border-ammare-dark/20 text-ammare-dark hover:bg-ammare-dark hover:text-ammare-white hover:border-transparent transition-all text-[0.7rem] uppercase tracking-[0.2em] font-semibold rounded-sm cursor-pointer"
                        title="Atualizar Foto com a nova seleção/tema"
                      >
                        <Sparkles className="w-4 h-4 text-ammare-primary" />
                        Regerar Imagem
                      </button>

                      <button 
                        onClick={handleWhatsApp}
                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-ammare-dark text-ammare-white hover:bg-black transition-all text-[0.7rem] uppercase tracking-[0.2em] font-semibold shadow-lg rounded-sm cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Solicitar Orçamento
                      </button>
                      
                      <button 
                        onClick={handleDownloadImage}
                        className="py-4 px-6 border border-ammare-dark/20 text-ammare-dark hover:bg-ammare-dark hover:text-ammare-white hover:border-transparent transition-all text-[0.7rem] uppercase tracking-[0.2em] font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Foto
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
