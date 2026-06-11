import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 3000), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      <div className="text-center px-12 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-[20vw] h-[20vw] rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ffd700] flex items-center justify-center shadow-[0_0_50px_rgba(255,69,0,0.6)]">
            <span className="font-display text-[4vw] text-[#1a0f00] leading-none text-center">
              18.07.<br/>2026
            </span>
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-[10vw] font-display uppercase tracking-tighter text-white leading-[0.8] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          EMMERICH <span className="text-[#ffd700]">BOOMT!</span>
        </motion.h1>
      </div>
    </motion.div>
  );
}
