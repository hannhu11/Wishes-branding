import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, BookOpen, Check, ArrowRight, Tag } from "lucide-react";
import { ProposalPreset, PROPOSAL_PRESETS } from "./types";

interface PresetsDrawerProps {
  activePresetId?: string;
  onSelectPreset: (preset: ProposalPreset) => void;
}

export default function ProposalPresetsDrawer({
  activePresetId,
  onSelectPreset,
}: PresetsDrawerProps) {
  const [filterCategory, setFilterCategory] = useState<"all" | "celebration" | "daily">("all");

  const filteredPresets = PROPOSAL_PRESETS.filter(
    (p) => filterCategory === "all" || p.category === filterCategory
  );

  return (
    <div className="space-y-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-wishes-cherry" />
          <span className="text-xs font-bold text-wishes-chocolate">
            Thư Viện Mẫu Bánh Đề Cương Proposal (Slide 58 – 64)
          </span>
        </div>

        <div className="flex gap-1 bg-white/70 p-1 rounded-xl border border-wishes-pink/30 self-start sm:self-auto">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterCategory === "all"
                ? "bg-wishes-chocolate text-white shadow-xs"
                : "text-wishes-chocolate/70 hover:bg-white"
            }`}
          >
            Tất cả (8)
          </button>
          <button
            onClick={() => setFilterCategory("celebration")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterCategory === "celebration"
                ? "bg-wishes-cherry text-white shadow-xs"
                : "text-wishes-chocolate/70 hover:bg-white"
            }`}
          >
            🎂 Celebration (4)
          </button>
          <button
            onClick={() => setFilterCategory("daily")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterCategory === "daily"
                ? "bg-amber-800 text-white shadow-xs"
                : "text-wishes-chocolate/70 hover:bg-white"
            }`}
          >
            🥐 Daily Baked (4)
          </button>
        </div>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative p-3 rounded-2xl cursor-pointer transition-all border text-left flex gap-3 ${
                isSelected
                  ? "bg-white border-2 border-wishes-cherry shadow-md scale-[1.01]"
                  : "bg-white/75 hover:bg-white border-white/80 hover:border-wishes-pink shadow-sm"
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-wishes-cream flex-shrink-0 border border-black/5">
                <Image
                  src={preset.image}
                  alt={preset.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-[8px] font-bold text-amber-300">
                  {preset.slide}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-wishes-chocolate truncate group-hover:text-wishes-cherry transition-colors">
                      {preset.title}
                    </h5>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-wishes-cherry text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-wishes-chocolate/70 truncate">{preset.subtitle}</p>
                  <p className="text-[9px] text-wishes-chocolate/60 line-clamp-2 mt-1">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-2 pt-1 border-t border-wishes-chocolate/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-wishes-cherry">{preset.price}</span>
                  <span className="text-[9px] font-bold text-wishes-chocolate/80 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Chọn mẫu</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
