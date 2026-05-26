import Header from '../components/Header';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import WhatsAppButton from '../components/WhatsAppButton';
import { Aperture } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-ammare-bg">
      <Header />
      <Hero />
      <Catalog />
      
      <footer className="bg-ammare-dark py-24 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <Aperture className="w-8 h-8 text-ammare-white/[0.15] mb-6" strokeWidth={1} />
          <h2 className="font-serif text-2xl tracking-[0.15em] text-ammare-white/90 uppercase mb-3">
            Ammare
          </h2>
          <span className="font-sans text-[0.6rem] tracking-[0.4em] uppercase text-ammare-white/40 mb-16 font-light">
            Clinique
          </span>
          <p className="text-[0.65rem] text-ammare-white/30 font-light text-center tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Ammare. Reservados todos os direitos.
          </p>
        </div>
      </footer>
      
      <WhatsAppButton />
    </div>
  );
}
