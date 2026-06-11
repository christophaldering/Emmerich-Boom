import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  open: 3500,
  dateLoc: 4200,
  partyVibe: 4000,
  promise: 3500,
  close: 4000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  dateLoc: Scene2,
  partyVibe: Scene3,
  promise: Scene4,
  close: Scene5,
};

const TAPE_POSITIONS = [
  { x: '80vw', y: '-10vh', rotate: 0,   scale: 1   },
  { x: '-20vw', y: '60vh', rotate: 45,  scale: 1.5 },
  { x: '50vw', y: '-20vh', rotate: -30, scale: 0.8 },
  { x: '10vw', y: '70vh',  rotate: 90,  scale: 1.2 },
  { x: '70vw', y: '10vh',  rotate: -15, scale: 1   },
];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];
  const tapePos = TAPE_POSITIONS[sceneIndex] ?? TAPE_POSITIONS[0];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a0f00]">
      {/* Base animated gradient / lights */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/disco-bg.png)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #ff4500, transparent)' }}
          animate={{ x: ['-20vw', '50vw', '-10vw'], y: ['-10vh', '40vh', '-20vh'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }}
          animate={{ x: ['60vw', '-10vw', '40vw'], y: ['50vh', '-10vh', '60vh'], scale: [0.8, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Persistent Retro Tape Asset */}
      <motion.div
        className="absolute z-0 mix-blend-luminosity opacity-40 pointer-events-none"
        style={{ width: '40vw', height: '40vw' }}
        animate={{ x: tapePos.x, y: tapePos.y, rotate: tapePos.rotate, scale: tapePos.scale }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={`${import.meta.env.BASE_URL}images/retro-tape.png`} className="w-full h-full object-contain" alt="" />
      </motion.div>

      {/* Main scenes */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
