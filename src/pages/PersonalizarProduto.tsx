import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, MessageCircle, Download, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import LuxuryBackground from '../components/LuxuryBackground';

const PRODUCT_TYPES = [
  { id: 'creme', name: 'Creme Pós-Operatório Regenerador', defaultLabel: 'Ammare Regenerator' },
  { id: 'serum', name: 'Sérum Ultra-Hidratante Calmante', defaultLabel: 'Ammare Serum' },
  { id: 'locao', name: 'Loção Modeladora Corporal Drenante', defaultLabel: 'Ammare Body Lotion' }
];

const BOTTLE_THEMES = [
  { id: 'white', name: 'Branco Minimalista', color: 'bg-white', border: 'border-zinc-300', text: 'text-zinc-700', prompt: 'a clean matte white surface with soft window lighting' },
  { id: 'black', name: 'Preto Matte Luxo', color: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-200', prompt: 'a dramatic dark slate marble surface with premium gold lighting highlights' },
  { id: 'gold', name: 'Ouro Radiante', color: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', prompt: 'a warm gold sand texture under bright high-fashion studio spotlights' }
];

export default function PersonalizarProduto() {
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [theme, setTheme] = useState(BOTTLE_THEMES[0]);
  const [userName, setUserName] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userName.trim()) return;

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const prompt = `A highly professional studio product photography of a premium cosmetic ${productType.id === 'creme' ? 'cream jar' : 'lotion bottle'} with a minimal elegant label that has the text: "${userName.trim()} - Ammare Clinique" beautifully and clearly printed in a sophisticated serif typography on it. The product is arranged elegantly on ${theme.prompt}. Minimalist aesthetic, luxury spa and clinic vibe, soft shadows, 8k resolution.`;

      const response = await fetch('/api/generate-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, images: [] })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl);
      } else {
        console.error("Failed to generate image");
      }
    } catch (e) {
      console.error("Error generating customized product", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!userName.trim()) return;
    const text = encodeURIComponent(`Olá! Personalizei a embalagem de um produto no Ammare Customize Lab com meu nome: "${userName.trim()}". Gostaria de saber mais sobre como encomendar esta embalagem personalizada de ${productType.name} com o tema ${theme.name}!`);
    window.open(`https://wa.me/5544999665711?text=${text}`, '_blank');
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `produto-personalizado-ammare-${userName.replace(/\s+/g, '_').toLowerCase()}.png`;
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

      <div className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-ammare-primary/10 text-ammare-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[0.65rem] uppercase tracking-widest font-semibold">Customize Lab</span>
            </motion.div>
            
            <h1 className="font-serif text-4xl md:text-6xl text-ammare-dark mb-4 leading-[1.1] tracking-tight">
              Sua Identidade Exclusiva
            </h1>
            <p className="font-sans text-sm text-ammare-dark/50 max-w-lg mx-auto font-light leading-relaxed">
              Escreva o seu nome ou uma mensagem e assista à inteligência artificial do Gemini esculpir uma embalagem de luxo personalizada especialmente para você.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12">
            {/* Esquerda: Painel de Customização */}
            <div className="bg-ammare-white/40 backdrop-blur-md border border-ammare-dark/5 p-8 rounded-sm shadow-sm flex flex-col gap-8">
              
              {/* 1. Escolha do Produto */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3 block font-semibold">
                  1. Selecione o Produto
                </label>
                <div className="flex flex-col gap-2">
                  {PRODUCT_TYPES.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => setProductType(prod)}
                      className={`w-full text-left p-4 border rounded-sm text-xs font-light transition-all flex items-center justify-between cursor-pointer ${
                        productType.id === prod.id
                          ? 'border-ammare-primary bg-ammare-white text-ammare-dark font-medium shadow-sm'
                          : 'border-ammare-dark/5 hover:border-ammare-dark/15 text-ammare-dark/70'
                      }`}
                    >
                      <span>{prod.name}</span>
                      {productType.id === prod.id && <Sparkles size={12} className="text-ammare-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Escolha do Tema */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3 block font-semibold">
                  2. Escolha o Estilo de Frasco
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {BOTTLE_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t)}
                      className={`p-4 border rounded-sm text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        theme.id === t.id
                          ? 'border-ammare-primary bg-ammare-white shadow-sm'
                          : 'border-ammare-dark/5 hover:border-ammare-dark/15'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border border-black/10 ${t.color}`} />
                      <span className={`text-[0.55rem] uppercase tracking-wider font-medium ${t.text}`}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Escrita do Rótulo */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3 block font-semibold">
                  3. Escreva no Rótulo (Seu Nome/Frase)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="EX: DR. JOSHUA / CLÍNICA MARI"
                  className="w-full bg-ammare-white border border-ammare-dark/10 rounded-sm px-4 py-3 text-xs uppercase tracking-widest text-ammare-dark focus:outline-none focus:border-ammare-primary focus:ring-1 focus:ring-ammare-primary font-medium"
                />
              </div>

              {/* Botão de Ação */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !userName.trim()}
                className={`w-full py-4 text-[0.65rem] uppercase tracking-[0.25em] font-semibold rounded-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || !userName.trim()
                    ? 'bg-ammare-dark/20 text-ammare-dark/40 border border-transparent pointer-events-none'
                    : 'bg-ammare-dark text-ammare-white hover:bg-black'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-ammare-primary" />
                    <span>Gerando Imagem 3D...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Minha Embalagem</span>
                    <ArrowRight size={12} />
                  </>
                )}
              </button>

            </div>

            {/* Direita: Resultado 3D */}
            <div className="flex flex-col gap-6">
              <div className="relative aspect-square w-full bg-ammare-white rounded-sm border border-ammare-dark/5 shadow-xl overflow-hidden flex items-center justify-center p-4">
                
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-ammare-white z-20 text-center p-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 relative mb-6 flex items-center justify-center bg-ammare-primary/10 rounded-full border border-ammare-primary/20"
                    >
                      <Sparkles className="w-8 h-8 text-ammare-primary animate-spin" style={{ animationDuration: '4s' }} />
                    </motion.div>
                    <span className="text-[0.65rem] uppercase tracking-[0.25em] text-ammare-primary font-semibold animate-pulse">
                      IA Gemini em Ação...
                    </span>
                    <span className="text-[0.55rem] text-ammare-dark/40 uppercase tracking-widest mt-2">
                      Imprimindo "{userName}" na sua embalagem de luxo
                    </span>
                  </div>
                )}

                {generatedImage ? (
                  <div className="relative w-full h-full group rounded-sm overflow-hidden">
                    <img
                      src={generatedImage}
                      alt="Produto Personalizado"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 rounded-sm">
                      <button
                        onClick={handleDownload}
                        className="bg-ammare-white text-ammare-dark p-3 rounded-full hover:scale-105 hover:bg-ammare-bg transition-all flex items-center justify-center shadow-lg cursor-pointer"
                        title="Baixar imagem 3D"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  !isLoading && (
                    <div className="text-center p-8 flex flex-col items-center max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-ammare-light/10 border border-ammare-dark/5 flex items-center justify-center mb-6">
                        <Sparkles className="w-6 h-6 text-ammare-dark/20" />
                      </div>
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-ammare-dark mb-2">
                        Prévia da Embalagem
                      </span>
                      <span className="text-[0.55rem] text-ammare-dark/40 uppercase tracking-wider leading-relaxed">
                        Preencha seu nome e clique em "Criar Minha Embalagem" para iniciar a renderização 3D da sua marca.
                      </span>
                    </div>
                  )
                )}

              </div>

              {generatedImage && (
                <div className="flex gap-4">
                  <button
                    onClick={handleWhatsApp}
                    className="flex-grow flex items-center justify-center gap-3 py-4 bg-ammare-dark text-ammare-white hover:bg-black transition-all text-[0.7rem] uppercase tracking-[0.2em] font-semibold shadow-lg rounded-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Encomendar Frasco Customizado
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
