"use client";
import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on fine pointer devices (desktop mouse)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("[data-cursor='pointer']")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`rounded-full border border-wishes-pink transition-all duration-300 ${
          isHovering
            ? "w-12 h-12 bg-wishes-pink/30 scale-125 border-wishes-cherry shadow-pastel"
            : "w-6 h-6 bg-wishes-blue/20 scale-100"
        }`}
      />
      {isHovering && (
        <span className="absolute -top-3 left-6 text-[9px] font-bold text-wishes-cherry whitespace-nowrap animate-pulse">
          Bite! ✨
        </span>
      )}
    </div>
  );
}
