"use client";
import React, { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import AudioPlayer from "@/components/AudioPlayer";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import HeroScene from "@/components/HeroScene";
import BrandStory from "@/components/BrandStory";
import CakeLab from "@/components/CakeLab";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import PackagingUnboxing from "@/components/PackagingUnboxing";
import WishingWell from "@/components/WishingWell";
import Colophon from "@/components/Colophon";

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <main className="relative min-h-screen bg-wishes-cream text-wishes-chocolate overflow-x-hidden">
      {/* 1. Dual-Input Candle Blowing Preloader Ritual */}
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      {/* 2. Custom Whimsical Cursor */}
      <CustomCursor />

      {/* 3. Floating Ambient Soundscape Toggle */}
      <AudioPlayer />

      {/* 4. Boutique Awning & Navigation Bar */}
      <Navbar />

      {/* 5. Persistent 3D Floating Cake Hero Section */}
      <HeroScene />

      {/* 6. Brand Story, Market Gap & Core Values */}
      <BrandStory />

      {/* 7. Interactive 3D Cake Customizer Lab (Slide 69) */}
      <CakeLab />

      {/* 8. Capstone Portfolio Exhibition Bento Grid */}
      <ExhibitionGallery />

      {/* 9. 3D Packaging Unboxing & Dieline Engineering Blueprint */}
      <PackagingUnboxing />

      {/* 10. Virtual Wishing Well (Community Ribbon Galaxy) */}
      <WishingWell />

      {/* 11. Colophon & Academic Graduation Credits */}
      <Colophon />
    </main>
  );
}
