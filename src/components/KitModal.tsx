import { motion } from 'motion/react';
import { Kit } from '../types';
import { X, MessageCircle, Download } from 'lucide-react';
import { useEffect } from 'react';

interface KitModalProps {
  kit: Kit;
  onClose: () => void;
}

export default function KitModal({ kit, onClose }: KitModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Gostaria de conhecer melhor o ${kit.name}.`);
    window.open(`https://wa.me/5544999665711?text=${text}`, '_blank');
  };

  const handleDownloadImage = async () => {
    if (!kit.imageUrl) return;
    try {
      const response = await fetch(kit.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kit.name.replace(/\s+/g, '_').toLowerCase()}_imagem.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      // Se tiver CORS, vai fallbackar pra abrir numa nova guia
      window.open(kit.imageUrl, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ammare-dark/40 backdrop-blur-sm p-0 md:p-6 lg:p-12"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <motion.div
         initial={{ opacity: 0, y: "100%" }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: "100%" }}
         transition={{ duration: 0.4, ease: "easeOut" }}
         className="relative w-full max-w-6xl h-[100dvh] md:h-[85vh] bg-ammare-bg shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-ammare-dark/50 hover:text-ammare-dark transition-colors md:mix-blend-difference md:text-white/70 md:hover:text-white bg-white/20 md:bg-transparent rounded-full backdrop-blur-md md:backdrop-blur-none"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          </button>

          {/* Imagem / Imagens */}
          <div className="relative w-full md:w-[45%] h-[40vh] md:h-full bg-ammare-light/10 shrink-0 group flex flex-col overflow-y-auto no-scrollbar">
              {kit.imageUrl ? (
                <img 
                  src={kit.imageUrl || undefined} 
                  alt={kit.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ammare-dark/30 uppercase text-xs tracking-widest min-h-[40vh]">
                  Sem imagem
                </div>
              )}
              {kit.galleryUrls?.map((url, i) => (
                <img 
                  key={`gallery-${i}`}
                  src={url || undefined} 
                  alt={`${kit.name} galeria ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            
            {kit.imageUrl && (
              <button
                onClick={handleDownloadImage}
                className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-ammare-dark rounded-sm text-[0.65rem] uppercase tracking-widest backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                title="Baixar imagem principal"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
            )}
          </div>

          {/* Conteúdo */}
          <div className="relative w-full md:w-[55%] flex flex-col flex-1 bg-ammare-white overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 md:p-14 lg:p-20">
              <span className="text-[0.65rem] font-sans tracking-[0.2em] uppercase text-ammare-dark/40 mb-6 block">
                {kit.category}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-ammare-dark mb-8 leading-tight">
                {kit.name}
              </h2>
              
              <div className="h-[1px] w-12 bg-ammare-dark/10 mb-8" />
              
              <p className="font-sans text-sm md:text-base text-ammare-dark/70 font-light mb-12 leading-relaxed">
                {kit.fullDescription}
              </p>

              {kit.items && kit.items.length > 0 && (
                <div className="w-full mb-12">
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-6 font-medium">
                    Composição do Kit
                  </h4>
                  <ul className="space-y-4">
                    {kit.items.map((item, i) => (
                      <li key={`${item.id}-${i}`} className="flex items-center text-sm font-light text-ammare-dark/80">
                        <span className="w-4 h-[1px] bg-ammare-dark/20 mr-4" />
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {kit.sizes && kit.sizes.length > 0 && (
                <div className="w-full mb-8">
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-4 font-medium">
                    Opções de Tamanho
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {kit.sizes.map((size, i) => (
                      <span key={`${size}-${i}`} className="px-4 py-2 border border-ammare-dark/10 text-xs text-ammare-dark tracking-wider">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {kit.colors && kit.colors.length > 0 && (
                <div className="w-full mb-12">
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-4 font-medium">
                    Opções de Cor
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {kit.colors.map((color, i) => (
                      <span key={`${color}-${i}`} className="px-4 py-2 border border-ammare-dark/10 text-xs text-ammare-dark tracking-wider">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {kit.observations && (
                <div className="w-full mb-12">
                  <p className="text-xs font-light text-ammare-dark/50 italic leading-relaxed">
                    Nota: {kit.observations}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action Area */}
            <div className="shrink-0 p-6 md:p-10 bg-ammare-white border-t border-ammare-light/20 z-20 shadow-[0_-10px_30px_rgba(255,255,255,0.8)]">
              <button 
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 py-4 bg-ammare-dark text-ammare-white hover:bg-black transition-colors text-[0.7rem] uppercase tracking-[0.2em] font-medium shadow-xl"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar via WhatsApp
              </button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
}
