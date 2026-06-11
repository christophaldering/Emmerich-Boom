import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3600), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ x: '100%', skewX: -10 }}
      animate={{ x: 0, skewX: 0 }}
      exit={{ x: '-100%', skewX: 10 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[#ff4500]/80 mix-blend-multiply" />
      
      <div className="text-center px-12 relative z-10 w-full">
        <motion.div 
          className="text-[4vw] font-body font-bold text-white mb-6 tracking-widest uppercase"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Die legendäre BoomerParty
        </motion.div>
        
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            className="bg-white text-[#1a0f00] px-12 py-6 rounded-2xl shadow-2xl mb-8 transform -rotate-2"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1, rotate: -2 } : { opacity: 0, scale: 0.8, rotate: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h2 className="text-[7vw] font-display leading-none">18. JULI 2026</h2>
          </motion.div>
          
          <motion.div
            className="bg-[#1a0f00] text-[#ffd700] px-10 py-4 rounded-xl shadow-2xl transform rotate-1"
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={phase >= 3 ? { opacity: 1, scale: 1, rotate: 1 } : { opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h3 className="text-[4vw] font-display leading-none">BÖLT / KAPAUNENBERG</h3>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
