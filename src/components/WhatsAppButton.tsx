import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999', '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={handleWhatsApp}
      className="fixed bottom-8 right-8 z-40 bg-ammare-dark text-white p-[1.15rem] shadow-2xl hover:bg-black transition-all duration-300 group flex items-center justify-center overflow-hidden"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-5 h-5 relative z-10" strokeWidth={1.5} />
      <div className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-500 ease-out" />
    </motion.button>
  );
}
