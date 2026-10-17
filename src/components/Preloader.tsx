"use client";
import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Mic, Heart, ArrowRight } from "lucide-react";

interface PreloaderProps {
  onComplete: () => void;
}

const WISH_CARDS = [
  {
    title: "Ngọt ngào & Bất ngờ",
    message: "Một điều ước êm dịu đang tìm đường đến bên bạn. Đừng ngại ước những điều khác biệt!",
    badge: "100% Niềm Vui",
  },
  {
    title: "Vẻ Đẹp Bất Toàn",
    message: "Cuộc sống không cần quá hoàn hảo, như một chiếc bánh wonky cake tràn đầy cá tính và ngọt lịm.",
    badge: "Embracing Imperfection",
  },
  {
    title: "Đánh Thức Cảm Xúc",
    message: "Mỗi chiếc bánh là một khoảnh khắc kỳ diệu. Hãy cắn một miếng và cảm nhận sự ấm áp.",
    badge: "Make a Wish. Take a Bite",
  },
  {
    title: "Phép Màu Nghệ Thuật",
    message: "Hôm nay là ngày tuyệt vời để biến những khát khao nhỏ bé thành hiện thực rực rỡ.",
    badge: "Magician & Creator",
  },
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isExtinguished, setIsExtinguished] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [selectedCard, setSelectedCard] = useState(WISHES_CARDS_DEFAULT());
  const [fadeOut, setFadeOut] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  function WISHES_CARDS_DEFAULT() {
    return WISH_CARDS[0];
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      onComplete();
    }
  }, [onComplete]);

  // Trigger celebration explosion and card reveal
  const extinguishCandle = () => {
    if (isExtinguished) return;
    setIsExtinguished(true);

    // Randomize wish card
    const randomCard = WISH_CARDS[Math.floor(Math.random() * WISH_CARDS.length)];
    setSelectedCard(randomCard);

    // Pastel confetti blast
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#FFAEC9", "#A0C4FF", "#BEE3DB", "#FFF9E6", "#FF3366"],
    });

    // Cleanup mic
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Hold interaction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isExtinguished) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            extinguishCandle();
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else if (!isHolding && !isExtinguished) {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, isExtinguished]);

  // Microphone blow detection
  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkBlow = () => {
        if (isExtinguished) return;
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;

        // Threshold for blowing into mic
        if (avg > 48) {
          extinguishCandle();
        } else {
          requestAnimationFrame(checkBlow);
        }
      };

      requestAnimationFrame(checkBlow);
    } catch {
      setMicActive(false);
    }
  };

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-wishes-cream/95 backdrop-blur-xl transition-all duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Decorative background swirls */}
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-60" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-wishes-pink/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-wishes-blue/30 blur-3xl pointer-events-none" />

      {/* Skip button for fast entry */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full glass-panel border border-wishes-chocolate/15 text-[11px] font-bold text-wishes-chocolate/70 hover:text-wishes-chocolate hover:bg-white/80 transition-all flex items-center gap-1.5"
      >
        <span>Bỏ qua nghi thức</span>
        <ArrowRight className="w-3 h-3 text-wishes-cherry" />
      </button>

      <div className="relative z-10 max-w-md w-full px-6 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-wishes-chocolate/60 font-semibold mb-1">
            FPT Capstone Project • Fall 2026
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate tracking-tight">
            Wishes
          </h1>
          <p className="text-xs text-wishes-chocolate/70 font-medium tracking-wider uppercase mt-1">
            MAKE A WISH. TAKE A BITE
          </p>
        </div>

        {/* 3D Candle Ritual Container */}
        <div className="relative my-4 flex flex-col items-center">
          {/* Flame & Candle graphic */}
          <div className="relative flex flex-col items-center">
            {/* Flame */}
            {!isExtinguished ? (
              <div className="relative w-8 h-10 mb-1 flex items-center justify-center">
                <div className="absolute w-6 h-8 rounded-full bg-gradient-to-t from-yellow-400 via-orange-400 to-red-400 blur-[2px] animate-pulse" />
                <div className="w-3 h-5 rounded-full bg-white blur-[1px] -translate-y-1 animate-bounce" />
                <div className="absolute -inset-4 bg-orange-300/30 rounded-full blur-md" />
              </div>
            ) : (
              <div className="w-8 h-10 mb-1 flex items-center justify-center">
                <div className="w-1.5 h-6 bg-gray-400/50 rounded-full blur-[1px] animate-pulse" />
                <Sparkles className="w-5 h-5 text-wishes-pink animate-spinSlow absolute -top-2" />
              </div>
            )}

            {/* Candle Wick */}
            <div className="w-1 h-3 bg-wishes-chocolate/80" />

            {/* Candle Body */}
            <div className="w-10 h-28 rounded-t-lg bg-gradient-to-b from-wishes-pink via-wishes-pink-soft to-wishes-cream border border-wishes-chocolate/20 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -skew-y-12" />
              <Heart className="w-4 h-4 text-wishes-cherry opacity-40" />
            </div>
          </div>

          {/* Interaction Controls */}
          {!isExtinguished ? (
            <div className="mt-8 flex flex-col items-center gap-3 w-full">
              <p className="text-sm font-medium text-wishes-chocolate">
                Thổi nhẹ vào Micro hoặc nhấn giữ để gửi điều ước
              </p>

              {/* Hold Button with Progress Ring */}
              <button
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                className="relative w-44 py-3 rounded-full candy-btn select-none overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-wishes-cherry/25 transition-all duration-75"
                  style={{ width: `${holdProgress}%` }}
                />
                <span className="relative z-10 text-xs font-bold tracking-wide">
                  {holdProgress > 0 ? `Đang ước... ${holdProgress}%` : "Giữ 1.5s Để Thổi"}
                </span>
              </button>

              {/* Mic activation toggle */}
              {!micActive ? (
                <button
                  onClick={enableMic}
                  className="flex items-center gap-1.5 text-xs text-wishes-chocolate/70 hover:text-wishes-chocolate underline underline-offset-4 mt-1 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-wishes-cherry" />
                  Bật micro để thổi nến thật
                </button>
              ) : (
                <span className="text-xs text-wishes-cherry font-semibold animate-pulse flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5" />
                  Micro đang lắng nghe tiếng thổi...
                </span>
              )}
            </div>
          ) : (
            /* Wish Card Reveal Stage */
            <div className="mt-6 flex flex-col items-center animate-fade-in w-full max-w-sm">
              <div className="p-5 rounded-2xl glass-panel border border-wishes-pink shadow-dreamy text-left w-full mb-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-wishes-mint text-wishes-chocolate mb-2">
                  {selectedCard.badge}
                </span>
                <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate mb-1">
                  {selectedCard.title}
                </h3>
                <p className="text-xs text-wishes-chocolate/80 leading-relaxed font-sans">
                  {selectedCard.message}
                </p>
              </div>

              <button
                onClick={handleEnter}
                className="w-full py-3.5 rounded-full candy-btn flex items-center justify-center gap-2 text-sm font-bold shadow-pastel group"
              >
                <span>Khám Phá Thế Giới Wishes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
