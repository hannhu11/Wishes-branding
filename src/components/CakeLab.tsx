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
  Award,
  PenTool,
  ChefHat,
  Palette,
  Cake,
  Boxes,
  ShieldAlert,
  Lock,
  Plus,
  Minus,
  Trash2,
  HelpCircle,
  Eye,
  Type,
  Wand2,
  Sliders,
  DollarSign,
  X,
  Camera,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useInView } from "./common/useInView";

import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  PipingPosition,
  AccessoryItem,
  AccessoryType,
  ACCESSORY_CATALOG,
  TypographyState,
  FONT_OPTIONS,
  COLOR_HARMONY_SUGGESTIONS,
  SmartDrawingState,
  ProposalPreset,
  PROPOSAL_PRESETS,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
  FROSTING_PALETTE,
  PIPING_STYLES,
  PIPING_POSITIONS,
} from "./cake-lab/types";
import Cake3DScene, { PhotoCaptureHelper, CapturedAngles } from "./cake-lab/Cake3DScene";
import SmartPipingPad from "./cake-lab/SmartPipingPad";
import ProposalPresetsDrawer from "./cake-lab/ProposalPresetsDrawer";
import BakingBlueprintModal from "./cake-lab/BakingBlueprintModal";

/**
 * Line item for live breakdown popover
 */
export interface PriceLineItem {
  id: string;
  name: string;
  category: "base" | "shape" | "filling" | "finish" | "piping" | "accessory";
  unitPrice: number;
  count: number;
  totalPrice: number;
  removable?: boolean;
}

/**
 * Live Itemized Pricing Calculator aligned with Proposal
 */
export function calculateItemizedBill({
  shape,
  size,
  dailyPortion = 1,
  sponge,
  gelee,
  mousse,
  finish,
  pipingPosition,
  accessories = [],
}: {
  shape: CakeShape;
  size: number;
  dailyPortion?: 1 | 3 | 6;
  sponge: SpongeType;
  gelee: GeleeType;
  mousse: MousseType;
  finish: FrostingFinish;
  pipingPosition: PipingPosition;
  accessories: AccessoryItem[];
}) {
  const lineItems: PriceLineItem[] = [];

  // 1. Base Pastry / Cake Price
  const isDaily =
    shape === "cinnamon-roll" ||
    shape === "croissant" ||
    shape === "croissant-bow" ||
    shape === "egg-tart" ||
    shape === "cookie" ||
    shape === "cookie-bear";

  let basePrice = 360000;
  let serving = "4-6 người • Tiệc gia đình";

  if (isDaily) {
    let unit = 40000;
    let pastryName = "Bánh Mộc Hàng Ngày";
    if (shape === "cinnamon-roll") {
      unit = 55000;
      pastryName = "Cinnamon Roll Quế Cuộn";
    } else if (shape === "croissant" || shape === "croissant-bow") {
      unit = 45000;
      pastryName = "Croissant Bơ Pháp 81 Lớp";
    } else if (shape === "egg-tart") {
      unit = 35000;
      pastryName = "Egg Tart Custard Bồ Đào Nha";
    } else if (shape === "cookie" || shape === "cookie-bear") {
      unit = 40000;
      pastryName = "Petit Beurre Butter Biscuit";
    }
    const total =
      dailyPortion === 1 ? unit : dailyPortion === 3 ? unit * 3 - 15000 : unit * 6 - 40000;
    serving =
      dailyPortion === 1
        ? "1 người • Cá nhân"
        : dailyPortion === 3
        ? "2-3 người • Set 3 bánh"
        : "4-6 người • Hộp tiệc 6 bánh";

    lineItems.push({
      id: "base-pastry",
      name: `${pastryName} (${dailyPortion === 1 ? "1 cái" : `Set ${dailyPortion} cái`})`,
      category: "base",
      unitPrice: total,
      count: 1,
      totalPrice: total,
    });
  } else {
    // Celebration sizes
    const sizePrices: Record<number, { price: number; serving: string }> = {
      10: { price: 135000, serving: "1-2 người • Bento Mini" },
      12: { price: 220000, serving: "2-3 người • Cặp đôi" },
      14: { price: 290000, serving: "3-4 người • Nhóm nhỏ" },
      16: { price: 360000, serving: "4-6 người • Tiệc gia đình" },
      20: { price: 450000, serving: "8-10 người • Sinh nhật lớn" },
      24: { price: 550000, serving: "10-14 người • Sự kiện công ty" },
    };
    const sInfo = sizePrices[size] || { price: 360000, serving: "4-6 người" };
    basePrice = sInfo.price;
    serving = sInfo.serving;

    lineItems.push({
      id: "base-cake",
      name: `Cốt Bánh Kỷ Niệm (Khuôn Ø ${size}cm)`,
      category: "base",
      unitPrice: basePrice,
      count: 1,
      totalPrice: basePrice,
    });
  }

  // 2. Sculpted Shape Surcharges
  if (shape === "two-tier") {
    lineItems.push({
      id: "shape-tier",
      name: "Kết Cấu 2 Tầng Cung Đình + 4 Cọc Dowel Chịu Lực",
      category: "shape",
      unitPrice: 180000,
      count: 1,
      totalPrice: 180000,
    });
    serving = "15-20 người • Tiệc cưới & Gala";
  } else if (shape === "cat-y2k") {
    lineItems.push({
      id: "shape-cat",
      name: "Điêu Khắc Tạo Hình Mèo Y2K 3D (Slide 58)",
      category: "shape",
      unitPrice: 65000,
      count: 1,
      totalPrice: 65000,
    });
  } else if (shape === "puppy-bow") {
    lineItems.push({
      id: "shape-puppy",
      name: "Điêu Khắc Tạo Hình Cún Đính Nơ 3D (Slide 59)",
      category: "shape",
      unitPrice: 65000,
      count: 1,
      totalPrice: 65000,
    });
  } else if (shape === "cookie-bear") {
    lineItems.push({
      id: "shape-cookie-bear",
      name: "Tạo Hình Gấu Đắp Chăn Bánh Quy (Slide 42)",
      category: "shape",
      unitPrice: 25000,
      count: 1,
      totalPrice: 25000,
    });
  }

  // 3. Premium Fillings
  const geleeOpt = GELEE_OPTIONS.find((g) => g.id === gelee);
  if (geleeOpt && geleeOpt.surcharge && geleeOpt.surcharge > 0) {
    lineItems.push({
      id: `filling-gelee-${gelee}`,
      name: `Sốt Mứt Cao Cấp: ${geleeOpt.name.split("(")[0]}`,
      category: "filling",
      unitPrice: geleeOpt.surcharge,
      count: 1,
      totalPrice: geleeOpt.surcharge,
      removable: true,
    });
  }

  const mousseOpt = MOUSSE_OPTIONS.find((m) => m.id === mousse);
  if (mousseOpt && mousseOpt.surcharge && mousseOpt.surcharge > 0) {
    lineItems.push({
      id: `filling-mousse-${mousse}`,
      name: `Tầng Mousse Độc Bản: ${mousseOpt.name}`,
      category: "filling",
      unitPrice: mousseOpt.surcharge,
      count: 1,
      totalPrice: mousseOpt.surcharge,
      removable: true,
    });
  }

  // 4. Premium Finishes
  if (finish === "mirror-glaze") {
    lineItems.push({
      id: "finish-glaze",
      name: "Tráng Gương Thủy Tinh (Mirror Glaze)",
      category: "finish",
      unitPrice: 25000,
      count: 1,
      totalPrice: 25000,
      removable: true,
    });
  } else if (finish === "velvet-spray") {
    lineItems.push({
      id: "finish-velvet",
      name: "Phun Nhung Tuyết Mịn (Velvet Spray)",
      category: "finish",
      unitPrice: 25000,
      count: 1,
      totalPrice: 25000,
      removable: true,
    });
  } else if (finish === "airbrush-stars") {
    lineItems.push({
      id: "finish-airbrush",
      name: "Xịt Sơn Ngôi Sao Airbrush Y2K (Slide 58-59)",
      category: "finish",
      unitPrice: 25000,
      count: 1,
      totalPrice: 25000,
      removable: true,
    });
  } else if (finish === "ombre-gradient") {
    lineItems.push({
      id: "finish-ombre",
      name: "Loang Màu Ombré 2 Tầng Nghệ Thuật",
      category: "finish",
      unitPrice: 25000,
      count: 1,
      totalPrice: 25000,
      removable: true,
    });
  }

  // 5. Piping Position Surcharges
  const pipePosOpt = PIPING_POSITIONS.find((p) => p.id === pipingPosition);
  if (pipePosOpt && pipePosOpt.surcharge > 0) {
    lineItems.push({
      id: `piping-pos-${pipingPosition}`,
      name: pipePosOpt.name,
      category: "piping",
      unitPrice: pipePosOpt.surcharge,
      count: 1,
      totalPrice: pipePosOpt.surcharge,
      removable: true,
    });
  }

  // 6. Accessories Total
  accessories.forEach((acc) => {
    const catalogEntry = ACCESSORY_CATALOG.find((c) => c.type === acc.type);
    const itemTotal = acc.count * (acc.unitPrice || catalogEntry?.unitPrice || 15000);
    lineItems.push({
      id: acc.id,
      name: `${catalogEntry?.icon || "✨"} ${catalogEntry?.name || acc.type}`,
      category: "accessory",
      unitPrice: acc.unitPrice,
      count: acc.count,
      totalPrice: itemTotal,
      removable: true,
    });
  });

  const grandTotal = lineItems.reduce((acc, item) => acc + item.totalPrice, 0);

  return {
    lineItems,
    grandTotal,
    formattedGrandTotal: `${grandTotal.toLocaleString("vi-VN")} VNĐ`,
    serving,
  };
}

/**
 * Step-Driven Cinematic Camera Rig
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

    return () => clearInterval(checkInterval);
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
      targetCamPos.current.set(0, 2.4, 3.6);
      targetLookAt.current.set(0, 0.2, 0);
    } else if (activeStep === 6) {
      targetCamPos.current.set(0, 3.4, 1.9);
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
  // --- 1. CORE CUSTOMIZATION STATE (6-STEP WORKFLOW) ---
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | undefined>("preset-round-lambeth");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Step 1: Shape & Geometry & Sponge
  const [shapeCategory, setShapeCategory] = useState<"celebration" | "daily">("celebration");
  const [shape, setShape] = useState<CakeShape>("round");
  const [size, setSize] = useState<number>(16);
  const [dailyPortion, setDailyPortion] = useState<1 | 3 | 6>(1);
  const [sponge, setSponge] = useState<SpongeType>("vanilla-genoise");

  // Step 2: Internal Layering & Cutaway
  const [gelee, setGelee] = useState<GeleeType>("strawberry-compote");
  const [mousse, setMousse] = useState<MousseType>("mascarpone-chantilly");
  const [isCutawayMode, setIsCutawayMode] = useState<boolean>(false);

  // Step 3: Frosting Finish & Color
  const [finish, setFinish] = useState<FrostingFinish>("rustic-buttercream");
  const [frostingColor, setFrostingColor] = useState<string>("#FFAEC9");

  // Step 4: Piping Nozzle & Position
  const [pipingStyle, setPipingStyle] = useState<PipingStyle>("wilton-shell");
  const [pipingColor, setPipingColor] = useState<string>("#FFFDF5");
  const [pipingPosition, setPipingPosition] = useState<PipingPosition>("dual-rim");

  // Step 5: Multi-Instance Accessories Studio
  const [accessories, setAccessories] = useState<AccessoryItem[]>([
    { id: "acc-1", type: "cherry", count: 6, layout: "ring", scale: 1.0, unitPrice: 12000 },
    { id: "acc-2", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
  ]);

  // Step 6: Typography & Smart Piping Pad
  const [step6Tab, setStep6Tab] = useState<"typography" | "drawing">("typography");

  const [typography, setTypography] = useState<TypographyState>({
    text: "Make a Wish",
    font: "playfair-swash",
    fontSize: 28,
    lineHeight: 1.25,
    align: "center",
    curve: "straight",
    color: "#4A2E1B",
    offsetX: 0,
    offsetY: 0,
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

  // InView Tiered Performance Hook (pauses WebGL render loop when offscreen)
  const [sectionRef, isInView] = useInView<HTMLElement>({ rootMargin: "200px" });

  // 4-Angle Blueprint Photo Capture Reference & State
  const capturePhotosRef = useRef<(() => Promise<CapturedAngles>) | null>(null);
  const [blueprintPhotos, setBlueprintPhotos] = useState<CapturedAngles | null>(null);
  const [isCapturingPhotos, setIsCapturingPhotos] = useState<boolean>(false);

  const handleOpenBlueprintWithPhotos = async () => {
    setIsCapturingPhotos(true);
    try {
      if (capturePhotosRef.current) {
        const photos = await capturePhotosRef.current();
        setBlueprintPhotos(photos);
      }
    } catch (err) {
      console.warn("Photo capture failed, falling back to blueprint schematics:", err);
    } finally {
      setIsCapturingPhotos(false);
      setShowBlueprintModal(true);
    }
  };

  // Guardrail: Auto-doweling and soft-sponge lockout for 2-Tier & size >= 20
  useEffect(() => {
    if ((shape === "two-tier" || size >= 20) && sponge === "valrhona-cacao") {
      setSponge("vanilla-genoise");
    }
  }, [shape, size, sponge]);

  // Live Itemized Bill Calculation
  const bill = useMemo(() => {
    return calculateItemizedBill({
      shape,
      size,
      dailyPortion,
      sponge,
      gelee,
      mousse,
      finish,
      pipingPosition,
      accessories,
    });
  }, [shape, size, dailyPortion, sponge, gelee, mousse, finish, pipingPosition, accessories]);

  // Step change with automatic cutaway toggle on Step 2
  const handleStepChange = (newStep: number) => {
    if (newStep === 2) {
      setIsCutawayMode(true);
    } else if (activeStep === 2 && newStep !== 2) {
      setIsCutawayMode(false);
    }
    setActiveStep(newStep);
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#FFAEC9", "#A0C4FF", "#BEE3DB", "#FFF9E6", "#FF3366"],
    });
  };

  // Instant Load Preset from Proposal Lookbook
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
    if (preset.pipingPosition) setPipingPosition(preset.pipingPosition);
    if (preset.accessories) setAccessories(preset.accessories);
    if (preset.typography) {
      setTypography((prev) => ({
        ...prev,
        ...preset.typography,
      }));
    }
    setShowPresetsDrawer(false);
    handleConfetti();
  };

  // Accessories management helpers
  const toggleAccessory = (type: AccessoryType) => {
    const existing = accessories.find((a) => a.type === type);
    if (existing) {
      setAccessories((prev) => prev.filter((a) => a.type !== type));
    } else {
      const catalog = ACCESSORY_CATALOG.find((c) => c.type === type);
      const newItem: AccessoryItem = {
        id: `acc-${Date.now()}-${type}`,
        type,
        count: catalog?.allowedCounts[0] || 1,
        layout: catalog?.defaultLayout || "center",
        scale: 1.0,
        unitPrice: catalog?.unitPrice || 15000,
        customText: type === "number-candle" ? "20" : "",
      };
      setAccessories((prev) => [...prev, newItem]);
    }
  };

  const updateAccessoryCount = (id: string, delta: number) => {
    setAccessories((prev) =>
      prev
        .map((a) => {
          if (a.id !== id) return a;
          const catalog = ACCESSORY_CATALOG.find((c) => c.type === a.type);
          const counts = catalog?.allowedCounts || [1, 2, 4, 6, 8, 12];
          const currentIdx = counts.indexOf(a.count);
          const nextIdx = Math.max(0, Math.min(counts.length - 1, currentIdx + delta));
          return { ...a, count: counts[nextIdx] };
        })
    );
  };

  const updateAccessoryLayout = (id: string, layout: AccessoryItem["layout"]) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, layout } : a))
    );
  };

  const updateAccessoryScale = (id: string, scale: number) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, scale } : a))
    );
  };

  const updateAccessoryText = (id: string, customText: string) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, customText } : a))
    );
  };

  const removeAccessory = (id: string) => {
    setAccessories((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCakeSurfaceClick = (point: [number, number, number]) => {
    const targetItem = accessories.find((a) => a.layout === "custom");
    if (!targetItem) return;

    setAccessories((prev) =>
      prev.map((a) => {
        if (a.id !== targetItem.id) return a;
        const currentPositions = a.customPositions ? [...a.customPositions] : [];
        if (currentPositions.length >= a.count) {
          return { ...a, customPositions: [point] };
        } else {
          return { ...a, customPositions: [...currentPositions, point] };
        }
      })
    );
  };

  const currentPantone =
    FROSTING_PALETTE.find((f) => f.hex === frostingColor)?.pantone || "Pantone 189 C";

  const colorHarmonies = COLOR_HARMONY_SUGGESTIONS[frostingColor] || [
    { vibe: "💖 Sweet Vibe", pipingColor: "#FFFDF5", pipingName: "Trắng", textColor: "#4A2E1B", textName: "Cacao" },
  ];

  const availableSizes = [10, 12, 14, 16, 20, 24];

  // 6-Step Stepper Definition
  const STEPS = [
    { num: 1, title: "1. Mẫu & Cốt", short: "Mẫu Bánh", icon: Boxes },
    { num: 2, title: "2. Nhân & Cắt", short: "Mặt Cắt", icon: LayersIcon },
    { num: 3, title: "3. Áo Kem", short: "Áo Kem", icon: Palette },
    { num: 4, title: "4. Viền Ren", short: "Viền Kem", icon: ChefHat },
    { num: 5, title: "5. Phụ Kiện", short: "Phụ Kiện", icon: Sparkles },
    { num: 6, title: "6. Chữ & Bút", short: "Chữ & Bút", icon: PenTool },
  ];

  return (
    <section id="cake-lab" ref={sectionRef} className="relative w-full py-24 px-4 sm:px-6 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haute Pâtisserie 3D Creative Studio V3</span>
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          3D Cake Customizer & Blueprint
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-wishes-chocolate/75 font-sans leading-relaxed">
          Quy trình <strong>6 Bước Sáng Tạo Chuyên Nghiệp</strong>: Khám phá Lookbook 12 mẫu đỉnh cao,
          10 hình thái bánh 3D, bóc tách mặt cắt chuẩn tỷ lệ, hệ thống AI gợi ý màu sắc, Studio
          phụ kiện đa điểm và bộ công cụ Typography nổi khối 3D.
        </p>

        {/* Quick Proposal Presets Trigger Button */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
            className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-wishes-chocolate border border-wishes-pink/50 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
          >
            <BookOpen className="w-4 h-4 text-wishes-cherry" />
            <span>
              {showPresetsDrawer
                ? "Đóng Thư Viện Proposal"
                : "Thư Viện 12 Mẫu Đề Cương (Curated Lookbook)"}
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
                <span>360° Real-time WebGL Studio</span>
              </span>

              <div className="flex items-center gap-2">
                {/* 4-Angle Photo Capture Button */}
                <button
                  onClick={handleOpenBlueprintWithPhotos}
                  disabled={isCapturingPhotos}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm bg-white/85 text-wishes-chocolate hover:bg-white disabled:opacity-60"
                  title="Chụp 4 góc kỹ thuật tự động cho thợ làm bánh"
                >
                  <Camera className="w-3.5 h-3.5 text-wishes-cherry" />
                  <span>{isCapturingPhotos ? "Đang chụp..." : "Chụp Hồ Sơ 4 Góc"}</span>
                </button>

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
            </div>

            {/* Dynamic Live Price & Serving Pill Badge with Interactive Popover Toggle */}
            <div className="absolute top-14 left-4 z-20 flex flex-col gap-1">
              <button
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-wishes-cherry/40 shadow-dreamy flex items-center gap-2 hover:scale-105 transition-all text-left"
              >
                <div className="w-2 h-2 rounded-full bg-wishes-cherry animate-pulse" />
                <span className="text-xs font-serif font-black text-wishes-cherry tracking-wide">
                  {bill.formattedGrandTotal}
                </span>
                <span className="text-[10px] text-stone-300 font-bold">|</span>
                <span className="text-[10px] font-bold text-wishes-chocolate/85">
                  {bill.serving}
                </span>
                <span className="text-[9px] font-bold text-wishes-cherry bg-wishes-pink/30 px-1.5 py-0.5 rounded-full ml-1">
                  Chi tiết ▾
                </span>
              </button>

              {/* Interactive Itemized Price Breakdown Popover */}
              {showPriceBreakdown && (
                <div className="w-72 mt-2 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-wishes-cherry/40 shadow-2xl text-xs text-wishes-chocolate animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-wishes-chocolate/10 font-bold">
                    <span className="text-wishes-cherry flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Bảng Kê Chi Tiết Giá
                    </span>
                    <button
                      onClick={() => setShowPriceBreakdown(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="py-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {bill.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[11px] py-0.5 border-b border-stone-100"
                      >
                        <div className="truncate pr-2">
                          <div>{item.name}</div>
                          {item.count > 1 && (
                            <div className="text-[9px] text-stone-400">
                              {item.count} × {item.unitPrice.toLocaleString("vi-VN")}đ
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 font-mono font-bold text-wishes-chocolate">
                          <span>{item.totalPrice.toLocaleString("vi-VN")}đ</span>
                          {item.removable && (
                            <button
                              onClick={() => {
                                if (item.category === "accessory") {
                                  removeAccessory(item.id);
                                } else if (item.category === "finish") {
                                  setFinish("rustic-buttercream");
                                } else if (item.category === "piping") {
                                  setPipingPosition("top-only");
                                } else if (item.id.includes("gelee")) {
                                  setGelee("strawberry-compote");
                                } else if (item.id.includes("mousse")) {
                                  setMousse("mascarpone-chantilly");
                                }
                              }}
                              className="text-stone-400 hover:text-rose-600 p-0.5"
                              title="Bỏ tùy chọn này"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-wishes-chocolate/10 flex items-center justify-between font-bold text-xs">
                    <span>TỔNG CỘNG:</span>
                    <span className="text-wishes-cherry font-serif font-black text-sm">
                      {bill.formattedGrandTotal}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Three.js Canvas */}
            <div className="absolute inset-0 z-0">
              <Canvas
                shadows
                frameloop={isInView ? "always" : "never"}
                camera={{ position: [0, 2.3, 4.6], fov: 42 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  preserveDrawingBuffer: true,
                  powerPreference: "high-performance",
                }}
                dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1}
              >
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
                <pointLight position={[-3, 3, -4]} intensity={1.4} color="#A0C4FF" />
                <pointLight position={[3, 2, -4]} intensity={1.4} color="#FFAEC9" />

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
                  pipingPosition={pipingPosition}
                  accessories={accessories}
                  isCutawayMode={isCutawayMode}
                  drawingState={drawingState}
                  typography={typography}
                  activeStep={activeStep}
                  onCakeClick={handleCakeSurfaceClick}
                />

                <PhotoCaptureHelper
                  onRegisterCapture={(fn) => {
                    capturePhotosRef.current = fn;
                  }}
                />

                <CameraRig
                  activeStep={activeStep}
                  isCutawayMode={isCutawayMode}
                  controlsRef={controlsRef}
                />

                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  minDistance={2.4}
                  maxDistance={7}
                  maxPolarAngle={Math.PI / 2 + 0.1}
                  autoRotate={!isCutawayMode && activeStep !== 6}
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
                    : shape === "cat-y2k"
                    ? "Mèo Ngầu Y2K"
                    : shape === "puppy-bow"
                    ? "Cún Tai Dài Đính Nơ"
                    : shape === "cinnamon-roll"
                    ? "Quế Cuộn Kem Chảy"
                    : shape === "croissant" || shape === "croissant-bow"
                    ? "Croissant Bơ Pháp"
                    : shape === "egg-tart"
                    ? "Tart Trứng Custard"
                    : "Bánh Quy Gấu"}
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

        {/* RIGHT COLUMN: 6-STEP ARTISAN CREATIVE STUDIO CONTROLLER (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 6-Step Stepper Header */}
          <div className="p-2.5 rounded-2xl glass-panel border border-white/80 shadow-sm flex items-center justify-between gap-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => handleStepChange(step.num)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all flex-1 ${
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
                    {step.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STEPPER BODY CARD */}
          <div className="p-6 rounded-3xl glass-panel border border-white/80 shadow-pastel transition-all">
            {/* STEP 1: MẪU & CỐT BÁNH */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                      Bước 1 / 6 • Khởi Tạo Hình Khối & Mẫu Sẵn
                    </span>
                    <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                      1. Mẫu Bánh & Cốt Bánh
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowPresetsDrawer(true)}
                    className="text-[10px] font-bold text-wishes-cherry bg-wishes-pink/30 px-2.5 py-1 rounded-lg hover:bg-wishes-pink/50 transition-all flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" /> Mẫu Có Sẵn ({PROPOSAL_PRESETS.length})
                  </button>
                </div>

                {/* 10 Pastry Shapes Categorized */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-wishes-chocolate/80">
                      Chọn 1 Trong 10 Hình Thái Bánh
                    </label>
                    <div className="flex gap-1 bg-white/70 p-0.5 rounded-lg border border-wishes-pink/30">
                      <button
                        onClick={() => {
                          setShapeCategory("celebration");
                          if (!["round", "heart", "rectangle", "two-tier", "cat-y2k", "puppy-bow"].includes(shape)) {
                            setShape("round");
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          shapeCategory === "celebration"
                            ? "bg-wishes-cherry text-white shadow-xs"
                            : "text-wishes-chocolate/70 hover:bg-white"
                        }`}
                      >
                        🎂 Celebration (6)
                      </button>
                      <button
                        onClick={() => {
                          setShapeCategory("daily");
                          if (!["cinnamon-roll", "croissant-bow", "egg-tart", "cookie-bear"].includes(shape)) {
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

                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {(shapeCategory === "celebration"
                      ? [
                          { id: "round" as CakeShape, name: "Tròn Cổ Điển", sub: "Ø 10-24cm", icon: Circle },
                          { id: "heart" as CakeShape, name: "Trái Tim Wonky", sub: "Y2K Sweetcore", icon: Heart },
                          { id: "rectangle" as CakeShape, name: "Chữ Nhật Baroque", sub: "150 × 200mm", icon: Boxes },
                          { id: "two-tier" as CakeShape, name: "2 Tầng Cung Đình", sub: "Đế 20 + Ngọn 12", icon: Cake },
                          { id: "cat-y2k" as CakeShape, name: "Mèo Ngầu Y2K", sub: "Slide 58 FU CAKE", icon: Sparkles },
                          { id: "puppy-bow" as CakeShape, name: "Cún Tai Dài Đính Nơ", sub: "Slide 59 FU CAKE", icon: Sparkles },
                        ]
                      : [
                          { id: "cookie-bear" as CakeShape, name: "Bánh Quy Gấu", sub: "Slide 42 & 62", icon: Sparkles },
                          { id: "croissant-bow" as CakeShape, name: "Croissant Thắt Nơ", sub: "Slide 45 & 64", icon: Sparkles },
                          { id: "cinnamon-roll" as CakeShape, name: "Quế Cuộn Cốm Sao", sub: "Slide 40 & 61", icon: Sparkles },
                          { id: "egg-tart" as CakeShape, name: "Tart Trứng Custard", sub: "Slide 43 & 63", icon: Sparkles },
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
                    <div className="grid grid-cols-3 gap-2">
                      {availableSizes.map((s) => {
                        const priceMap: Record<number, string> = {
                          10: "135k",
                          12: "220k",
                          14: "290k",
                          16: "360k",
                          20: "450k",
                          24: "550k",
                        };
                        const isSelected = size === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSize(s)}
                            className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between ${
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
                                {priceMap[s]}
                              </span>
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
                        Khẩu Phần Daily Baked
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
                            <span className="text-xs font-bold">{p.name}</span>
                            <span className="text-[9px] text-stone-400">{p.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Smart Pâtissier Guardrail Banner */}
                {(shape === "two-tier" || size >= 20) && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold">Smart Pâtissier Guardrail: Gia Cố Kết Cấu</div>
                      <p className="text-[10px] text-amber-800/80 leading-relaxed">
                        Tự động kích hoạt <strong>4 Trụ dowel gỗ Ø6mm</strong> chống sụt lún khi giao nhận (SOP Slide 38).
                      </p>
                    </div>
                  </div>
                )}

                {/* Sponge Flavor Selection */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Loại Cốt Bánh (Sponge Cake Type)
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
                                <span>{sp.name}</span>
                                {isChiffonLocked && (
                                  <span className="text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Khóa (Chống sụt lún)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-wishes-chocolate/70 font-normal">
                                {sp.sub}
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

            {/* STEP 2: NHÂN & MẶT CẮT 3D */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                      Bước 2 / 6 • Tự Động Bóc Tách Mặt Cắt 3D
                    </span>
                    <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                      2. Nhân Bánh & Mặt Cắt 3D
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
                    Lớp Mứt Gelée Trái Cây (Compote Layer)
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
                            <div className="text-wishes-chocolate flex items-center gap-2">
                              <span>{g.name}</span>
                              {g.surcharge ? (
                                <span className="text-[10px] font-mono text-wishes-cherry font-normal">
                                  +{g.surcharge.toLocaleString("vi-VN")}đ
                                </span>
                              ) : null}
                            </div>
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
                    Tầng Mousse Béo Ngậy (Cream Mousse Layer)
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
                            <div className="text-wishes-chocolate flex items-center gap-2">
                              <span>{m.name}</span>
                              {m.surcharge ? (
                                <span className="text-[10px] font-mono text-wishes-cherry font-normal">
                                  +{m.surcharge.toLocaleString("vi-VN")}đ
                                </span>
                              ) : null}
                            </div>
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
              </div>
            )}

            {/* STEP 3: ÁO KEM & PHỐI MÀU THẨM MỸ */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    Bước 3 / 6 • Vật Liệu SSS & Gợi Ý Phối Màu AI
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    3. Áo Kem & Phối Màu Thẩm Mỹ
                  </h3>
                </div>

                {/* Finishing Texture Style */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Trường Phái Hoàn Thiện Bề Mặt
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "rustic-buttercream" as FrostingFinish, title: "Rustic Butter", sub: "Gợn dao mộc (+0đ)" },
                      { id: "mirror-glaze" as FrostingFinish, title: "Mirror Glaze", sub: "Tráng gương (+25k)" },
                      { id: "velvet-spray" as FrostingFinish, title: "Velvet Spray", sub: "Phun nhung (+25k)" },
                      { id: "airbrush-stars" as FrostingFinish, title: "Airbrush Stars", sub: "Sao Y2K (+25k)" },
                      { id: "ombre-gradient" as FrostingFinish, title: "Ombré 2 Tầng", sub: "Loang màu (+25k)" },
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
                    Bảng Màu Chuẩn Pantone ({currentPantone})
                  </label>
                  <div className="grid grid-cols-4 gap-2">
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

                {/* AI Color Harmony Suggestions */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-wishes-pink/20 to-wishes-cream/40 border border-wishes-cherry/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-wishes-chocolate">
                    <Wand2 className="w-3.5 h-3.5 text-wishes-cherry" />
                    <span>Gợi Ý Phối Màu Thẩm Mỹ (AI Color Harmony)</span>
                  </div>
                  <p className="text-[10px] text-wishes-chocolate/70">
                    Bấm 1 chạm để áp dụng bộ màu viền kem và chữ đồng điệu, đảm bảo không bao giờ bị chói:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {colorHarmonies.map((h, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPipingColor(h.pipingColor);
                          setTypography((prev) => ({ ...prev, color: h.textColor }));
                          setDrawingState((prev) => ({ ...prev, textColor: h.textColor }));
                          handleConfetti();
                        }}
                        className="p-2 rounded-xl bg-white/90 hover:bg-white border border-wishes-pink/40 text-left transition-all hover:scale-105 shadow-2xs flex flex-col justify-between"
                      >
                        <div className="text-[10px] font-bold text-wishes-chocolate truncate">
                          {h.vibe}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: h.pipingColor }}
                            title={`Viền: ${h.pipingName}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: h.textColor }}
                            title={`Chữ: ${h.textName}`}
                          />
                          <span className="text-[9px] text-stone-500 font-bold ml-auto">Áp dụng</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: VIỀN KEM NGHỆ THUẬT LAMBETH */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                    Bước 4 / 6 • Đui Kem Wilton & Bố Cục Viền
                  </span>
                  <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                    4. Viền Hoa Kem 3D (Lambeth Piping)
                  </h3>
                </div>

                {/* Piping Nozzle Options */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Chọn Đui Bắt Kem Chuyên Dụng
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

                {/* Piping Positions (Top, Dual, Full Lambeth Swags) */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Vị Trí Phân Bổ Hoa Kem
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PIPING_POSITIONS.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setPipingPosition(pos.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex flex-col justify-between ${
                          pipingPosition === pos.id
                            ? "bg-wishes-cherry text-white border-wishes-cherry shadow-sm"
                            : "bg-white/70 text-wishes-chocolate border-wishes-pink/30 hover:bg-white"
                        }`}
                      >
                        <div>{pos.name}</div>
                        <div
                          className={`text-[9px] mt-1 ${
                            pipingPosition === pos.id ? "text-white/80" : "text-wishes-chocolate/60"
                          }`}
                        >
                          {pos.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Piping Cream Color */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Màu Kem Viền Hoa
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

            {/* STEP 5: KHO PHỤ KIỆN 3D ĐA ĐIỂM (MULTI-ACCESSORIES STUDIO) */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                      Bước 5 / 6 • Studio Phụ Kiện Đa Điểm ({accessories.length} Món Đang Chọn)
                    </span>
                    <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                      5. Kho Phụ Kiện 3D & Định Giá
                    </h3>
                  </div>
                  <span className="text-xs font-serif font-black text-wishes-cherry">
                    +
                    {accessories
                      .reduce((sum, a) => sum + a.count * a.unitPrice, 0)
                      .toLocaleString("vi-VN")}
                    đ
                  </span>
                </div>

                {/* 16-Item Accessories Catalog Grid */}
                <div>
                  <label className="text-xs font-bold text-wishes-chocolate/80 block mb-2">
                    Bấm Để Thêm / Bỏ Phụ Kiện (Có Thể Chọn Nhiều Món Cùng Lúc)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 text-xs">
                    {ACCESSORY_CATALOG.map((cat) => {
                      const activeItem = accessories.find((a) => a.type === cat.type);
                      const isActive = !!activeItem;
                      return (
                        <button
                          key={cat.type}
                          onClick={() => toggleAccessory(cat.type)}
                          className={`p-2.5 rounded-xl font-bold transition-all border text-left flex items-start justify-between gap-1.5 ${
                            isActive
                              ? "bg-white border-2 border-wishes-cherry shadow-sm"
                              : "bg-white/60 border-wishes-pink/20 hover:bg-white text-wishes-chocolate"
                          }`}
                        >
                          <div className="flex items-start gap-1.5 min-w-0">
                            <span className="text-base flex-shrink-0">{cat.icon}</span>
                            <div className="min-w-0">
                              <div className="truncate text-wishes-chocolate">{cat.name}</div>
                              <div className="text-[9.5px] font-mono text-wishes-cherry">
                                {cat.priceFormatted}
                              </div>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-wishes-cherry flex-shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Controls for Active Accessories */}
                {accessories.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-wishes-chocolate/10">
                    <label className="text-xs font-bold text-wishes-chocolate/80 block">
                      Tùy Biến Bố Cục & Số Lượng Món Đã Chọn:
                    </label>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {accessories.map((item) => {
                        const catalog = ACCESSORY_CATALOG.find((c) => c.type === item.type);
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-2xl bg-white/90 border border-wishes-pink/40 shadow-2xs space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-wishes-chocolate flex items-center gap-1.5">
                                <span>{catalog?.icon}</span>
                                <span>{catalog?.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-wishes-cherry text-[11px]">
                                  {(item.count * item.unitPrice).toLocaleString("vi-VN")}đ
                                </span>
                                <button
                                  onClick={() => removeAccessory(item.id)}
                                  className="text-stone-400 hover:text-rose-600 p-1"
                                  title="Xóa phụ kiện này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-600">Số lượng:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateAccessoryCount(item.id, -1)}
                                  className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono font-bold w-6 text-center">
                                  {item.count}
                                </span>
                                <button
                                  onClick={() => updateAccessoryCount(item.id, 1)}
                                  className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Layout Selector */}
                            <div className="flex flex-col gap-1.5 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="text-stone-600">Bố cục:</span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                  {[
                                    { id: "center" as const, label: "Tâm" },
                                    { id: "ring" as const, label: "Vòng" },
                                    { id: "corners" as const, label: "4 Góc" },
                                    { id: "front-arc" as const, label: "Cung Trước" },
                                    { id: "scatter" as const, label: "Rải Tự Nhiên" },
                                    { id: "custom" as const, label: "Chạm 3D 🎯" },
                                  ].map((l) => (
                                    <button
                                      key={l.id}
                                      onClick={() => updateAccessoryLayout(item.id, l.id)}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        item.layout === l.id
                                          ? "bg-wishes-cherry text-white"
                                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                      }`}
                                    >
                                      {l.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {item.layout === "custom" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900 flex items-center justify-between animate-pulse">
                                  <span>
                                    🎯 Chạm trực tiếp mặt bánh 3D để ghim vị trí ({item.customPositions?.length || 0} / {item.count} điểm)
                                  </span>
                                  {item.customPositions && item.customPositions.length > 0 && (
                                    <button
                                      onClick={() =>
                                        setAccessories((prev) =>
                                          prev.map((a) => (a.id === item.id ? { ...a, customPositions: [] } : a))
                                        )
                                      }
                                      className="text-[9px] underline font-bold text-amber-700 hover:text-amber-900 ml-2"
                                    >
                                      Đặt lại
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Scale Selector */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-600">Kích thước:</span>
                              <div className="flex gap-1">
                                {[
                                  { s: 0.8, label: "Nhỏ (0.8x)" },
                                  { s: 1.0, label: "Chuẩn (1.0x)" },
                                  { s: 1.2, label: "Lớn (1.2x)" },
                                ].map((sc) => (
                                  <button
                                    key={sc.s}
                                    onClick={() => updateAccessoryScale(item.id, sc.s)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      item.scale === sc.s
                                        ? "bg-wishes-chocolate text-white"
                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    }`}
                                  >
                                    {sc.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Number Input for Number Candle */}
                            {item.type === "number-candle" && (
                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="text-stone-600">Nhập số tuổi:</span>
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={item.customText || "20"}
                                  onChange={(e) => updateAccessoryText(item.id, e.target.value)}
                                  className="w-16 px-2 py-0.5 rounded-md border border-wishes-pink text-center font-bold font-mono"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: CHỮ ĐẸP & BÚT VẼ AI (TYPOGRAPHY & SMART PIPING PAD) */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="border-b border-wishes-chocolate/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                      Bước 6 / 6 • Dấu Ấn Cá Nhân & Nghệ Thuật
                    </span>
                    <h3 className="text-lg font-serif-swash font-bold text-wishes-chocolate">
                      6. Chữ Đẹp & Bút Vẽ AI
                    </h3>
                  </div>

                  {/* Sub-tab toggle */}
                  <div className="flex gap-1 bg-white/70 p-1 rounded-xl border border-wishes-pink/30">
                    <button
                      onClick={() => setStep6Tab("typography")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        step6Tab === "typography"
                          ? "bg-wishes-cherry text-white shadow-xs"
                          : "text-wishes-chocolate/70 hover:bg-white"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Xưởng Chữ</span>
                    </button>
                    <button
                      onClick={() => setStep6Tab("drawing")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        step6Tab === "drawing"
                          ? "bg-wishes-cherry text-white shadow-xs"
                          : "text-wishes-chocolate/70 hover:bg-white"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Bút Vẽ AI</span>
                    </button>
                  </div>
                </div>

                {/* TAB A: TYPOGRAPHY STUDIO */}
                {step6Tab === "typography" && (
                  <div className="space-y-3.5 text-xs">
                    {/* Multi-line Textarea */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1">
                        Nội Dung Chữ Ghi Trên Bánh (Đa Dòng)
                      </label>
                      <textarea
                        rows={2}
                        value={typography.text}
                        onChange={(e) =>
                          setTypography((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="Ví dụ: Happy Graduation\nThu Phương"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-wishes-pink/50 bg-white/80 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-serif italic"
                      />
                    </div>

                    {/* 6 Curated Fonts */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1">
                        Chọn 1 Trong 6 Font Chữ Nghệ Thuật
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {FONT_OPTIONS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setTypography((prev) => ({ ...prev, font: f.id }))}
                            className={`p-2 rounded-xl border text-left transition-all ${
                              typography.font === f.id
                                ? "bg-white border-2 border-wishes-cherry shadow-sm"
                                : "bg-white/60 border-wishes-pink/20 hover:bg-white"
                            }`}
                          >
                            <div className="font-bold text-wishes-chocolate">{f.name}</div>
                            <div className="text-[9px] text-stone-500 truncate">{f.styleName}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size & Line Height Sliders */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-wishes-chocolate/70 mb-1">
                          <span>Cỡ Chữ (Font Size)</span>
                          <span className="font-mono text-wishes-cherry">{typography.fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={14}
                          max={44}
                          value={typography.fontSize}
                          onChange={(e) =>
                            setTypography((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                          }
                          className="w-full accent-wishes-cherry cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-wishes-chocolate/70 mb-1">
                          <span>Giãn Dòng (Line Height)</span>
                          <span className="font-mono text-wishes-cherry">
                            {typography.lineHeight.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1.0}
                          max={1.8}
                          step={0.1}
                          value={typography.lineHeight}
                          onChange={(e) =>
                            setTypography((prev) => ({
                              ...prev,
                              lineHeight: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-wishes-cherry cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Text Alignment & Curve Mode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1">
                          Căn Lề
                        </label>
                        <div className="flex gap-1 bg-white/70 p-0.5 rounded-xl border border-wishes-pink/30">
                          {(["left", "center", "right"] as const).map((al) => (
                            <button
                              key={al}
                              onClick={() => setTypography((prev) => ({ ...prev, align: al }))}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize ${
                                typography.align === al
                                  ? "bg-wishes-cherry text-white"
                                  : "text-stone-600 hover:bg-white"
                              }`}
                            >
                              {al === "left" ? "Trái" : al === "center" ? "Giữa" : "Phải"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70 block mb-1">
                          Kiểu Uốn Chữ
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { id: "straight" as const, label: "Thẳng" },
                            { id: "arc-top" as const, label: "Cung Trên" },
                            { id: "arc-bottom" as const, label: "Cung Dưới" },
                            { id: "plaque" as const, label: "Bảng Socola" },
                          ].map((cv) => (
                            <button
                              key={cv.id}
                              onClick={() => setTypography((prev) => ({ ...prev, curve: cv.id }))}
                              className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center ${
                                typography.curve === cv.id
                                  ? "bg-wishes-cherry text-white"
                                  : "bg-white/70 text-stone-600 hover:bg-white border border-wishes-pink/20"
                              }`}
                            >
                              {cv.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Position Presets and Fine Offset */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wishes-chocolate/70">
                          Vị Trí Chữ Trên Mặt Bánh
                        </label>
                        <div className="flex gap-1">
                          {[
                            { label: "Đỉnh", y: -30 },
                            { label: "Tâm", y: 0 },
                            { label: "Đáy", y: 30 },
                          ].map((p) => (
                            <button
                              key={p.label}
                              onClick={() =>
                                setTypography((prev) => ({ ...prev, offsetX: 0, offsetY: p.y }))
                              }
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-[9px] font-bold hover:bg-stone-200"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-stone-500 w-8">Trái/Phải:</span>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            value={typography.offsetX}
                            onChange={(e) =>
                              setTypography((prev) => ({ ...prev, offsetX: Number(e.target.value) }))
                            }
                            className="flex-1 accent-wishes-cherry cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-stone-500 w-8">Lên/Xuống:</span>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            value={typography.offsetY}
                            onChange={(e) =>
                              setTypography((prev) => ({ ...prev, offsetY: Number(e.target.value) }))
                            }
                            className="flex-1 accent-wishes-cherry cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB B: EXPANDED SMART PIPING PAD */}
                {step6Tab === "drawing" && (
                  <SmartPipingPad
                    drawingState={drawingState}
                    onUpdateDrawing={setDrawingState}
                    cakeColor={frostingColor}
                    cakeSize={size}
                    cakeShape={shape}
                    accessories={accessories}
                    typography={typography}
                  />
                )}

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
                    placeholder="Lời chúc đính kèm (hóa đơn & thiệp)..."
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
                Bước {activeStep} / 6
              </span>

              {activeStep < 6 ? (
                <button
                  onClick={() => handleStepChange(Math.min(6, activeStep + 1))}
                  className="px-4 py-2 rounded-xl bg-wishes-cherry text-white text-xs font-bold hover:bg-wishes-cherry/90 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Tiếp Tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleOpenBlueprintWithPhotos();
                    handleConfetti();
                  }}
                  disabled={isCapturingPhotos}
                  className="px-4 py-2 rounded-xl candy-btn text-xs font-bold flex items-center gap-1.5 shadow-pastel disabled:opacity-60"
                >
                  <Award className="w-4 h-4 text-wishes-cherry" />
                  <span>{isCapturingPhotos ? "Đang Chụp 4 Góc..." : "Hoàn Tất & Xem Blueprint"}</span>
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
                handleOpenBlueprintWithPhotos();
                handleConfetti();
              }}
              disabled={isCapturingPhotos}
              className="py-3 px-2 rounded-2xl bg-wishes-blue/25 border border-wishes-blue hover:bg-wishes-blue/40 text-xs font-bold text-wishes-chocolate flex flex-col items-center justify-center gap-1 shadow-sm transition-all disabled:opacity-60"
            >
              <FileText className="w-4 h-4 text-wishes-chocolate" />
              <span>{isCapturingPhotos ? "Đang Chụp..." : "Bản Vẽ Cho Thợ Bánh"}</span>
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
                    : shape === "cat-y2k"
                    ? "🐱"
                    : shape === "puppy-bow"
                    ? "🐶"
                    : shape === "cinnamon-roll"
                    ? "🧁"
                    : shape === "croissant" || shape === "croissant-bow"
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
                    : shape === "cat-y2k"
                    ? "Cool Cat Y2K"
                    : shape === "puppy-bow"
                    ? "Puppy Bow"
                    : shape === "cinnamon-roll"
                    ? "Cinnamon Roll"
                    : shape === "croissant" || shape === "croissant-bow"
                    ? "French Croissant"
                    : shape === "egg-tart"
                    ? "Custard Egg Tart"
                    : "Artisanal Cookie"}{" "}
                  • {size}cm
                </div>
                <div className="text-[10px] text-wishes-chocolate/70">{currentPantone}</div>
              </div>

              <div>
                <p className="text-xs font-serif-swash italic text-wishes-cherry mb-1">
                  Thân tặng {customerName || "Bồ Công Anh"}
                </p>
                <p className="text-xs font-sans text-wishes-chocolate/85 px-2">
                  "{typography.text || wishText || "Make a Wish"}"
                </p>
                <div className="mt-4 pt-3 border-t border-wishes-chocolate/15 flex items-center justify-between text-[8px] text-wishes-chocolate/60">
                  <span>GFA26GD60 • WISHES 3D</span>
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
              {bill.lineItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate pr-2">
                    {item.count > 1 ? `${item.count}× ` : ""}
                    {item.name}
                  </span>
                  <span className="font-bold text-wishes-chocolate flex-shrink-0">
                    {item.totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}

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
                <span className="text-wishes-cherry font-mono font-black">{bill.formattedGrandTotal}</span>
              </div>
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
        pipingPosition={pipingPosition}
        accessories={accessories}
        typography={typography}
        customerName={customerName}
        wishText={wishText}
        handwrittenText={typography.text || drawingState.customText || drawingState.presetText}
        aestheticScore={98}
        estimatedPrice={bill.formattedGrandTotal}
        lineItems={bill.lineItems}
        blueprintPhotos={blueprintPhotos}
      />
    </section>
  );
}
