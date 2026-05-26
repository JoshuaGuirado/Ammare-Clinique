import { motion, AnimatePresence } from 'motion/react';
import { Kit } from '../types';
import { useState } from 'react';
import KitModal from './KitModal';

interface KitCardProps {
  kit: Kit;
}

export default function KitCard({ kit }: KitCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="group flex flex-col cursor-pointer h-full"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-ammare-light/10 mb-6 w-full">
          <img 
            src={kit.imageUrl} 
            alt={kit.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
        </div>
        
        <div className="flex flex-col flex-grow">
          <span className="text-[0.6rem] font-sans tracking-[0.2em] uppercase text-ammare-dark/40 mb-3 block">
            {kit.category}
          </span>
          <h3 className="font-serif text-2xl text-ammare-dark leading-tight mb-2 group-hover:text-black transition-colors duration-300">
            {kit.name}
          </h3>
          <p className="font-sans text-sm text-ammare-dark/60 font-light mb-6 leading-relaxed flex-grow">
            {kit.shortDescription}
          </p>
          
          <div className="mt-auto flex items-center text-ammare-dark/30 group-hover:text-ammare-dark transition-colors duration-500">
             <span className="text-[0.65rem] uppercase tracking-widest mr-3 font-medium">Explorar</span>
             <div className="w-6 group-hover:w-10 h-[1px] bg-current transition-all duration-500 ease-out" />
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
