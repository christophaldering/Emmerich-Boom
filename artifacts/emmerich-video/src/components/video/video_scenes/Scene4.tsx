import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#1a0f00]"
      initial={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center px-12 relative z-10 w-full flex flex-col items-center justify-center">
        
        <motion.div
           className="w-full flex justify-center space-x-6 mb-8"
           initial={{ opacity: 0, y: 50 }}
           animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {['TANZBAR', 'LAUT', 'KULT'].map((word, i) => (
             <motion.div 
               key={word}
               className="bg-[#ff4500] text-white font-display text-[3vw] px-6 py-2 rounded-full transform"
               animate={{ rotate: i % 2 === 0 ? [0, 5, 0] : [0, -5, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
             >
               {word}
             </motion.div>
          ))}
        </motion.div>
        
        <motion.h2 
          className="text-[9vw] font-display text-white uppercase leading-[0.9] text-center"
          initial={{ opacity: 0, scale: 1.5 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          Sichere dir<br/>jetzt dein <span className="text-[#ffd700]">Ticket!</span>
        </motion.h2>
      </div>
    </motion.div>
  );
}
