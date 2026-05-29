import Header from '../components/Header';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import WhatsAppButton from '../components/WhatsAppButton';
import { Aperture } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function Home() {
  const [searchParams] = useSearchParams();
  const isExclusive = searchParams.has('items') || searchParams.get('theme') === 'exclusive';

  useEffect(() => {
    if (isExclusive) {
      document.body.style.backgroundColor = '#212322'; // ammare-dark when in exclusive
    } else {
      document.body.style.backgroundColor = ''; // revert to CSS variable
    }
    
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isExclusive]);

  return (
    <div className={`min-h-screen flex flex-col ${isExclusive ? 'bg-ammare-dark' : 'bg-ammare-bg'}`}>
      <Header />
      {!isExclusive && <Hero />}
      
      <main className={`flex-grow flex flex-col ${isExclusive ? 'bg-ammare-dark' : 'bg-ammare-bg'}`}>
        <Catalog />
      </main>
      
      <footer className="bg-ammare-dark py-24 pb-12">
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
