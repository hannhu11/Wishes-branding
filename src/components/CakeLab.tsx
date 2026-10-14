"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  Sparkles,
  Heart,
  Circle,
  Download,
  Receipt,
  Scissors,
  Check,
  FileText,
  Thermometer,
  Layers as LayersIcon,
  Ruler,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Compass,
  Award,
  PenTool,
  ChefHat,
  Palette,
  Cake,
  Boxes,
  ShieldAlert,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  ToppingConfig,
  SmartDrawingState,
  ProposalPreset,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
  FROSTING_PALETTE,
  PIPING_STYLES,
} from "./cake-lab/types";
import Cake3DScene from "./cake-lab/Cake3DScene";
import SmartPipingPad from "./cake-lab/SmartPipingPad";
import ProposalPresetsDrawer from "./cake-lab/ProposalPresetsDrawer";
import BakingBlueprintModal from "./cake-lab/BakingBlueprintModal";

/**
 * Live Estimated Pricing and Serving Capacity aligned with Proposal (Slides 59-64)
 */
export function getCakePricing(shape: CakeShape, size: number, portion: number = 1) {
  if (shape === "cinnamon-roll") {
    const unit = 55000;
    const total = portion === 1 ? unit : portion === 3 ? 150000 : 280000;
    const serving =
      portion === 1
        ? "1 người • Khẩu phần sáng"
        : portion === 3
        ? "2-3 người • Set 3 Bánh quế"
        : "4-6 người • Hộp tiệc 6 bánh";
    return { price: `${total.toLocaleString("vi-VN")} VNĐ`, priceNum: total, serving };
  }
  if (shape === "croissant") {
    const unit = 45000;
    const total = portion === 1 ? unit : portion === 3 ? 125000 : 235000;
    const serving =
      portion === 1
        ? "1 người • Bơ Pháp 81 lớp"
        : portion === 3
        ? "2-3 người • Set 3 Croissant"
        : "4-6 người • Hộp tiệc 6 bánh";
    return { price: `${total.toLocaleString("vi-VN")} VNĐ`, priceNum: total, serving };
  }
  if (shape === "egg-tart") {
    const unit = 35000;
    const total = portion === 1 ? unit : portion === 3 ? 95000 : 180000;
    const serving =
      portion === 1
        ? "1 người • Custard Bồ Đào Nha"
        : portion === 3
        ? "2-3 người • Set 3 Tart trứng"
        : "4-6 người • Hộp tiệc 6 bánh";
    return { price: `${total.toLocaleString("vi-VN")} VNĐ`, priceNum: total, serving };
  }
  if (shape === "cookie") {
    const unit = 40000;
    const total = portion === 1 ? unit : portion === 3 ? 110000 : 210000;
    const serving =
      portion === 1
        ? "1 người • Soft Cookie New York"
        : portion === 3
        ? "2-3 người • Set 3 Cookie mềm"
        : "4-6 người • Hộp quà 6 Cookie";
    return { price: `${total.toLocaleString("vi-VN")} VNĐ`, priceNum: total, serving };
  }
  if (shape === "two-tier") {
    return { price: "890.000 VNĐ", priceNum: 890000, serving: "15-20 người • Tiệc cưới & Gala" };
  }
  switch (size) {
    case 10:
      return { price: "135.000 VNĐ", priceNum: 135000, serving: "1-2 người • Bento Mini" };
    case 12:
      return { price: "210.000 VNĐ", priceNum: 210000, serving: "2-3 người • Cặp đôi" };
    case 14:
      return { price: "290.000 VNĐ", priceNum: 290000, serving: "3-4 người • Nhóm bạn nhỏ" };
    case 16:
      return { price: "360.000 VNĐ", priceNum: 360000, serving: "4-6 người • Tiệc gia đình" };
    case 20:
      return { price: "480.000 VNĐ", priceNum: 480000, serving: "8-10 người • Sinh nhật lớn" };
    case 24:
      return { price: "590.000 VNĐ", priceNum: 590000, serving: "10-14 người • Sự kiện công ty" };
    default:
      return { price: "360.000 VNĐ", priceNum: 360000, serving: "4-6 người" };
  }
}

/**
 * Step-Driven Cinematic Camera Rig:
 * Interpolates camera position and OrbitControls target when user advances steps,
 * then cleanly relinquishes control so autoRotate and user orbit are smooth and unconstrained.
 */
function CameraRig({
  activeStep,
  isCutawayMode,
  controlsRef,
}: {
  activeStep: number;
  isCutawayMode: boolean;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isInteractingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 1.8, 4.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const transitionStartRef = useRef(0);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const controls = controlsRef.current;
      if (controls) {
        clearInterval(checkInterval);
        const onStart = () => {
          isInteractingRef.current = true;
          isTransitioningRef.current = false;
        };
        const onEnd = () => {
          isInteractingRef.current = false;
        };
        controls.addEventListener("start", onStart);
        controls.addEventListener("end", onEnd);
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [controlsRef]);

  useEffect(() => {
    isInteractingRef.current = false;
    isTransitioningRef.current = true;
    transitionStartRef.current = performance.now();

    if (activeStep === 1) {
      targetCamPos.current.set(0, 1.8, 4.2);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeStep === 2) {
      targetCamPos.current.set(2.6, 0.7, 2.8);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeStep === 3 || activeStep === 4) {
      targetCamPos.current.set(0, 2.1, 3.7);
      targetLookAt.current.set(0, 0.1, 0);
    } else if (activeStep === 5) {
      targetCamPos.current.set(0, 3.5, 1.8);
      targetLookAt.current.set(0, 0.3, 0);
    }
  }, [activeStep, isCutawayMode]);

  useFrame(() => {
    if (!isTransitioningRef.current || isInteractingRef.current) return;

    camera.position.lerp(targetCamPos.current, 0.06);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.06);
      controlsRef.current.update();
    }

    const dist = camera.position.distanceTo(targetCamPos.current);
    const elapsed = performance.now() - transitionStartRef.current;
    if (dist < 0.02 || elapsed > 1500) {
      isTransitioningRef.current = false;
    }
  });

  return null;
}

export default function CakeLab() {
  // --- 1. CORE CUSTOMIZATION STATE ---
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | undefined>("preset-round-lambeth");
  const controlsRef = useRef<any>(null);

  // Step 1: Shape & Geometry & Sponge
  const [shapeCategory, setShapeCategory] = useState<"celebration" | "daily">("celebration");
  const [shape, setShape] = useState<CakeShape>("round");
  const [size, setSize] = useState<number>(16);
  const [dailyPortion, setDailyPortion] = useState<1 | 3 | 6>(1);
  const [sponge, setSponge] = useState<SpongeType>("vanilla-genoise");

  // Smart Pâtissier Guardrail: Auto-doweling and soft-sponge lockout for 2-Tier & size >= 20
  useEffect(() => {
    if ((shape === "two-tier" || size >= 20) && sponge === "valrhona-cacao") {
      setSponge("vanilla-genoise");
    }
  }, [shape, size, sponge]);

  // Step 2: Internal Layering (Cutaway)
  const [gelee, setGelee] = useState<GeleeType>("strawberry-compote");
  const [mousse, setMousse] = useState<MousseType>("mascarpone-chantilly");
  const [isCutawayMode, setIsCutawayMode] = useState<boolean>(false);

  // Live dynamic pricing & serving calculator aligned with Proposal (Slides 59-64)
  const currentPricing = useMemo(
    () => getCakePricing(shape, size, dailyPortion),
    [shape, size, dailyPortion]
  );

  // Step change with automatic cutaway toggle on Stage 2
  const handleStepChange = (newStep: number) => {
    if (newStep === 2) {
      setIsCutawayMode(true);
    } else if (activeStep === 2 && newStep !== 2) {
      setIsCutawayMode(false);
    }
    setActiveStep(newStep);
  };

  // Step 3: Frosting Finish & Color
  const [finish, setFinish] = useState<FrostingFinish>("rustic-buttercream");
  const [frostingColor, setFrostingColor] = useState<string>("#FFAEC9");

  // Step 4: Piping Nozzle & Color
  const [pipingStyle, setPipingStyle] = useState<PipingStyle>("wilton-shell");
  const [pipingColor, setPipingColor] = useState<string>("#FFFDF5");

  // Step 5: Smart Piping Canvas & Toppings
  const [toppings, setToppings] = useState<ToppingConfig>({
    cherry: true,
    strawberry: false,
    sprinkles: true,
    ribbonBow: false,
    spiralCandle: false,
    crown: false,
    enamelPin: false,
  });

  const [drawingState, setDrawingState] = useState<SmartDrawingState>({
    strokes: [],
    presetText: "Make a Wish",
    customText: "",
    textColor: "#4A2E1B",
    tipGauge: 2,
  });

  // Customer Keepsake Input
  const [customerName, setCustomerName] = useState<string>("Bồ Công Anh");
  const [wishText, setWishText] = useState<string>(
    "Nguyện cho mọi điều dịu dàng nhất trần đời sẽ đến với bạn."
  );

  // Modals
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);

  // Available Sizes per Proposal
  const availableSizes = [10, 12, 14, 16, 20, 24];

  const currentPantone =
    FROSTING_PALETTE.find((f) => f.hex === frostingColor)?.pantone || "Pantone 189 C";

  const handleConfetti = () => {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#FFAEC9", "#A0C4FF", "#BEE3DB", "#FFF9E6", "#FF3366"],
    });
  };

  // Instant Load Preset from Proposal
  const handleSelectPreset = (preset: ProposalPreset) => {
    setActivePresetId(preset.id);
    setShapeCategory(preset.category);
    setShape(preset.shape);
    setSize(preset.size);
    setSponge(preset.sponge);
    setGelee(preset.gelee);
    setMousse(preset.mousse);
    setFinish(preset.finish);
    setFrostingColor(preset.frostingColor);
    setPipingStyle(preset.pipingStyle);
    setPipingColor(preset.pipingColor);
    setToppings(preset.toppings);
    setShowPresetsDrawer(false);
    handleConfetti();
  };

  const toggleTopping = (key: keyof ToppingConfig) => {
    setToppings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Stepper Stage Names
  const STEPS = [
    { num: 1, title: "Cốt & Hình Khối", icon: Boxes },
    { num: 2, title: "Nhân & Mousse", icon: LayersIcon },
    { num: 3, title: "Kem Phủ & SSS", icon: Palette },
    { num: 4, title: "Bắt Bông Kem", icon: ChefHat },
    { num: 5, title: "Bút Vẽ & Toppings", icon: PenTool },
  ];

  return (
    <section id="cake-lab" className="relative w-full py-24 px-4 sm:px-6 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haute Pâtisserie 3D Cake Lab</span>
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          3D Cake Customizer & Blueprint
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-wishes-chocolate/75 font-sans leading-relaxed">
          Trải nghiệm <strong>Hành Trình Chế Tác 5 Bước</strong> thủ công tinh xảo. Mô phỏng vật liệu
          bơ tán xạ quang học (SSS), công nghệ <strong>Bút Vẽ Làm Mượt Nét Thông Minh</strong>, bóc tách
          mặt cắt 3D chuẩn xác từng milimet và xuất hồ sơ kỹ thuật gia công xưởng bánh chuẩn xác.
        </p>

        {/* Quick Proposal Presets Trigger Button */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
            className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-wishes-chocolate border border-wishes-pink/50 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
          >
            <BookOpen className="w-4 h-4 text-wishes-cherry" />
            <span>
              {showPresetsDrawer ? "Đóng Thư Viện Proposal" : "Thư Viện Mẫu Đề Cương (Proposal Presets)"}
            </span>
          </button>
        </div>
      </div>

      {/* Proposal Presets Drawer (Collapsible) */}
      {showPresetsDrawer && (
        <div className="mb-10 p-5 rounded-3xl glass-panel border-2 border-wishes-cherry/30 shadow-dreamy animate-in fade-in slide-in-from-top-4 duration-300">
          <ProposalPresetsDrawer
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />
        </div>
      )}

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 3D WebGL Canvas & Stage Indicators (7 Cols) */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="relative w-full aspect-square sm:aspect-[4/3] min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] rounded-3xl glass-panel shadow-dreamy border border-white/80 overflow-hidden flex flex-col justify-between p-4 touch-none select-none">
            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/85 text-[10px] font-bold text-wishes-chocolate tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>360° Real-time WebGL Raymarching</span>
              </span>

              {/* Cutaway Blueprint Mode Toggle */}
              <button
                onClick={() => setIsCutawayMode(!isCutawayMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isCutawayMode
                    ? "bg-wishes-cherry text-white shadow-pastel scale-105"
                    : "bg-white/85 text-wishes-chocolate hover:bg-white"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isCutawayMode ? "Đóng Mặt Cắt (Full 3D)" : "Bóc Tách Cốt Bánh (3D Cutaway)"}</span>
              </button>
            </div>

            {/* Dynamic Live Price & Serving Pill Badge (Top-left floating) */}
            <div className="absolute top-14 left-4 z-10 flex flex-col gap-1 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-wishes-cherry/40 shadow-dreamy flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-wishes-cherry animate-pulse" />
                <span className="text-xs font-serif font-black text-wishes-cherry tracking-wide">
                  {currentPricing.price}
                </span>
                <span className="text-[10px] text-stone-300 font-bold">|</span>
                <span className="text-[10px] font-bold text-wishes-chocolate/85">
                  {currentPricing.serving}
                </span>
              </div>
            </div>

            {/* Three.js Canvas */}
            <div className="absolute inset-0 z-0">
              <Canvas
                shadows
                camera={{ position: [0, 2.3, 4.6], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
                dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.75) : 1}
              >
                {/* 1. Appetite Studio Lighting (Warm Morning Daylight, No Cold Blue Cast) */}
                <ambientLight intensity={0.45} color="#FFF8F0" />
                <directionalLight
                  position={[4, 7, 5]}
                  intensity={1.65}
                  color="#FFF5EA"
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-4, 3, 4]} intensity={0.75} color="#FFE5EC" />

                {/* Strictly Back-Lighting for dreamy pastel halo rim without muddying front colors */}
                <pointLight position={[-3, 3, -4]} intensity={1.4} color="#A0C4FF" />
                <pointLight position={[3, 2, -4]} intensity={1.4} color="#FFAEC9" />

                {/* Warm Chocolate Contact Shadows */}
                <ContactShadows
                  position={[0, -0.82, 0]}
                  opacity={0.42}
                  scale={8}
                  blur={2.2}
                  far={4}
                  color="#4A2E1B"
                />

                <Cake3DScene
                  shape={shape}
                  size={size}
                  sponge={sponge}
                  gelee={gelee}
                  mousse={mousse}
                  finish={finish}
                  frostingColor={frostingColor}
                  pipingStyle={pipingStyle}
                  pipingColor={pipingColor}
                  toppings={toppings}
                  isCutawayMode={isCutawayMode}
                  drawingState={drawingState}
                  activeStep={activeStep}
                />

                <CameraRig
                  activeStep={activeStep}
                  isCutawayMode={isCutawayMode}
                  controlsRef={controlsRef}
                />

                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  minDistance={2.5}
                  maxDistance={7}
                  maxPolarAngle={Math.PI / 2 + 0.1}
                  autoRotate={!isCutawayMode && activeStep !== 5}
                  autoRotateSpeed={0.8}
                />
              </Canvas>
            </div>

            {/* Bottom Specs Indicator */}
            <div className="flex items-center justify-between z-10">
              <div className="px-3 py-1 rounded-full bg-white/85 text-[10px] font-bold text-wishes-chocolate shadow-sm flex items-center gap-2">
                <Ruler className="w-3 h-3 text-wishes-cherry" />
                <span>
                  Ø {size * 10}mm × Cao 110mm |{" "}
                  {shape === "round"
                    ? "Tròn Cổ Điển"
                    : shape === "heart"
                    ? "Trái Tim Wonky"
                    : shape === "rectangle"
                    ? "Chữ Nhật Baroque"
                    : shape === "two-tier"
                    ? "2 Tầng Cung Đình"
                    : shape === "cinnamon-roll"
                    ? "Quế Cuộn Kem Chảy"
                    : shape === "croissant"
                    ? "Croissant Bơ Pháp"
                    : shape === "egg-tart"
                    ? "Tart Trứng Custard"
                    : shape === "cookie"
                    ? "Bánh Quy Mềm"
                    : String(shape).toUpperCase()}
                </span>
              </div>

              <div className="px-3 py-1 rounded-full bg-white/85 text-[10px] font-bold text-wishes-cherry shadow-sm flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: frostingColor }}
                />
                <span>{currentPantone}</span>
              </div>
            </div>
          </div>

          {/* 3D Interaction Navigation Hint Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl glass-panel border border-white/70 text-[11px] text-wishes-chocolate/70 shadow-sm">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-wishes-cherry" />
              <span>Chạm & kéo để xoay 360° • Cuộn chuột để phóng to / thu nhỏ</span>
            </span>
            <span className="font-mono text-[10px] text-wishes-chocolate/50 font-semibold hidden sm:inline">
              WebGL 60FPS
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: 5-STAGE ARTISAN STEPPER CONTROLLER (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 5-Step Stepper Header */}
          <div className="p-3 rounded-2xl glass-panel border border-white/80 shadow-sm flex items-center justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => handleStepChange(step.num)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                    isActive
                      ? "text-wishes-cherry font-bold scale-105"
                      : isPast
                      ? "text-wishes-chocolate font-medium"
                      : "text-wishes-chocolate/40"
                  }`}
                  title={step.title}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all ${
                      isActive
                        ? "bg-wishes-cherry text-white shadow-pastel"
                        : isPast
                        ? "bg-wishes-pink/30 text-wishes-chocolate"
                        : "bg-white/60 text-wishes-chocolate/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] hidden sm:block whitespace-nowrap">
                    {step.title.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STEPPER BODY CARD */}
          <div className="p-6 rounded-3xl glass-panel border border-white/80 shadow-pastel transition-all">
            {/* STEP 1: CỐT BÁNH & HÌNH KHỐI */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    Giai đoạn 1 / 5 • Kiến Trúc Cấu Trúc
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    1. Khởi Tạo Cấu Trúc Hình Học
                  </h3>
                </div>

                {/* Categorized Shape Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-wishes-chocolate/80">
                      Hình Dạng Khối (Shape Geometry)
                    </label>
                    <div className="flex gap-1 bg-white/70 p-0.5 rounded-lg border border-wishes-pink/30">
                      <button
                        onClick={() => {
                          setShapeCategory("celebration");
                          if (!["round", "heart", "rectangle", "two-tier"].includes(shape)) {
                            setShape("round");
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          shapeCategory === "celebration"
                            ? "bg-wishes-cherry text-white shadow-xs"
                            : "text-wishes-chocolate/70 hover:bg-white"
                        }`}
                      >
                        🎂 Celebration (4)
                      </button>
                      <button
                        onClick={() => {
                          setShapeCategory("daily");
                          if (!["cinnamon-roll", "croissant", "egg-tart", "cookie"].includes(shape)) {
                            setShape("cinnamon-roll");
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          shapeCategory === "daily"
                            ? "bg-amber-800 text-white shadow-xs"
                            : "text-wishes-chocolate/70 hover:bg-white"
                        }`}
                      >
                        🥐 Daily Baked (4)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(shapeCategory === "celebration"
                      ? [
                          { id: "round" as CakeShape, name: "Tròn Cổ Điển", sub: "Ø 10-24cm", icon: Circle },
                          { id: "heart" as CakeShape, name: "Trái Tim Wonky", sub: "Y2K Sweetcore", icon: Heart },
                          { id: "rectangle" as CakeShape, name: "Chữ Nhật Baroque", sub: "150 × 200mm", icon: Boxes },
                          { id: "two-tier" as CakeShape, name: "2 Tầng Cung Đình", sub: "Đế 20 + Ngọn 12", icon: Cake },
                        ]
                      : [
                          { id: "cinnamon-roll" as CakeShape, name: "Quế Cuộn Kem Chảy", sub: "Signature Glaze", icon: Sparkles },
                          { id: "croissant" as CakeShape, name: "Croissant Bơ Pháp", sub: "81 Lớp Ngàn Lớp", icon: Sparkles },
                          { id: "egg-tart" as CakeShape, name: "Tart Trứng Custard", sub: "Custard Nướng Cháy", icon: Sparkles },
                          { id: "cookie" as CakeShape, name: "Bánh Quy Mềm", sub: "Soft Cookie New York", icon: Sparkles },
                        ]
                    ).map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setShape(s.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-start gap-2.5 border ${
                            shape === s.id
                              ? "bg-wishes-cherry text-white border-wishes-cherry shadow-sm"
                              : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <div>{s.name}</div>
                            <div
                              className={`text-[9px] ${
                                shape === s.id ? "text-white/80" : "text-wishes-chocolate/60"
                              }`}
                            >
                              {s.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size or Portion Selector */}
                {shapeCategory === "celebration" ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-wishes-chocolate/80">
                        Kích Thước Đường Kính (Cake Diameter)
                      </label>
                      <span className="text-[10px] font-medium text-wishes-chocolate/60">
                        Đế bánh chuẩn khẩu phần
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableSizes.map((s) => {
                        const sInfo = getCakePricing(shape, s);
                        const isSelected = size === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSize(s)}
                            className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                              isSelected
                                ? "bg-wishes-chocolate text-white border-wishes-chocolate shadow-sm"
                                : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold">Ø {s}cm</span>
                              <span
                                className={`text-[10px] font-mono font-semibold ${
                                  isSelected ? "text-wishes-pink" : "text-wishes-cherry"
                                }`}
                              >
                                {sInfo.price.replace(" VNĐ", "k")}
                              </span>
                            </div>
                            <div
                              className={`text-[9px] mt-1 leading-tight line-clamp-1 ${
                                isSelected ? "text-white/80" : "text-wishes-chocolate/60"
                              }`}
                              title={sInfo.serving}
                            >
                              {sInfo.serving}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-wishes-chocolate/80">
                        Khẩu Phần Daily Baked (Portion Selector - Slide 62)
                      </label>
                      <span className="text-[10px] font-medium text-amber-800">
                        Hộp quà & Set thưởng thức
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { portion: 1 as const, name: "1 Cái", sub: "Cá nhân" },
                        { portion: 3 as const, name: "Set 3 Cái", sub: "2-3 người" },
                        { portion: 6 as const, name: "Set 6 Cái", sub: "Hộp tiệc" },
                      ].map((p) => {
                        const pInfo = getCakePricing(shape, size, p.portion);
                        const isSelected = dailyPortion === p.portion;
                        return (
                          <button
                            key={p.portion}
                            type="button"
                            onClick={() => setDailyPortion(p.portion)}
                            className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                              isSelected
                                ? "bg-amber-800 text-white border-amber-800 shadow-sm"
                                : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold">{p.name}</span>
                              <span
                                className={`text-[10px] font-mono font-semibold ${
                                  isSelected ? "text-amber-200" : "text-amber-800"
                                }`}
                              >
                                {pInfo.price.replace(" VNĐ", "k")}
                              </span>
                            </div>
                            <div
                              className={`text-[9px] mt-1 leading-tight line-clamp-1 ${
                                isSelected ? "text-white/80" : "text-wishes-chocolate/60"
                              }`}
                              title={pInfo.serving}
                            >
                              {pInfo.serving}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Smart Pâtissier Guardrail Dowel Banner */}
                {(shape === "two-tier" || size >= 20) && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Smart Pâtissier Guardrail: Gia Cố Kết Cấu Tự Động</span>
                      </div>
                      <p className="text-[10px] text-amber-800/80 leading-relaxed">
                        Bánh {shape === "two-tier" ? "2 tầng cung đình" : `kích thước lớn Ø${size}cm`} tự động kích hoạt hệ thống <strong>4 Trụ đỡ thực phẩm Ø6mm + Đế lót trung tâm</strong> trong 3D Cutaway. Cốt bánh Chiffon mềm xốp bị khóa để chống sụt lún khi vận chuyển (SOP Slide 38).
                      </p>
                    </div>
                  </div>
                )}

                {/* Sponge Cake Selection */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    {shapeCategory === "daily"
                      ? "Độ Nướng & Cốt Bánh (Crust & Crumb)"
                      : "Loại Cốt Bánh (Sponge Cake Type)"}
                  </label>
                  <div className="space-y-1.5">
                    {SPONGE_OPTIONS.map((sp) => {
                      const isChiffonLocked =
                        (shape === "two-tier" || size >= 20) && sp.id === "valrhona-cacao";
                      return (
                        <button
                          key={sp.id}
                          disabled={isChiffonLocked}
                          onClick={() => !isChiffonLocked && setSponge(sp.id)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                            isChiffonLocked
                              ? "bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                              : sponge === sp.id
                              ? "bg-white border-2 border-wishes-cherry shadow-sm"
                              : "bg-white/60 border-wishes-pink/20 hover:bg-white text-wishes-chocolate"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: sp.color }}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={
                                    isChiffonLocked ? "text-gray-400 line-through" : "text-wishes-chocolate"
                                  }
                                >
                                  {sp.name}
                                </span>
                                {isChiffonLocked && (
                                  <span className="text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Khóa (Chống sụt lún)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-wishes-chocolate/70 font-normal">
                                {isChiffonLocked
                                  ? "Chiffon mềm dễ sụt lún - Khuyến nghị dùng Genoise"
                                  : sp.sub}
                              </div>
                            </div>
                          </div>
                          {sponge === sp.id && !isChiffonLocked && (
                            <Check className="w-3.5 h-3.5 text-wishes-cherry" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PHẾT NHÂN & TẦNG MOUSSE */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                      {shapeCategory === "daily"
                        ? "Giai đoạn 2 / 5 • Nhân Chảy 3D"
                        : "Giai đoạn 2 / 5 • Giải Phẫu 3D"}
                    </span>
                    <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                      {shapeCategory === "daily"
                        ? "2. Nhân Chảy Bên Trong (Fill-in Molten Core)"
                        : "2. Phết Nhân & Tầng Mousse"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCutawayMode(!isCutawayMode)}
                    className="px-2.5 py-1 rounded-lg bg-wishes-cherry/20 text-wishes-cherry text-[10px] font-bold hover:bg-wishes-cherry hover:text-white transition-all"
                  >
                    {isCutawayMode ? "Đóng Cutaway" : "Mở Cutaway"}
                  </button>
                </div>

                {/* Fruit Gelee Layer */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    {shapeCategory === "daily"
                      ? "Nhân Chảy Trái Cây / Mứt Tươi (Fruit Coulis)"
                      : "Lớp Mứt Gelée Trái Cây (Compote Layer)"}
                  </label>
                  <div className="space-y-1.5">
                    {GELEE_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGelee(g.id)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                          gelee === g.id
                            ? "bg-white border-2 border-wishes-cherry shadow-sm"
                            : "bg-white/60 border-wishes-pink/20 hover:bg-white text-wishes-chocolate"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: g.color === "transparent" ? "#FFF" : g.color }}
                          />
                          <div>
                            <div className="text-wishes-chocolate">{g.name}</div>
                            <div className="text-[10px] text-wishes-chocolate/70 font-normal">
                              {g.sub}
                            </div>
                          </div>
                        </div>
                        {gelee === g.id && <Check className="w-3.5 h-3.5 text-wishes-cherry" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mousse Layer */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    {shapeCategory === "daily"
                      ? "Kem Custard & Sốt Đậm Đặc (Molten Core)"
                      : "Tầng Mousse Béo Ngậy (Cream Mousse Layer)"}
                  </label>
                  <div className="space-y-1.5">
                    {MOUSSE_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMousse(m.id)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                          mousse === m.id
                            ? "bg-white border-2 border-wishes-cherry shadow-sm"
                            : "bg-white/60 border-wishes-pink/20 hover:bg-white text-wishes-chocolate"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: m.color }}
                          />
                          <div>
                            <div className="text-wishes-chocolate">{m.name}</div>
                            <div className="text-[10px] text-wishes-chocolate/70 font-normal">
                              {m.sub}
                            </div>
                          </div>
                        </div>
                        {mousse === m.id && <Check className="w-3.5 h-3.5 text-wishes-cherry" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>
                    Chế độ <strong>Bóc Tách Mặt Cắt 3D</strong> cho phép thợ bánh đối chiếu tỷ lệ milimet thực tế
                    ngay trên màn hình.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: ÁO KEM PHỦ BỀ MẶT */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    {shapeCategory === "daily"
                      ? "Giai đoạn 3 / 5 • Sốt Rưới & Màu Sắc"
                      : "Giai đoạn 3 / 5 • Vật Liệu & Màu Sắc"}
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    {shapeCategory === "daily"
                      ? "3. Sốt Phủ & Glaze (Drizzle)"
                      : "3. Áo Lớp Kem Phủ Bề Mặt (Finishing & SSS)"}
                  </h3>
                </div>

                {/* Finishing Texture Style */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    {shapeCategory === "daily"
                      ? "Kiểu Sốt Rưới & Tráng Phủ (Drizzle & Glaze Style)"
                      : "Trường Phái Hoàn Thiện Bề Mặt (Surface Style)"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "rustic-buttercream" as FrostingFinish,
                        title: shapeCategory === "daily" ? "Cream Cheese" : "Rustic Butter",
                        sub: shapeCategory === "daily" ? "Sốt phô mai béo" : "Gợn dao phết mộc",
                      },
                      {
                        id: "mirror-glaze" as FrostingFinish,
                        title: "Mirror Glaze",
                        sub: shapeCategory === "daily" ? "Sốt siro óng ánh" : "Tráng gương thủy tinh",
                      },
                      {
                        id: "velvet-spray" as FrostingFinish,
                        title: shapeCategory === "daily" ? "Powder Sugar" : "Velvet Spray",
                        sub: shapeCategory === "daily" ? "Rắc đường tuyết mịn" : "Phun nhung tuyết mịn",
                      },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFinish(f.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                          finish === f.id
                            ? "bg-wishes-chocolate text-white border-wishes-chocolate shadow-sm"
                            : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                        }`}
                      >
                        <div>{f.title}</div>
                        <div className="text-[9px] font-normal opacity-80 mt-0.5">{f.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frosting Color Palette */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    {shapeCategory === "daily"
                      ? `Màu Sốt Phủ Chuẩn Pantone (${currentPantone})`
                      : `Bảng Màu Thực Phẩm Chuẩn Pantone (${currentPantone})`}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {FROSTING_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setFrostingColor(c.hex)}
                        title={`${c.name} (${c.pantone})`}
                        className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          frostingColor === c.hex
                            ? "border-wishes-chocolate bg-white shadow-md scale-105"
                            : "border-transparent bg-white/60 hover:bg-white"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {frostingColor === c.hex && (
                            <Check className="w-3 h-3 text-wishes-chocolate" />
                          )}
                        </span>
                        <span className="text-[9px] font-bold text-wishes-chocolate text-center truncate w-full">
                          {c.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BẮT BÔNG KEM NGHỆ THUẬT */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    Giai đoạn 4 / 5 • Haute Pâtisserie Nozzles
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    4. Bắt Bông Kem Nghệ Thuật (Piping Patterns)
                  </h3>
                </div>

                {/* Piping Nozzle Options */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Chọn Đui Bắt Kem Chuyên Dụng (Piping Nozzles)
                  </label>
                  <div className="space-y-1.5">
                    {PIPING_STYLES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPipingStyle(p.id)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                          pipingStyle === p.id
                            ? "bg-white border-2 border-wishes-cherry shadow-sm"
                            : "bg-white/60 border-wishes-pink/20 hover:bg-white text-wishes-chocolate"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{p.icon}</span>
                          <div>
                            <div className="text-wishes-chocolate">{p.name}</div>
                            <div className="text-[10px] text-wishes-chocolate/70 font-normal">
                              {p.sub}
                            </div>
                          </div>
                        </div>
                        {pipingStyle === p.id && <Check className="w-3.5 h-3.5 text-wishes-cherry" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Piping Cream Color */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Màu Kem Viền Hoa (Border Piping Color)
                  </label>
                  <div className="flex gap-2">
                    {[
                      { name: "White Mascarpone", hex: "#FFFDF5" },
                      { name: "Pastel Pink", hex: "#FFAEC9" },
                      { name: "Baby Blue", hex: "#A0C4FF" },
                      { name: "Butter Cream", hex: "#FFF9E6" },
                      { name: "Deep Cacao", hex: "#4A2E1B" },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setPipingColor(col.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                          pipingColor === col.hex ? "border-wishes-chocolate scale-110 shadow-sm" : "border-white"
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {pipingColor === col.hex && <Check className="w-3 h-3 text-wishes-chocolate" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BÚT VẼ THÔNG MINH & PHỤ KIỆN */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    Giai đoạn 5 / 5 • Hoàn Thiện & Dấu Ấn Cá Nhân
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    5. Bút Vẽ Thông Minh & Phụ Kiện Wishes
                  </h3>
                </div>

                {/* Interactive Smart Piping Pad */}
                <SmartPipingPad
                  drawingState={drawingState}
                  onUpdateDrawing={setDrawingState}
                  cakeColor={frostingColor}
                  cakeSize={size}
                  cakeShape={shape}
                />

                {/* Toppings & Accessories Grid */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Phụ Kiện Chính Hãng Đề Cương Proposal (Slide 83 – 85)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "cherry" as const, label: "🍒 Quả Cherry Bóng" },
                      { key: "strawberry" as const, label: "🍓 Dâu Tây Tươi" },
                      { key: "sprinkles" as const, label: "✨ Kẹo Cốm Pastel" },
                      { key: "ribbonBow" as const, label: "🎀 Nơ Lụa Satin (S84)" },
                      { key: "spiralCandle" as const, label: "🕯️ Nến Xoắn Ốc" },
                      { key: "crown" as const, label: "👑 Vương Miện (S85)" },
                      { key: "enamelPin" as const, label: "🏅 Enamel Pin (S83)" },
                    ].map((top) => (
                      <button
                        key={top.key}
                        onClick={() => toggleTopping(top.key)}
                        className={`py-2 px-3 rounded-xl font-bold transition-all border text-left flex items-center justify-between ${
                          toppings[top.key]
                            ? "bg-wishes-pink/30 border-wishes-cherry text-wishes-cherry"
                            : "bg-white/60 border-transparent text-wishes-chocolate/60"
                        }`}
                      >
                        <span>{top.label}</span>
                        {toppings[top.key] && <Check className="w-3.5 h-3.5 text-wishes-cherry" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Wish Inputs for Keepsake */}
                <div className="space-y-2 pt-2 border-t border-wishes-chocolate/10">
                  <input
                    type="text"
                    placeholder="Tên người nhận (ví dụ: Bồ Công Anh)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-wishes-pink/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-sans"
                  />
                  <input
                    type="text"
                    placeholder="Lời chúc đính kèm..."
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-wishes-pink/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-sans"
                  />
                </div>
              </div>
            )}

            {/* Stepper Navigation Footer Buttons */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-wishes-chocolate/10">
              <button
                onClick={() => handleStepChange(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="px-3.5 py-2 rounded-xl bg-white/70 text-xs font-bold text-wishes-chocolate hover:bg-white disabled:opacity-30 flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bước Trước</span>
              </button>

              <span className="text-[11px] font-bold text-wishes-chocolate/60">
                Bước {activeStep} / 5
              </span>

              {activeStep < 5 ? (
                <button
                  onClick={() => handleStepChange(Math.min(5, activeStep + 1))}
                  className="px-4 py-2 rounded-xl bg-wishes-cherry text-white text-xs font-bold hover:bg-wishes-cherry/90 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Tiếp Tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowBlueprintModal(true);
                    handleConfetti();
                  }}
                  className="px-4 py-2 rounded-xl candy-btn text-xs font-bold flex items-center gap-1.5 shadow-pastel"
                >
                  <Award className="w-4 h-4 text-wishes-cherry" />
                  <span>Hoàn Tất & Xem Blueprint</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setShowStoryModal(true);
                handleConfetti();
              }}
              className="py-3 px-2 rounded-2xl candy-btn text-xs font-bold text-center flex flex-col items-center justify-center gap-1 shadow-pastel"
            >
              <Download className="w-4 h-4 text-wishes-cherry" />
              <span>Xuất Story 9:16</span>
            </button>

            <button
              onClick={() => {
                setShowReceiptModal(true);
                handleConfetti();
              }}
              className="py-3 px-2 rounded-2xl bg-white/90 border border-wishes-chocolate/15 hover:bg-white text-xs font-bold text-wishes-chocolate flex flex-col items-center justify-center gap-1 shadow-sm transition-all"
            >
              <Receipt className="w-4 h-4 text-wishes-blue" />
              <span>Hóa Đơn Cảm Xúc</span>
            </button>

            <button
              onClick={() => {
                setShowBlueprintModal(true);
                handleConfetti();
              }}
              className="py-3 px-2 rounded-2xl bg-wishes-blue/25 border border-wishes-blue hover:bg-wishes-blue/40 text-xs font-bold text-wishes-chocolate flex flex-col items-center justify-center gap-1 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-wishes-chocolate" />
              <span>Bản Vẽ Cho Thợ Bánh</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: 9:16 INSTAGRAM STORY KEEPSAKE MODAL --- */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-wishes-cream via-white to-wishes-pink/30 p-6 border-4 border-white shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 text-wishes-chocolate/60 hover:text-wishes-chocolate text-xl font-bold"
            >
              ✕
            </button>
            <span className="text-[10px] uppercase font-bold tracking-widest text-wishes-cherry bg-wishes-pink/40 px-3 py-1 rounded-full mb-3">
              Instagram Story Card • 9:16
            </span>
            <div className="w-full aspect-[9/16] rounded-2xl bg-gradient-to-tr from-wishes-pink/40 via-wishes-blue/30 to-wishes-cream p-6 flex flex-col justify-between items-center text-center shadow-inner border border-white">
              <div>
                <h4 className="text-2xl font-serif-swash font-bold text-wishes-chocolate">
                  WISHES BOUTIQUE
                </h4>
                <p className="text-[10px] tracking-widest uppercase text-wishes-cherry font-bold">
                  Make a wish • Take a bite
                </p>
              </div>

              {/* 3D Cake Visual Badge */}
              <div className="relative my-4 flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full border-4 border-white shadow-dreamy flex items-center justify-center text-4xl"
                  style={{ backgroundColor: frostingColor }}
                >
                  {shape === "round"
                    ? "🎂"
                    : shape === "heart"
                    ? "💖"
                    : shape === "two-tier"
                    ? "🏰"
                    : shape === "rectangle"
                    ? "🍰"
                    : shape === "cinnamon-roll"
                    ? "🧁"
                    : shape === "croissant"
                    ? "🥐"
                    : shape === "egg-tart"
                    ? "🍮"
                    : "🍪"}
                </div>
                <div className="mt-2 text-xs font-bold text-wishes-chocolate">
                  {shape === "round"
                    ? "Round Celebration"
                    : shape === "heart"
                    ? "Wonky Heart"
                    : shape === "rectangle"
                    ? "Baroque Rectangle"
                    : shape === "two-tier"
                    ? "Royal 2-Tier Castle"
                    : shape === "cinnamon-roll"
                    ? "Signature Cinnamon Roll"
                    : shape === "croissant"
                    ? "French Butter Croissant"
                    : shape === "egg-tart"
                    ? "Custard Egg Tart"
                    : "Artisanal Soft Cookie"}{" "}
                  • {size}cm
                </div>
                <div className="text-[10px] text-wishes-chocolate/70">{currentPantone}</div>
              </div>

              <div>
                <p className="text-xs font-serif-swash italic text-wishes-cherry mb-1">
                  Thân tặng {customerName || "Bồ Công Anh"}
                </p>
                <p className="text-xs font-sans text-wishes-chocolate/85 px-2">
                  "{wishText || drawingState.customText || drawingState.presetText}"
                </p>
                <div className="mt-4 pt-3 border-t border-wishes-chocolate/15 flex items-center justify-between text-[8px] text-wishes-chocolate/60">
                  <span>GFA26GD60 • PHUONGNHT8</span>
                  <span>fpt.edu.vn</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Đã lưu hình ảnh WISHES Card 9:16 độ phân giải cao vào máy của bạn!");
                setShowStoryModal(false);
              }}
              className="mt-4 w-full py-2.5 rounded-full candy-btn text-xs font-bold"
            >
              Tải Ảnh Xuống Thiết Bị (High-Res)
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: AESTHETIC THERMAL RECEIPT MODAL --- */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl font-mono text-xs text-wishes-chocolate flex flex-col border-2 border-dashed border-wishes-chocolate/20">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-wishes-chocolate/60 hover:text-wishes-chocolate text-xl font-bold font-sans"
            >
              ✕
            </button>
            <div className="text-center pb-4 border-b border-dashed border-wishes-chocolate/30">
              <h4 className="text-lg font-serif-swash font-bold">WISHES PASTRY</h4>
              <p className="text-[10px] text-wishes-chocolate/70">
                128 Le Loi, Dist 1, HCMC • 090-WISHES
              </p>
              <p className="text-[9px] text-wishes-chocolate/50 mt-1">
                ORDER #{Date.now().toString().slice(-6)}
              </p>
            </div>

            <div className="py-4 space-y-2 text-[11px] border-b border-dashed border-wishes-chocolate/30">
              <div className="flex justify-between">
                <span>
                  {shapeCategory === "daily" ? (dailyPortion === 1 ? "1× " : `${dailyPortion}× `) : "1× "}
                  {shape === "round"
                    ? "Round Celebration Cake"
                    : shape === "heart"
                    ? "Wonky Heart Cake"
                    : shape === "rectangle"
                    ? "Baroque Sheet Cake"
                    : shape === "two-tier"
                    ? "Royal 2-Tier Castle Cake"
                    : shape === "cinnamon-roll"
                    ? "Signature Cinnamon Roll"
                    : shape === "croissant"
                    ? "French Butter Croissant"
                    : shape === "egg-tart"
                    ? "Custard Egg Tart"
                    : "Artisanal Soft Cookie"}{" "}
                  ({shapeCategory === "daily" ? (dailyPortion === 1 ? "Khẩu phần 1 cái" : `Set ${dailyPortion} cái`) : `${size}cm`})
                </span>
                <span className="font-bold text-wishes-chocolate">{currentPricing.price}</span>
              </div>
              <div className="flex justify-between text-[10px] text-wishes-chocolate/70">
                <span>• Frosting: {currentPantone}</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-[10px] text-wishes-chocolate/70">
                <span>• Cốt bánh: {SPONGE_OPTIONS.find((s) => s.id === sponge)?.name}</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-[10px] text-wishes-chocolate/70">
                <span>• Mousse: {MOUSSE_OPTIONS.find((m) => m.id === mousse)?.name}</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between pt-2 text-[11px] font-bold">
                <span>EMOTIONAL INGREDIENTS:</span>
              </div>
              <div className="text-[10px] text-wishes-chocolate/75 space-y-0.5">
                <div>- 100% Hy vọng & Ngọt ngào</div>
                <div>- 1 Tbsp Sự kỳ diệu của điều ước</div>
                <div>- Hương dâu tươi tự nhiên</div>
              </div>
              <div className="flex justify-between pt-3 text-xs font-bold border-t border-wishes-chocolate/20">
                <span>TỔNG CỘNG (TOTAL):</span>
                <span className="text-wishes-cherry font-mono">{currentPricing.price}</span>
              </div>
            </div>

            {/* QR Code Simulation */}
            <div className="pt-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-wishes-cream border-2 border-wishes-chocolate/20 rounded-xl flex items-center justify-center p-2 mb-2">
                <div className="grid grid-cols-4 gap-1 w-full h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        i % 2 === 0 || i % 5 === 0 ? "bg-wishes-chocolate" : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-wishes-chocolate/60">
                Quét mã để mở lại mô hình 3D tương tác này bất kỳ lúc nào
              </p>
            </div>

            <button
              onClick={() => {
                alert("Đã lưu hóa đơn điện tử nghệ thuật của bạn!");
                setShowReceiptModal(false);
              }}
              className="mt-4 w-full py-2 rounded-xl bg-wishes-chocolate text-white text-xs font-sans font-bold"
            >
              In Hóa Đơn PDF
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: BAKING PRODUCTION BLUEPRINT 1:1 FOR CHEFS --- */}
      <BakingBlueprintModal
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        shape={shape}
        size={size}
        sponge={sponge}
        gelee={gelee}
        mousse={mousse}
        finish={finish}
        frostingColor={frostingColor}
        pipingStyle={pipingStyle}
        pipingColor={pipingColor}
        toppings={toppings}
        customerName={customerName}
        wishText={wishText}
        handwrittenText={drawingState.customText || drawingState.presetText}
        aestheticScore={95}
        estimatedPrice={currentPricing.price}
      />
    </section>
  );
}
