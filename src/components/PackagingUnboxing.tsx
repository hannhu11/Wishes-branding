"use client";
import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Sparkles,
  Box,
  Layers,
  Sliders,
  RotateCcw,
  Ruler,
  FileDown,
  Eye,
  Scissors,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";

// --- 3D HOUSE-SHAPED CAKE BOX IN THREE.JS (SLIDE 74 PROPOSAL) ---

function HouseBox3DMesh({
  progress, // 0 to 100
}: {
  progress: number;
}) {
  const boxGroupRef = useRef<THREE.Group>(null);

  // Unboxing calculations
  // 0-25%: Ribbon untying
  const ribbonLift = Math.min(Math.max((progress - 10) / 20, 0), 1);
  const ribbonOpacity = Math.max(1 - ribbonLift * 1.5, 0);

  // 25-70%: Roof flaps opening
  const roofOpenRatio = Math.min(Math.max((progress - 25) / 45, 0), 1);
  const leftFlapAngle = -roofOpenRatio * (Math.PI * 0.42); // opens outwards left
  const rightFlapAngle = roofOpenRatio * (Math.PI * 0.42); // opens outwards right

  // 60-100%: Tray ascension
  const trayAscentRatio = Math.min(Math.max((progress - 60) / 40, 0), 1);
  const trayY = -0.4 + trayAscentRatio * 1.1;

  useFrame((state) => {
    if (!boxGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    boxGroupRef.current.position.y = Math.sin(t * 1.0) * 0.03;
  });

  const gableShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.0, 0);
    s.lineTo(1.0, 0);
    s.lineTo(0, 0.7);
    s.closePath();
    return s;
  }, []);

  const gableGeom = useMemo(() => {
    return new THREE.ExtrudeGeometry(gableShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
  }, [gableShape]);

  return (
    <group ref={boxGroupRef} position={[0, -0.3, 0]}>
      {/* 1. MAIN BOX LOWER BASE (Hộp quà rỗng mở nắp cao cấp) */}
      <group>
        {/* Đáy hộp */}
        <mesh position={[0, -0.88, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.04, 2.0]} />
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Thành trước */}
        <mesh position={[0, -0.3, 0.98]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.2, 0.04]} />
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Thành sau */}
        <mesh position={[0, -0.3, -0.98]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.2, 0.04]} />
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Thành trái */}
        <mesh position={[-0.98, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 1.2, 1.96]} />
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Thành phải */}
        <mesh position={[0.98, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 1.2, 1.96]} />
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} metalness={0.05} />
        </mesh>
      </group>

      {/* Boutique Awning Stripes on Box Front */}
      <mesh position={[0, -0.3, 1.01]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial color="#FFFFFF" opacity={0.3} transparent />
      </mesh>

      {/* Gold Foil Logo Stamping on Front Face */}
      <mesh position={[0, -0.2, 1.02]}>
        <planeGeometry args={[0.9, 0.35]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.15}
          emissive="#554400"
        />
      </mesh>

      {/* 2. INNER SLIDING TRAY & SURPRISE SIGNATURE CAKE */}
      <group position={[0, trayY, 0]}>
        {/* Tray Base */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.75, 0.12, 1.75]} />
          <meshStandardMaterial color="#FFF9E6" roughness={0.5} />
        </mesh>

        {/* Front Satin Ribbon Tag on Tray */}
        <mesh position={[0, 0.06, 0.88]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.14]} />
          <meshPhysicalMaterial color="#A0C4FF" roughness={0.3} sheen={1} />
        </mesh>

        {/* Signature Celebration Cake inside tray (Cotton Candy Pink with Lambeth white trim & ruby cherry) */}
        <group position={[0, 0.32, 0]} scale={[0.55, 0.55, 0.55]}>
          {/* Main Cake Body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.0, 1.0, 0.65, 32]} />
            <meshPhysicalMaterial
              color="#FFAEC9"
              roughness={0.28}
              clearcoat={0.35}
              sheen={0.6}
              sheenColor={new THREE.Color("#FFF5EA")}
            />
          </mesh>

          {/* Lambeth White Cream Piping Ring */}
          <mesh position={[0, 0.33, 0]} castShadow>
            <torusGeometry args={[0.92, 0.06, 12, 32]} />
            <meshPhysicalMaterial color="#FFFDF5" roughness={0.25} clearcoat={0.3} />
          </mesh>

          {/* Glossy Ruby Cherry with Stem on Top */}
          <mesh position={[0, 0.44, 0]} castShadow>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshPhysicalMaterial
              color="#E6194B"
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.03}
            />
          </mesh>
          {/* Cherry Stem */}
          <mesh position={[0.02, 0.58, 0]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <meshStandardMaterial color="#5C8001" roughness={0.4} />
          </mesh>
        </group>

        {/* Golden Wishes Enamel Pin neatly resting on the front ribbon tag without clipping */}
        <group position={[0, 0.14, 0.88]} rotation={[-0.15, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
            <meshStandardMaterial color="#FFDF00" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.008, 24]} />
            <meshPhysicalMaterial color="#FFFDF5" roughness={0.1} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, 0.018, 0]}>
            <boxGeometry args={[0.05, 0.005, 0.05]} />
            <meshPhysicalMaterial color="#FF3366" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 3. ROOF LEFT FLAP (Smooth pivot around top left wall hinge x = -1.0, y = 0.3) */}
      <group position={[-1.0, 0.3, 0]} rotation={[0, 0, leftFlapAngle * 1.8]}>
        {/* Sloped roof panel extending to center ridge */}
        <mesh position={[0.55, 0.38, 0]} rotation={[0, 0, 0.61]} castShadow receiveShadow>
          <boxGeometry args={[1.22, 0.05, 2.0]} />
          <meshPhysicalMaterial color="#FFAEC9" roughness={0.35} clearcoat={0.15} />
        </mesh>
      </group>

      {/* 4. ROOF RIGHT FLAP (Smooth pivot around top right wall hinge x = 1.0, y = 0.3) */}
      <group position={[1.0, 0.3, 0]} rotation={[0, 0, rightFlapAngle * 1.8]}>
        {/* Sloped roof panel extending to center ridge */}
        <mesh position={[-0.55, 0.38, 0]} rotation={[0, 0, -0.61]} castShadow receiveShadow>
          <boxGeometry args={[1.22, 0.05, 2.0]} />
          <meshPhysicalMaterial color="#FFAEC9" roughness={0.35} clearcoat={0.15} />
        </mesh>
      </group>

      {/* 5. GABLE TRIANGULAR WALLS (Attached solidly to front and back house walls) */}
      <group position={[0, 0.3, 0]}>
        {/* Front Gable Wall with boutique Heart Window */}
        <mesh geometry={gableGeom} position={[0, 0, 0.96]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} />
        </mesh>
        {/* Gold Foil Heart Emblem on Front Gable */}
        <mesh position={[0, 0.28, 1.01]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Back Gable Wall */}
        <mesh geometry={gableGeom} position={[0, 0, -1.0]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFAEC9" roughness={0.35} />
        </mesh>
      </group>

      {/* 6. SATIN RIBBON BOW ON ROOFTOP (Nơ lụa satin xanh) */}
      {ribbonOpacity > 0.01 && (
        <group position={[0, 0.82 + ribbonLift * 1.4, 0]}>
          {/* Bow loops */}
          <mesh rotation={[0, 0, 0.3]} castShadow>
            <torusGeometry args={[0.26, 0.06, 16, 24]} />
            <meshStandardMaterial
              color="#A0C4FF"
              roughness={0.25}
              transparent
              opacity={ribbonOpacity}
            />
          </mesh>
          <mesh rotation={[0, 0, -0.3]} castShadow>
            <torusGeometry args={[0.26, 0.06, 16, 24]} />
            <meshStandardMaterial
              color="#A0C4FF"
              roughness={0.25}
              transparent
              opacity={ribbonOpacity}
            />
          </mesh>
          {/* Ribbon center knot */}
          <mesh castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={ribbonOpacity}
            />
          </mesh>
        </group>
      )}

      {/* Floating 3D State Annotation Callout */}
      <Html position={[0, 1.8, 0]} center>
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-wishes-pink shadow-md text-[10px] font-bold text-wishes-chocolate whitespace-nowrap">
          {progress > 85
            ? "🎉 Khay bánh & Enamel Pin lộ diện hoàn toàn!"
            : progress > 50
            ? "📖 Mái nhà đang mở góc 75°..."
            : progress > 20
            ? "🎀 Dải ruy-băng lụa đã được tháo nút"
            : "📦 Hộp đóng kín sẵn sàng mở"}
        </div>
      </Html>
    </group>
  );
}

// --- MAIN PACKAGING UNBOXING COMPONENT ---

import { useInView } from "./common/useInView";

export default function PackagingUnboxing() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ rootMargin: "200px 0px" });
  const [unboxingProgress, setUnboxingProgress] = useState<number>(35); // 0 to 100%
  const [isBlueprintMode, setIsBlueprintMode] = useState<boolean>(false);

  // Technical Blueprint Layer Toggles
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [showCreaseLines, setShowCreaseLines] = useState<boolean>(true);
  const [showFoilMask, setShowFoilMask] = useState<boolean>(true);
  const [showDimensionLabels, setShowDimensionLabels] = useState<boolean>(true);

  const handleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#FFAEC9", "#A0C4FF", "#FFD700", "#FFF9E6"],
    });
  };

  return (
    <section ref={sectionRef} id="packaging" className="relative w-full py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-block mb-3">
          3D Packaging Unboxing & Engineering
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          Bao Bì 3D & Bản Vẽ Cấn Bế Dieline
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-wishes-chocolate/75 font-sans">
          Mô hình 3D thực thụ của <strong>Hộp Bánh Ngôi Nhà</strong> (Slide 74) với cơ chế mở nắp điện
          ảnh 3 giai đoạn và công tắc chuyển đổi sang <strong>Bản Vẽ Kỹ Thuật Cấn Bế (Dieline Blueprint)</strong> phục
          vụ gia công in ấn thực tế.
        </p>

        {/* Mode Switch Buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsBlueprintMode(false)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              !isBlueprintMode
                ? "candy-btn scale-105 shadow-pastel"
                : "glass-panel text-wishes-chocolate/70 hover:bg-white"
            }`}
          >
            <Box className="w-4 h-4 text-wishes-cherry" />
            <span>Mô Hình 3D WebGL (Unboxing)</span>
          </button>

          <button
            onClick={() => {
              setIsBlueprintMode(true);
              handleConfetti();
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              isBlueprintMode
                ? "bg-wishes-blue text-wishes-chocolate border border-white scale-105 shadow-md"
                : "glass-panel text-wishes-chocolate/70 hover:bg-white"
            }`}
          >
            <Layers className="w-4 h-4 text-wishes-blue" />
            <span>Bản Vẽ Kỹ Thuật Cấn Bế (Dieline)</span>
          </button>
        </div>
      </div>

      {/* --- MODE 1: 3D WEBGL BOX UNBOXING STAGE --- */}
      {!isBlueprintMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Three.js Box Canvas (7 Cols) */}
          <div className="lg:col-span-7 relative w-full aspect-square sm:aspect-[4/3] rounded-3xl glass-panel shadow-dreamy border border-white/80 overflow-hidden flex flex-col justify-between p-4">
            {/* Top Indicator */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-wishes-chocolate shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>360° Interactive Box Turntable</span>
              </span>
              <button
                onClick={() => setUnboxingProgress(unboxingProgress === 100 ? 0 : 100)}
                className="px-3 py-1 rounded-full bg-white/85 text-[10px] font-bold text-wishes-chocolate shadow-sm hover:bg-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-wishes-cherry" />
                <span>{unboxingProgress === 100 ? "Đóng Hộp Lại" : "Mở Bung Hết"}</span>
              </button>
            </div>

            {/* Three.js Canvas Container */}
            <div className="absolute inset-0 z-0">
              <Canvas
                shadows
                camera={{ position: [0, 2.5, 4.8], fov: 42 }}
                frameloop={isInView ? "always" : "never"}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              >
                <ambientLight intensity={1.1} />
                <directionalLight
                  position={[5, 8, 4]}
                  intensity={1.8}
                  color="#FFFDF5"
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-4, 3, -3]} intensity={2.0} color="#FFAEC9" />
                <pointLight position={[3, -2, -2]} intensity={1.5} color="#A0C4FF" />

                <HouseBox3DMesh progress={unboxingProgress} />

                <OrbitControls
                  enableZoom={true}
                  minDistance={3.2}
                  maxDistance={7}
                  maxPolarAngle={Math.PI / 2 + 0.1}
                />
              </Canvas>
            </div>

            {/* Bottom Spec Tag */}
            <div className="flex items-center justify-between z-10">
              <div className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-wishes-chocolate shadow-sm flex items-center gap-1.5">
                <Ruler className="w-3 h-3 text-wishes-cherry" />
                <span>220 × 220 × 250 mm | Giấy Ivory 350gsm</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-amber-700 shadow-sm flex items-center gap-1.5">
                <span>✨ Ép Kim Nhũ Vàng 24K</span>
              </div>
            </div>
          </div>

          {/* Unboxing Slider & Milestones (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/80 shadow-pastel">
              <h3 className="text-xl font-serif-swash font-bold text-wishes-chocolate mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-wishes-cherry" />
                <span>Thanh Điều Khiển Mở Hộp</span>
              </h3>
              <p className="text-xs text-wishes-chocolate/75 mb-6">
                Kéo thanh trượt để trải nghiệm từng giai đoạn bóc tách cấu trúc bao bì Origami:
              </p>

              {/* Progress Slider */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-xs font-bold text-wishes-chocolate">
                  <span>Tiến trình Unboxing</span>
                  <span className="text-wishes-cherry">{unboxingProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={unboxingProgress}
                  onChange={(e) => setUnboxingProgress(Number(e.target.value))}
                  className="w-full h-2.5 bg-wishes-pink/30 rounded-lg appearance-none cursor-pointer accent-wishes-cherry"
                />
              </div>

              {/* Step by Step Milestones */}
              <div className="space-y-3">
                <div
                  onClick={() => setUnboxingProgress(25)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    unboxingProgress >= 25
                      ? "bg-wishes-pink/20 border-wishes-pink text-wishes-chocolate font-bold"
                      : "bg-white/40 border-transparent text-wishes-chocolate/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      unboxingProgress >= 25
                        ? "bg-wishes-cherry text-white"
                        : "bg-black/10 text-black/40"
                    }`}
                  >
                    1
                  </div>
                  <div className="text-xs">
                    <div>Tháo Ruy-băng Lụa Satin</div>
                    <div className="text-[10px] font-normal opacity-75">Nơ lụa xanh tuột nút bay lên</div>
                  </div>
                </div>

                <div
                  onClick={() => setUnboxingProgress(65)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    unboxingProgress >= 65
                      ? "bg-wishes-pink/20 border-wishes-pink text-wishes-chocolate font-bold"
                      : "bg-white/40 border-transparent text-wishes-chocolate/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      unboxingProgress >= 65
                        ? "bg-wishes-cherry text-white"
                        : "bg-black/10 text-black/40"
                    }`}
                  >
                    2
                  </div>
                  <div className="text-xs">
                    <div>Mở Tung 2 Mái Nhà Tam Giác</div>
                    <div className="text-[10px] font-normal opacity-75">Cánh mái nhà hé mở góc 75°</div>
                  </div>
                </div>

                <div
                  onClick={() => setUnboxingProgress(100)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    unboxingProgress >= 100
                      ? "bg-wishes-pink/20 border-wishes-pink text-wishes-chocolate font-bold"
                      : "bg-white/40 border-transparent text-wishes-chocolate/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      unboxingProgress >= 100
                        ? "bg-wishes-cherry text-white"
                        : "bg-black/10 text-black/40"
                    }`}
                  >
                    3
                  </div>
                  <div className="text-xs">
                    <div>Khay Đựng Bánh Trượt Lên Bệ</div>
                    <div className="text-[10px] font-normal opacity-75">Bánh sinh nhật & Enamel Pin xuất hiện</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- MODE 2: INTERACTIVE DIELINE BLUEPRINT TECHNICAL VIEWER --- */
        <div className="p-6 sm:p-10 rounded-3xl glass-panel shadow-dreamy border-2 border-wishes-blue/40 flex flex-col gap-8">
          {/* Blueprint Header & Layer Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-wishes-chocolate/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-wishes-blue bg-wishes-blue/20 px-3 py-1 rounded-full">
                Engineering Specification • Dieline Sheet
              </span>
              <h3 className="text-2xl font-serif-swash font-bold text-wishes-chocolate mt-1">
                Bản Vẽ Kỹ Thuật Trải Phẳng Hộp Ngôi Nhà (Dieline Blueprint)
              </h3>
            </div>

            {/* Layer Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCutLines(!showCutLines)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  showCutLines
                    ? "bg-red-500/10 border-red-500 text-red-600 shadow-sm"
                    : "bg-white/50 border-black/10 text-black/40"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Đường Cắt Bế (Cut Line)</span>
              </button>

              <button
                onClick={() => setShowCreaseLines(!showCreaseLines)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  showCreaseLines
                    ? "bg-blue-500/10 border-blue-500 text-blue-600 shadow-sm"
                    : "bg-white/50 border-black/10 text-black/40"
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Đường Cấn Gập (Crease)</span>
              </button>

              <button
                onClick={() => setShowFoilMask(!showFoilMask)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  showFoilMask
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 shadow-sm"
                    : "bg-white/50 border-black/10 text-black/40"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vùng Ép Kim Vàng</span>
              </button>
            </div>
          </div>

          {/* SVG Vector Dieline Technical Blueprint Diagram */}
          <div className="relative w-full aspect-[16/10] bg-white rounded-2xl border border-wishes-chocolate/15 p-6 flex items-center justify-center overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full max-h-[460px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F0EBE1" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="500" fill="url(#grid)" />

              {/* --- 1. BOX MAIN PANELS --- */}
              {/* Center Base Panel */}
              <rect
                x="280"
                y="180"
                width="240"
                height="160"
                fill="#FFF9E6"
                stroke={showCutLines ? "#E60033" : "none"}
                strokeWidth="2"
              />
              <text x="400" y="265" textAnchor="middle" fill="#4A2E1B" fontSize="12" fontWeight="bold">
                ĐÁY HỘP (220 × 220 mm)
              </text>

              {/* Front Panel */}
              <rect
                x="280"
                y="340"
                width="240"
                height="120"
                fill="#FFAEC9"
                fillOpacity="0.35"
                stroke={showCutLines ? "#E60033" : "none"}
                strokeWidth="2"
              />
              <text x="400" y="405" textAnchor="middle" fill="#4A2E1B" fontSize="11" fontWeight="bold">
                MẶT TRƯỚC (H 140 mm)
              </text>

              {/* Back Panel */}
              <rect
                x="280"
                y="60"
                width="240"
                height="120"
                fill="#FFAEC9"
                fillOpacity="0.35"
                stroke={showCutLines ? "#E60033" : "none"}
                strokeWidth="2"
              />
              <text x="400" y="125" textAnchor="middle" fill="#4A2E1B" fontSize="11" fontWeight="bold">
                MẶT SAU (H 140 mm)
              </text>

              {/* Left Panel + Triangular Gable */}
              <path
                d="M 280 180 L 160 180 L 160 260 L 100 260 L 160 260 L 160 340 L 280 340 Z"
                fill="#A0C4FF"
                fillOpacity="0.35"
                stroke={showCutLines ? "#E60033" : "none"}
                strokeWidth="2"
              />
              <text x="210" y="265" textAnchor="middle" fill="#4A2E1B" fontSize="10" fontWeight="bold">
                VÁCH TRÁI
              </text>

              {/* Right Panel + Triangular Gable */}
              <path
                d="M 520 180 L 640 180 L 640 260 L 700 260 L 640 260 L 640 340 L 520 340 Z"
                fill="#A0C4FF"
                fillOpacity="0.35"
                stroke={showCutLines ? "#E60033" : "none"}
                strokeWidth="2"
              />
              <text x="590" y="265" textAnchor="middle" fill="#4A2E1B" fontSize="10" fontWeight="bold">
                VÁCH PHẢI
              </text>

              {/* --- 2. CREASE / SCORE FOLD LINES (Dashed Blue Lines) --- */}
              {showCreaseLines && (
                <g stroke="#0066FF" strokeWidth="1.8" strokeDasharray="6,4">
                  {/* Base Hinge Lines */}
                  <line x1="280" y1="180" x2="520" y2="180" />
                  <line x1="280" y1="340" x2="520" y2="340" />
                  <line x1="280" y1="180" x2="280" y2="340" />
                  <line x1="520" y1="180" x2="520" y2="340" />

                  {/* Roof Flap Fold Lines */}
                  <line x1="280" y1="60" x2="520" y2="60" />
                  <line x1="280" y1="460" x2="520" y2="460" />
                </g>
              )}

              {/* --- 3. GOLD FOIL STAMPING MASK (Hot Foil Zone) --- */}
              {showFoilMask && (
                <g fill="#D4AF37" stroke="#997A15" strokeWidth="1.2">
                  <rect x="340" y="380" width="120" height="40" rx="6" />
                  <text
                    x="400"
                    y="405"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    letterSpacing="2"
                  >
                    WISHES
                  </text>
                  <circle cx="355" cy="400" r="4" fill="#FFFFFF" />
                  <circle cx="445" cy="400" r="4" fill="#FFFFFF" />
                </g>
              )}

              {/* --- 4. DIMENSION LABELS --- */}
              {showDimensionLabels && (
                <g fill="#4A2E1B" fontSize="9" fontWeight="bold">
                  {/* Horizontal Width */}
                  <line x1="280" y1="35" x2="520" y2="35" stroke="#4A2E1B" strokeWidth="1" />
                  <circle cx="280" cy="35" r="2.5" />
                  <circle cx="520" cy="35" r="2.5" />
                  <text x="400" y="30" textAnchor="middle">
                    220 mm (Chiều rộng thân hộp)
                  </text>

                  {/* Vertical Total Height */}
                  <line x1="740" y1="60" x2="740" y2="460" stroke="#4A2E1B" strokeWidth="1" />
                  <circle cx="740" cy="60" r="2.5" />
                  <circle cx="740" cy="460" r="2.5" />
                  <text x="755" y="265" textAnchor="start" transform="rotate(90, 755, 265)">
                    440 mm (Khổ trải dài)
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Dieline Legend & Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/70 border border-wishes-chocolate/10 text-xs space-y-1">
              <div className="font-bold text-red-600 flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-600 inline-block" />
                <span>Đường Cắt Bế (Cut Line)</span>
              </div>
              <p className="text-[10px] text-wishes-chocolate/70">
                Dao bế cắt đứt hoàn toàn viền ngoài khổ trải 580 × 440 mm.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-wishes-chocolate/10 text-xs space-y-1">
              <div className="font-bold text-blue-600 flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-blue-600 inline-block" />
                <span>Đường Cấn Gập (Crease)</span>
              </div>
              <p className="text-[10px] text-wishes-chocolate/70">
                Dao gân tạo nếp gấp Origami sắc nét, không gãy vỡ thớ giấy 350gsm.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-wishes-chocolate/10 text-xs space-y-1">
              <div className="font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>Ép Kim Nhũ Vàng (Foil)</span>
              </div>
              <p className="text-[10px] text-wishes-chocolate/70">
                Vùng dập nổi nhiệt lá nhũ vàng 24K logo Wishes mặt chính diện.
              </p>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => {
                  alert("Đã tải tệp Bản Vẽ Kỹ Thuật Dieline Blueprint (Vector SVG/PDF) thành công!");
                }}
                className="w-full py-3 rounded-2xl candy-btn text-xs font-bold flex items-center justify-center gap-2 shadow-pastel"
              >
                <FileDown className="w-4 h-4 text-wishes-cherry" />
                <span>Tải File Vector Dieline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
