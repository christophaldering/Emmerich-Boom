import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
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
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center px-12 relative z-10 flex flex-col items-center">
        {phase >= 1 && (
          <motion.div 
            className="mb-8 w-32 h-1 bg-[#ff4500]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        )}
        
        <motion.h1 
          className="text-[12vw] font-display uppercase tracking-tighter text-white leading-[0.8] mb-2 drop-shadow-2xl"
          style={{ textShadow: '0 10px 30px rgba(255, 69, 0, 0.5)' }}
        >
          {'EMMERICH'.split('').map((char, i) => (
            <motion.span key={`e-${i}`} className="inline-block"
              initial={{ opacity: 0, y: 100, rotateX: -90, scale: 0.5 }}
              animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 100, rotateX: -90, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: phase >= 2 ? i * 0.05 : 0 }}>
              {char}
            </motion.span>
          ))}
        </motion.h1>
        
        <motion.h1 
          className="text-[12vw] font-display uppercase tracking-tighter text-[#ffd700] leading-[0.8] drop-shadow-2xl"
        >
          {'BOOMT!'.split('').map((char, i) => (
            <motion.span key={`b-${i}`} className="inline-block"
              initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
              animate={phase >= 3 ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -50, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: phase >= 3 ? i * 0.08 : 0 }}>
              {char}
            </motion.span>
          ))}
        </motion.h1>
      </div>
    </motion.div>
  );
}
