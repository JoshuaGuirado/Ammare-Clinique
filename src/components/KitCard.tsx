import { motion, AnimatePresence } from 'motion/react';
import { Kit } from '../types';
import { useState } from 'react';
import KitModal from './KitModal';
import { useAppContext } from '../store';

interface KitCardProps {
  kit: Kit;
  isExclusive?: boolean;
}

export default function KitCard({ kit, isExclusive = false }: KitCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { customKitSelectedIds, addToCustomKit } = useAppContext();

  return (
    <>
      <div
        className="group flex flex-col cursor-pointer h-full"
        onClick={() => setIsModalOpen(true)}
      >
        <div className={`relative aspect-[3/4] overflow-hidden mb-6 w-full ${isExclusive ? 'bg-ammare-white/5' : 'bg-ammare-light/10'}`}>
          <img 
            src={kit.imageUrl || undefined} 
            alt={kit.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
        </div>
        
        <div className="flex flex-col flex-grow">
          <span className={`text-[0.6rem] font-sans tracking-[0.2em] uppercase mb-3 block ${isExclusive ? 'text-ammare-white/40' : 'text-ammare-dark/40'}`}>
            {kit.category}
          </span>
          <h3 className={`font-serif text-2xl leading-tight mb-2 transition-colors duration-300 ${isExclusive ? 'text-ammare-white group-hover:text-ammare-light' : 'text-ammare-dark group-hover:text-black'}`}>
            {kit.name}
          </h3>
          <p className={`font-sans text-sm font-light mb-6 leading-relaxed flex-grow ${isExclusive ? 'text-ammare-white/60' : 'text-ammare-dark/60'}`}>
            {kit.shortDescription}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <div className={`flex items-center transition-colors duration-500 ${isExclusive ? 'text-ammare-white/30 group-hover:text-ammare-white' : 'text-ammare-dark/30 group-hover:text-ammare-dark'}`}>
               <span className="text-[0.65rem] uppercase tracking-widest mr-2 sm:mr-3 font-medium">Explorar</span>
               <div className="w-4 sm:w-6 group-hover:w-8 sm:group-hover:w-10 h-[1px] bg-current transition-all duration-500 ease-out" />
            </div>
            
            {kit.isIndividual && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent modal opening
                  addToCustomKit(kit.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-sm text-[0.6rem] uppercase tracking-widest font-medium transition-all duration-300
                  ${customKitSelectedIds.includes(kit.id)
                    ? 'border-transparent bg-ammare-dark text-ammare-white'
                    : isExclusive
                      ? 'border-ammare-white/20 text-ammare-white hover:bg-ammare-white hover:text-ammare-dark'
                      : 'border-ammare-dark/20 text-ammare-dark hover:bg-ammare-dark hover:text-ammare-white'
                  }
                `}
              >
                <span>{customKitSelectedIds.includes(kit.id) ? 'Adicionado' : 'Adicionar ao Kit'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <KitModal key="modal" kit={kit} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
