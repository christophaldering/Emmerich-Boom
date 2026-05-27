import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const SRC = `${BASE}/audio/emmerich-boomt.mp3`;

interface HymneAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  hasStarted: boolean;
}

const HymneAudioContext = createContext<HymneAudioState | null>(null);

export function HymneAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setHasStarted(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setHasStarted(true);
    } else {
      audioRef.current.pause();
    }
  }, []);

  const seek = useCallback((t: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  return (
    <HymneAudioContext.Provider value={{ isPlaying, currentTime, duration, play, pause, toggle, seek, hasStarted }}>
      {children}
    </HymneAudioContext.Provider>
  );
}

export function useHymneAudio(): HymneAudioState {
  const ctx = useContext(HymneAudioContext);
  if (!ctx) throw new Error("useHymneAudio must be used within HymneAudioProvider");
  return ctx;
}
