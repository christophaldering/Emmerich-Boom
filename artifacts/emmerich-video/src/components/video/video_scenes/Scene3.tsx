import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Wir referenzieren das Poster aus dem parent ordner via url path
const posterUrl = import.meta.env.BASE_URL + '../../emmerich/public/boomerparty-foto.jpeg';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 3200), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[#ff8c00]/90 z-0" />
      
      <div className="relative z-10 flex w-full h-full items-center justify-between px-[10vw]">
        <motion.div 
          className="w-[40%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform -rotate-6"
          initial={{ x: -200, opacity: 0, rotate: -20 }}
          animate={phase >= 1 ? { x: 0, opacity: 1, rotate: -6 } : { x: -200, opacity: 0, rotate: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Fallback falls Bild nicht lädt */}
          <div className="w-full h-full bg-black flex items-center justify-center relative">
             <img src="/emmerich/boomerparty-foto.jpeg" alt="Boomer Party" className="absolute inset-0 w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}images/disco-bg.png` }} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </motion.div>
        
        <div className="w-[50%] flex flex-col items-start">
          <motion.h2 
            className="text-[8vw] font-display text-white leading-[0.9] uppercase drop-shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            Sei <br/><span className="text-[#ffd700]">dabei!</span>
          </motion.h2>
          
          <motion.p 
            className="text-[2vw] font-body text-white mt-6 font-medium leading-tight"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Tolle Leute, geile Musik und<br/>die beste Stimmung in Emmerich.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
