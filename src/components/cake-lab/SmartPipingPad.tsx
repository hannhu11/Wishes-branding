import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  PenTool,
  RotateCcw,
  Trash2,
  Sparkles,
  Type,
  Check,
  Undo2,
  Smile,
} from "lucide-react";
import { DrawPoint, DrawStroke, SmartDrawingState } from "./types";
import { renderPipingToCanvas, filterMinDistance } from "./SmartPipingEngine";

interface SmartPipingPadProps {
  drawingState: SmartDrawingState;
  onUpdateDrawing: (updater: (prev: SmartDrawingState) => SmartDrawingState) => void;
  cakeColor: string;
  cakeSize?: number;
}

const PRESET_CALLIGRAPHY = [
  "Happy Birthday",
  "Make a Wish",
  "Forever Sweet",
  "Wishes 1926",
  "Je t'aime",
  "Sweet 20",
];

const PIPING_COLORS = [
  { name: "Dark Cacao", hex: "#4A2E1B" },
  { name: "Ruby Cherry", hex: "#FF3366" },
  { name: "Pure Vanilla Cream", hex: "#FFFDF5" },
  { name: "Royal Gold", hex: "#DAA520" },
  { name: "Baby Sky Blue", hex: "#A0C4FF" },
  { name: "Matcha Mist", hex: "#587E4C" },
];

export default function SmartPipingPad({
  drawingState,
  onUpdateDrawing,
  cakeColor,
  cakeSize = 16,
}: SmartPipingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [activeColor, setActiveColor] = useState<string>("#4A2E1B");
  const [activeGauge, setActiveGauge] = useState<number>(2);

  // Compute total drawn length for Baker Feasibility Meter
  const totalStrokeLength = useMemo(() => {
    return drawingState.strokes.reduce((acc, stroke) => {
      if (!stroke.points || stroke.points.length < 2) return acc + 0.02;
      let len = 0;
      for (let i = 1; i < stroke.points.length; i++) {
        const dx = stroke.points[i].x - stroke.points[i - 1].x;
        const dy = stroke.points[i].y - stroke.points[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return acc + len;
    }, 0);
  }, [drawingState.strokes]);

  // Max piping ink capacity proportional to cake diameter (10cm = 1.8 units, 16cm = 3.5, 24cm = 6.0)
  const maxCapacity = useMemo(() => {
    return 1.2 + (cakeSize / 16) * 2.3;
  }, [cakeSize]);

  const capacityPct = Math.min(100, Math.round((totalStrokeLength / maxCapacity) * 100));
  const isAtCapacity = capacityPct >= 100;

  // Redraw canvas whenever strokes, text, or color changes
  useEffect(() => {
    if (!canvasRef.current) return;
    renderPipingToCanvas(
      canvasRef.current,
      drawingState.strokes,
      drawingState.customText || drawingState.presetText,
      drawingState.textColor
    );
  }, [drawingState]);

  // Coordinate normalizer relative to canvas [0, 1] with Soft Safe Zone Clamping (82% diameter)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): DrawPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rawX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Clamp within 82% safe boundary (radius 0.41 from center 0.5, 0.5)
    const dx = rawX - 0.5;
    const dy = rawY - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = 0.41;
    if (dist > maxR && dist > 0) {
      return {
        x: 0.5 + (dx / dist) * maxR,
        y: 0.5 + (dy / dist) * maxR,
      };
    }
    return { x: rawX, y: rawY };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isAtCapacity) return;
    if ("touches" in e) {
      e.preventDefault();
    }
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    setCurrentStroke([pt]);

    // Live feedback dot on start
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, activeGauge * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.fill();
      }
    }
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAtCapacity) return;
    if ("touches" in e) {
      e.preventDefault();
    }
    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => [...prev, pt]);

    // Live feedback drawing
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = activeGauge * 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        const last = currentStroke[currentStroke.length - 1];
        if (last) {
          ctx.moveTo(last.x * w, last.y * h);
          ctx.lineTo(pt.x * w, pt.y * h);
          ctx.stroke();
        }
      }
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length >= 1) {
      const filtered =
        currentStroke.length === 1 ? currentStroke : filterMinDistance(currentStroke, 2);
      const newStroke: DrawStroke = {
        points: filtered,
        color: activeColor,
        gauge: activeGauge,
      };

      onUpdateDrawing((prev) => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: [],
      presetText: "",
      customText: "",
    }));
  };

  const handleUndo = () => {
    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: prev.strokes.slice(0, -1),
    }));
  };

  const handleSelectPresetText = (txt: string) => {
    onUpdateDrawing((prev) => ({
      ...prev,
      presetText: prev.presetText === txt ? "" : txt,
      customText: "",
    }));
  };

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-wishes-chocolate flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-wishes-cherry" />
            <span>Bút Vẽ Kem Thông Minh (Smart Piping Canvas)</span>
          </span>
          <p className="text-[11px] text-wishes-chocolate/70">
            Tự động làm mượt nét run tay (Catmull-Rom & Chaikin Spline) thành dòng kem tròn mịn nổi khối 3D.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={drawingState.strokes.length === 0}
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-wishes-chocolate text-xs font-bold border border-wishes-pink/30 disabled:opacity-40"
            title="Hoàn tác nét vẽ"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-rose-600 text-xs font-bold border border-rose-200"
            title="Xóa toàn bộ nét vẽ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Drawing Pad */}
      <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-wishes-cherry/40 shadow-inner bg-gradient-to-b from-white/90 to-wishes-pink/10 flex items-center justify-center touch-none select-none">
        {/* Simulated Cake Top Disc Background */}
        <div
          className="absolute inset-4 rounded-full shadow-inner opacity-60 border border-black/10 transition-colors"
          style={{ backgroundColor: cakeColor }}
        />

        {/* Safe Piping Zone Boundary Guide (82% of diameter) */}
        <div className="absolute inset-7 rounded-full border border-dashed border-wishes-cherry/40 pointer-events-none flex items-start justify-center">
          <span className="text-[7.5px] font-bold text-wishes-cherry/80 bg-white/85 px-1.5 py-0.5 rounded-full mt-0.5 shadow-2xs">
            Vùng an toàn (Không chạm viền Lambeth)
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          onMouseDown={handleStartDraw}
          onMouseMove={handleMoveDraw}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleMoveDraw}
          onTouchEnd={handleEndDraw}
          className="relative z-10 w-full h-full cursor-crosshair touch-none select-none"
        />

        {drawingState.strokes.length === 0 && !drawingState.presetText && !drawingState.customText && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-wishes-chocolate/40 text-center px-4">
            <PenTool className="w-6 h-6 mb-1 text-wishes-cherry/50 animate-bounce" />
            <span className="text-[11px] font-bold">Chạm hoặc kéo chuột để vẽ lên mặt bánh</span>
            <span className="text-[9px]">Hệ thống sẽ tự động uốn lượn nét vẽ mượt mà</span>
          </div>
        )}
      </div>

      {/* Baker Feasibility Ink Meter */}
      <div className="p-3 rounded-2xl bg-white/85 border border-wishes-pink/40 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-wishes-chocolate flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-wishes-cherry" />
            <span>Dung Lượng Kem Viết Chữ (Feasibility Meter):</span>
          </span>
          <span
            className={
              capacityPct >= 100
                ? "text-rose-600 font-black animate-pulse"
                : capacityPct > 75
                ? "text-amber-700 font-bold"
                : "text-emerald-700 font-bold"
            }
          >
            {capacityPct}% / 100% {capacityPct >= 100 && "(Đầy)"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden border border-black/5">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              capacityPct >= 100
                ? "bg-rose-500"
                : capacityPct > 75
                ? "bg-amber-400"
                : "bg-emerald-500"
            }`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-stone-500">
          <span>
            Khuôn {cakeSize}cm ({capacityPct < 75 ? "Mật độ lý tưởng đui 2mm" : "Gần giới hạn diện tích bánh"})
          </span>
          <span className="font-bold text-wishes-chocolate">
            {capacityPct < 100 ? "✓ 100% Khả thi xưởng bánh" : "⚠️ Cần tiết chế nét chữ"}
          </span>
        </div>
      </div>

      {/* Palette & Gauge Selector */}
      <div className="space-y-3">
        {/* Icing Piping Color Palette */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1.5">
            Màu Kem Bắt Chữ (Piping Icing Color)
          </label>
          <div className="flex gap-2">
            {PIPING_COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() => {
                  setActiveColor(col.hex);
                  onUpdateDrawing((prev) => ({ ...prev, textColor: col.hex }));
                }}
                className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                  activeColor === col.hex ? "border-wishes-chocolate scale-110 shadow-sm" : "border-white"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {activeColor === col.hex && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Piping Tip Gauge */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1.5">
            Cỡ Đui Kem Vẽ (Tip Gauge)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, label: "Mảnh (#1)" },
              { id: 2, label: "Vừa (#2)" },
              { id: 3, label: "Dày (#3)" },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGauge(g.id);
                  onUpdateDrawing((prev) => ({ ...prev, tipGauge: g.id }));
                }}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeGauge === g.id
                    ? "bg-wishes-chocolate text-white border-wishes-chocolate shadow-sm"
                    : "bg-white/80 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Calligraphy Phrases */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1.5">
            Mẫu Chữ Nghệ Thuật Calligraphy Có Sẵn
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CALLIGRAPHY.map((phrase) => {
              const isSelected = drawingState.presetText === phrase;
              return (
                <button
                  key={phrase}
                  onClick={() => handleSelectPresetText(phrase)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-serif italic transition-all border ${
                    isSelected
                      ? "bg-wishes-cherry text-white border-wishes-cherry shadow-sm"
                      : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                  }`}
                >
                  "{phrase}"
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Text Input */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1.5">
            Hoặc Tự Gõ Chữ Tùy Biến
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ví dụ: Happy 18th Mai! / Love You..."
              value={drawingState.customText}
              onChange={(e) =>
                onUpdateDrawing((prev) => ({
                  ...prev,
                  customText: e.target.value,
                  presetText: "",
                }))
              }
              className="w-full text-xs px-3 py-2 pr-8 rounded-xl border border-wishes-pink/50 bg-white/80 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-serif italic"
            />
            <Type className="w-3.5 h-3.5 text-wishes-chocolate/40 absolute right-3 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
