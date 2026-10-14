"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play gentle ambient chime note (pentatonic pastel scale)
  const playChimeNote = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== "running") return;
    const ctx = audioCtxRef.current;

    // Frequencies in C Major Pentatonic (Dreamy harp / wind chime)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.6);
  };

  const toggleSound = async () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    if (!isPlaying) {
      setIsPlaying(true);
      playChimeNote();
      intervalRef.current = setInterval(() => {
        if (Math.random() > 0.3) {
          playChimeNote();
        }
      }, 1800);
    } else {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      aria-label="Toggle ambient lofi sound"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel border border-wishes-pink/60 text-wishes-chocolate text-xs font-semibold shadow-pastel hover:scale-105 active:scale-95 transition-all group"
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 text-wishes-cherry animate-pulse" />
          <span className="hidden sm:inline">Lofi Chimes: Bật</span>
          <Sparkles className="w-3 h-3 text-wishes-pink animate-spinSlow" />
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-wishes-chocolate/60 group-hover:text-wishes-chocolate" />
          <span className="hidden sm:inline">Âm thanh: Tắt</span>
        </>
      )}
    </button>
  );
}
