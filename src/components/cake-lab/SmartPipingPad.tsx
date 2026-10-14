import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  PenTool,
  Trash2,
  Sparkles,
  Check,
  Undo2,
  Maximize2,
  Minimize2,
  Wand2,
  Heart,
  Smile,
} from "lucide-react";
import { DrawPoint, DrawStroke, SmartDrawingState, CakeShape, AccessoryItem, TypographyState } from "./types";
import {
  renderPipingToCanvas,
  filterMinDistance,
  beautifyStroke,
  PIPING_STAMPS,
} from "./SmartPipingEngine";

interface SmartPipingPadProps {
  drawingState: SmartDrawingState;
  onUpdateDrawing: (updater: (prev: SmartDrawingState) => SmartDrawingState) => void;
  cakeColor: string;
  cakeSize?: number;
  cakeShape?: CakeShape;
  accessories?: AccessoryItem[];
  typography?: TypographyState;
}

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
  cakeShape = "round",
  accessories = [],
  typography,
}: SmartPipingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawPoint[]>([]);
  const [activeColor, setActiveColor] = useState<string>("#4A2E1B");
  const [activeGauge, setActiveGauge] = useState<number>(2);
  const [autoBeautify, setAutoBeautify] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Canvas aspect ratio based on shape
  const isRect = cakeShape === "rectangle";
  const canvasWidth = isRect ? 440 : 380;
  const canvasHeight = isRect ? 330 : 380;

  // Feasibility meter calculation
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

  const maxCapacity = useMemo(() => {
    return 1.4 + (cakeSize / 16) * 2.6;
  }, [cakeSize]);

  const capacityPct = Math.min(100, Math.round((totalStrokeLength / maxCapacity) * 100));
  const isAtCapacity = capacityPct >= 100;

  // Redraw canvas whenever strokes or text change
  useEffect(() => {
    const redraw = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      renderPipingToCanvas(
        canvas,
        drawingState.strokes,
        drawingState.customText || drawingState.presetText,
        drawingState.textColor,
        true,
        typography
      );
    };

    redraw(canvasRef.current);
    if (isFullscreen) {
      redraw(fullscreenCanvasRef.current);
    }
  }, [drawingState, isFullscreen, typography]);

  // Coordinate normalizer relative to canvas [0, 1]
  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    targetCanvas: HTMLCanvasElement
  ): DrawPoint => {
    const rect = targetCanvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rawX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    if (isRect) {
      return {
        x: Math.max(0.08, Math.min(0.92, rawX)),
        y: Math.max(0.08, Math.min(0.92, rawY)),
      };
    }

    const dx = rawX - 0.5;
    const dy = rawY - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = 0.44;
    if (dist > maxR && dist > 0) {
      return {
        x: 0.5 + (dx / dist) * maxR,
        y: 0.5 + (dy / dist) * maxR,
      };
    }
    return { x: rawX, y: rawY };
  };

  const handleStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    targetCanvas: HTMLCanvasElement
  ) => {
    if (isAtCapacity) return;
    if ("touches" in e) e.preventDefault();
    setIsDrawing(true);
    const pt = getCanvasCoords(e, targetCanvas);
    currentStrokeRef.current = [pt];

    const ctx = targetCanvas.getContext("2d");
    if (ctx) {
      const w = targetCanvas.width;
      const h = targetCanvas.height;
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, activeGauge * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();
    }
  };

  const handleMoveDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    targetCanvas: HTMLCanvasElement
  ) => {
    if (!isDrawing || isAtCapacity) return;
    if ("touches" in e) e.preventDefault();
    const pt = getCanvasCoords(e, targetCanvas);
    const prevPt = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    currentStrokeRef.current.push(pt);

    if (prevPt) {
      const ctx = targetCanvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = activeGauge * 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const w = targetCanvas.width;
        const h = targetCanvas.height;
        ctx.moveTo(prevPt.x * w, prevPt.y * h);
        ctx.lineTo(pt.x * w, pt.y * h);
        ctx.stroke();
      }
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const pts = currentStrokeRef.current;
    if (pts.length >= 1) {
      let finalPoints = pts.length === 1 ? pts : filterMinDistance(pts, 2);

      // AI Auto-beautification
      if (autoBeautify && finalPoints.length >= 6) {
        const result = beautifyStroke(finalPoints);
        finalPoints = result.beautifiedPoints;
        if (result.detectedShape !== "handwriting") {
          const shapeNames: Record<string, string> = {
            heart: "💖 AI đã nắn thành Trái Tim Wonky",
            star: "✨ AI đã nắn thành Ngôi Sao Y2K",
            flower: "🌸 AI đã nắn thành Bông Hoa Kem",
          };
          setAiNotice(shapeNames[result.detectedShape] || "✨ AI đã làm mượt nét kem");
          setTimeout(() => setAiNotice(null), 3000);
        }
      }

      const newStroke: DrawStroke = {
        points: finalPoints,
        color: activeColor,
        gauge: activeGauge,
      };

      onUpdateDrawing((prev) => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
    }
    currentStrokeRef.current = [];
  };

  const handleManualBeautifyAll = () => {
    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: prev.strokes.map((stroke) => {
        if (!stroke.points || stroke.points.length < 5) return stroke;
        const result = beautifyStroke(stroke.points);
        return {
          ...stroke,
          points: result.beautifiedPoints,
        };
      }),
    }));
    setAiNotice("✨ Đã tinh chỉnh toàn bộ nét vẽ thành khối kem mượt mà!");
    setTimeout(() => setAiNotice(null), 3000);
  };

  const handleApplyStamp = (stampId: string) => {
    const stamp = PIPING_STAMPS.find((s) => s.id === stampId);
    if (!stamp) return;

    // Stamp at center with subtle jitter if center already has strokes
    const offset = (drawingState.strokes.length % 4) * 0.05;
    const center: DrawPoint = { x: 0.5 + (offset - 0.08), y: 0.5 + (offset - 0.08) };
    const strokePointArrays = stamp.generateStrokes(center, 0.16);

    const newStrokes: DrawStroke[] = strokePointArrays.map((pts) => ({
      points: pts,
      color: activeColor,
      gauge: activeGauge,
    }));

    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: [...prev.strokes, ...newStrokes],
    }));

    setAiNotice(`Đã đính tem kem "${stamp.name}"!`);
    setTimeout(() => setAiNotice(null), 2500);
  };

  const handleClear = () => {
    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: [],
    }));
  };

  const handleUndo = () => {
    onUpdateDrawing((prev) => ({
      ...prev,
      strokes: prev.strokes.slice(0, -1),
    }));
  };

  // Render canvas frame
  const renderCanvasBody = (isModal: boolean = false) => {
    const activeRef = isModal ? fullscreenCanvasRef : canvasRef;
    return (
      <div
        className={`relative mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-wishes-cherry/40 shadow-inner bg-gradient-to-b from-white/95 to-wishes-pink/15 flex items-center justify-center touch-none select-none transition-all ${
          isModal
            ? isRect
              ? "w-full max-w-[520px] aspect-[4/3]"
              : "w-full max-w-[500px] aspect-square"
            : isRect
            ? "w-full max-w-[440px] aspect-[4/3]"
            : "w-full max-w-[380px] aspect-square"
        }`}
      >
        {/* Silhouette Backdrop Preview */}
        <div
          className={`absolute inset-4 shadow-inner opacity-50 border border-black/10 transition-all ${
            isRect ? "rounded-2xl" : cakeShape === "heart" ? "rounded-3xl" : "rounded-full"
          }`}
          style={{ backgroundColor: cakeColor }}
        />

        {/* Safe Margin Border Guide */}
        <div
          className={`absolute inset-6 border border-dashed border-wishes-cherry/30 pointer-events-none flex items-start justify-center ${
            isRect ? "rounded-xl" : "rounded-full"
          }`}
        >
          <span className="text-[7.5px] font-bold text-wishes-cherry/80 bg-white/90 px-1.5 py-0.5 rounded-full mt-0.5 shadow-2xs">
            Vùng Vẽ An Toàn (Không đè viền Lambeth)
          </span>
        </div>

        {/* Faint Accessories Preview */}
        {accessories.map((acc, i) => {
          const icon =
            acc.type === "cherry"
              ? "🍒"
              : acc.type === "strawberry"
              ? "🍓"
              : acc.type === "blueberry-cluster"
              ? "🫐"
              : acc.type === "satin-bow"
              ? "🎀"
              : acc.type === "crown"
              ? "👑"
              : acc.type === "spiral-candle"
              ? "🕯️"
              : acc.type === "chocolate-bear"
              ? "🧸"
              : acc.type === "macaron"
              ? "🍪"
              : "✨";

          let leftPct = 50;
          let topPct = 50;

          if (acc.layout === "center") {
            leftPct = 50;
            topPct = 50;
          } else if (acc.layout === "corners") {
            const corners = [
              [24, 24],
              [76, 24],
              [24, 76],
              [76, 76],
            ];
            const c = corners[i % 4];
            leftPct = c[0];
            topPct = c[1];
          } else if (acc.layout === "front-arc") {
            leftPct = 50 + (i % 2 === 0 ? -1 : 1) * 22;
            topPct = 76;
          } else if (acc.layout === "ring") {
            const angle = (i / Math.max(1, accessories.length)) * Math.PI * 2;
            leftPct = 50 + Math.cos(angle) * 35;
            topPct = 50 + Math.sin(angle) * 35;
          } else {
            leftPct = 30 + ((i * 37) % 40);
            topPct = 30 + ((i * 47) % 40);
          }

          return (
            <div
              key={acc.id || i}
              className="absolute z-0 pointer-events-none opacity-45 text-base select-none transition-all"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {icon}
            </div>
          );
        })}

        <canvas
          ref={activeRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={(e) => activeRef.current && handleStartDraw(e, activeRef.current)}
          onMouseMove={(e) => activeRef.current && handleMoveDraw(e, activeRef.current)}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={(e) => activeRef.current && handleStartDraw(e, activeRef.current)}
          onTouchMove={(e) => activeRef.current && handleMoveDraw(e, activeRef.current)}
          onTouchEnd={handleEndDraw}
          className="relative z-10 w-full h-full cursor-crosshair touch-none select-none"
        />

        {drawingState.strokes.length === 0 && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-wishes-chocolate/40 text-center px-4">
            <PenTool className="w-6 h-6 mb-1 text-wishes-cherry/50 animate-bounce" />
            <span className="text-[11px] font-bold">Vẽ tự do hoặc bấm Mẫu Tem Bên Dưới</span>
            <span className="text-[9px]">AI sẽ tự động nắn thành hình trái tim, ngôi sao, hoa kem tròn mịn</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Intro Header & Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-wishes-chocolate flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-wishes-cherry" />
            <span>Bút Vẽ Kem Khổ Lớn & AI Tự Làm Đẹp</span>
          </span>
          <p className="text-[11px] text-wishes-chocolate/70">
            Nét vẽ tự động chuyển thành dòng kem 3D nổi khối và nhận diện hình vẽ run tay.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-wishes-chocolate text-xs font-bold border border-wishes-pink/30 shadow-2xs flex items-center gap-1"
            title="Phóng to bảng vẽ toàn màn hình"
          >
            <Maximize2 className="w-3.5 h-3.5 text-wishes-cherry" />
            <span className="text-[10px] hidden sm:inline">Phóng To</span>
          </button>
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

      {/* AI Notification Banner */}
      {aiNotice && (
        <div className="p-2.5 rounded-2xl bg-wishes-cherry/10 border border-wishes-cherry/30 text-wishes-cherry text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Wand2 className="w-4 h-4 animate-spin text-wishes-cherry flex-shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Interactive Drawing Pad Frame */}
      {renderCanvasBody(false)}

      {/* AI Beautifier Controls */}
      <div className="p-3 rounded-2xl bg-white/85 border border-wishes-pink/40 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoBeautify(!autoBeautify)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              autoBeautify
                ? "bg-wishes-cherry text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Tự Nắn Nét: {autoBeautify ? "Bật" : "Tắt"}</span>
          </button>
          <span className="text-[10px] text-stone-500 hidden sm:inline">
            Tự biến nét nguệch ngoạc thành Trái tim / Sao / Hoa
          </span>
        </div>

        <button
          onClick={handleManualBeautifyAll}
          disabled={drawingState.strokes.length === 0}
          className="px-3 py-1.5 rounded-xl bg-wishes-pink/30 hover:bg-wishes-pink/50 text-wishes-cherry text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          <span>✨ Tinh Chỉnh AI</span>
        </button>
      </div>

      {/* 8 One-Click Vector Piping Stamps Carousel */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1.5">
          Mẫu Tem Bắt Kem 1-Chạm (Vector Piping Stamps)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
          {PIPING_STAMPS.map((stamp) => (
            <button
              key={stamp.id}
              onClick={() => handleApplyStamp(stamp.id)}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-wishes-chocolate border border-wishes-pink/30 shadow-2xs flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 active:scale-95"
              title={stamp.name}
            >
              <span className="text-base">{stamp.icon}</span>
              <span className="text-[9px] font-bold truncate w-full text-center">
                {stamp.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
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
          <span>Khuôn {cakeSize}cm ({capacityPct < 75 ? "Mật độ lý tưởng" : "Gần giới hạn diện tích bánh"})</span>
          <span className="font-bold text-wishes-chocolate">
            {capacityPct < 100 ? "✓ 100% Khả thi xưởng bánh" : "⚠️ Cần tiết chế nét chữ"}
          </span>
        </div>
      </div>

      {/* Palette & Gauge Selector */}
      <div className="space-y-3">
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
      </div>

      {/* FULLSCREEN DRAWING STUDIO MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-wishes-pink flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-wishes-chocolate flex items-center gap-2">
                <PenTool className="w-4 h-4 text-wishes-cherry" />
                <span>Xưởng Bút Vẽ Toàn Màn Hình</span>
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {renderCanvasBody(true)}

            {/* Quick Actions in Modal */}
            <div className="flex items-center justify-between w-full pt-2">
              <div className="flex gap-2">
                {PIPING_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => {
                      setActiveColor(col.hex);
                      onUpdateDrawing((prev) => ({ ...prev, textColor: col.hex }));
                    }}
                    className={`w-6 h-6 rounded-full border-2 ${
                      activeColor === col.hex ? "border-wishes-chocolate scale-110" : "border-white"
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-xs font-bold"
                >
                  Hoàn Tác
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="px-4 py-1.5 rounded-xl bg-wishes-cherry text-white text-xs font-bold"
                >
                  Xong & Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
