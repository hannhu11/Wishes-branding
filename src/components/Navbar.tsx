"use client";
import React, { useState } from "react";
import { Sparkles, Menu, X, Cake } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Về Wishes", href: "#story" },
    { label: "Triết Lý", href: "#philosophy" },
    { label: "3D Cake Lab", href: "#cake-lab" },
    { label: "Triển Lãm Đồ Án", href: "#gallery" },
    { label: "Bao Bì 3D", href: "#packaging" },
    { label: "Điều Ước", href: "#wishing-well" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Marquee ticker header (Recreating Slide 69) */}
      <div className="w-full bg-wishes-pink text-wishes-chocolate text-[11px] font-semibold py-1 px-4 overflow-hidden whitespace-nowrap border-b border-wishes-chocolate/10 shadow-sm flex items-center justify-between">
        <div className="animate-marquee inline-block">
          <span>✨ MAKE A WISH. TAKE A BITE ✨ ĐỒ ÁN TỐT NGHIỆP THIẾT KẾ MỸ THUẬT SỐ • FPT FALL 2026 • GFA26GD60 • PHUONGNHT8 ✨ BOUTIQUE PASTRY EXPERIENCE</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase font-bold text-wishes-chocolate/80">
          <Sparkles className="w-3 h-3 text-wishes-cherry" />
          <span>Surreal Sweetcore</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
        <div className="flex items-center justify-between h-14 px-5 rounded-full glass-panel shadow-pastel border border-white/60">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl font-serif-swash font-bold text-wishes-chocolate group-hover:text-wishes-cherry transition-colors">
              Wishes
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-wishes-mint/70 text-wishes-chocolate font-bold uppercase tracking-wider hidden sm:inline-block">
              Boutique
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-wishes-chocolate/85">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-wishes-cherry transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-wishes-cherry hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#cake-lab"
              className="px-4 py-2 rounded-full candy-btn text-xs font-bold flex items-center gap-1.5 shadow-pastel hover:scale-105 active:scale-95 transition-transform"
            >
              <Cake className="w-3.5 h-3.5 text-wishes-cherry" />
              <span>Tạo Bánh 3D</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/50 text-wishes-chocolate"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl glass-panel shadow-dreamy border border-white/80 flex flex-col gap-3 text-sm font-semibold text-wishes-chocolate animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cake-lab"
              onClick={() => setMobileOpen(false)}
              className="mt-2 py-2.5 rounded-full candy-btn text-center text-xs font-bold"
            >
              Tạo Bánh 3D Ngay
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
