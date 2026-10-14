"use client";
import React from "react";
import { Heart, Sparkles, GraduationCap, ShieldCheck } from "lucide-react";

export default function Colophon() {
  return (
    <footer className="w-full bg-wishes-chocolate text-wishes-cream py-16 px-6 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-wishes-pink via-wishes-blue to-wishes-mint" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Brand & Tagline (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <span className="text-3xl font-serif-swash font-bold text-white tracking-tight">
            Wishes
          </span>
          <p className="text-xs uppercase font-display-bubbly tracking-widest text-wishes-pink">
            MAKE A WISH. TAKE A BITE.
          </p>
          <p className="text-xs text-wishes-cream/70 leading-relaxed font-sans max-w-sm mt-2">
            Đồ án tốt nghiệp chuyên ngành Thiết kế Mỹ thuật Số (Digital Art & Design). Hệ thống nhận diện thương hiệu và giải pháp trải nghiệm số hóa cho tiệm bánh ngọt nghệ thuật boutique.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-wishes-cream/50 mt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Xác thực tiêu chuẩn hồ sơ đồ án FPT Fall 2026</span>
          </div>
        </div>

        {/* Academic Details (4 Cols) */}
        <div className="md:col-span-4 flex flex-col gap-2.5 text-xs font-sans">
          <div className="flex items-center gap-2 text-wishes-pink font-bold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Thông Tin Đồ Án Tốt Nghiệp</span>
          </div>
          <div className="text-wishes-cream/80">
            <span className="text-wishes-cream/50 block text-[10px] uppercase">Sinh viên thực hiện:</span>
            <strong className="text-white text-sm">Nguyễn Hồng Thu Phương</strong> (MSSV / Code: <code className="text-wishes-mint font-mono">PHUONGNHT8</code>)
          </div>
          <div className="text-wishes-cream/80">
            <span className="text-wishes-cream/50 block text-[10px] uppercase">Chuyên ngành:</span>
            <span>Thiết Kế Mỹ Thuật Số / Graphic Design — FPT University</span>
          </div>
          <div className="text-wishes-cream/80">
            <span className="text-wishes-cream/50 block text-[10px] uppercase">Mã đề tài & Kì bảo vệ:</span>
            <span className="font-mono text-wishes-blue">GFA26GD60 • FALL 2026</span>
          </div>
        </div>

        {/* Deliverables Map (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-2 text-xs font-sans">
          <span className="text-wishes-pink font-bold text-xs uppercase tracking-wider mb-1">
            Phân Hệ Báo Cáo
          </span>
          <ul className="flex flex-col gap-1.5 text-wishes-cream/75">
            <li>• Brand Identity & Logo System</li>
            <li>• Concept Art & Surreal Photography</li>
            <li>• 3D Interactive Web Experience</li>
            <li>• Packaging & Dieline Engineering</li>
            <li>• Pop-up Store & Merchandise</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-wishes-cream/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-wishes-cream/50 gap-4">
        <span>© 2026 Wishes Pastry Showcase. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          Designed with <Heart className="w-3.5 h-3.5 text-wishes-cherry fill-wishes-cherry inline" /> for FPT Capstone Project
        </span>
      </div>
    </footer>
  );
}
