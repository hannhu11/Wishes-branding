"use client";
import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { Sparkles, Send, Heart, Star, MessageCircle, Music, Volume2, Globe } from "lucide-react";

interface CommunityWish {
  id: string;
  author: string;
  wish: string;
  time: string;
  starColor: string;
  position: [number, number, number];
}

const INITIAL_WISHES: CommunityWish[] = [
  {
    id: "w1",
    author: "Hội Đồng FPT",
    wish: "Chúc đồ án Wishes bảo vệ thành công rực rỡ và sớm trở thành thương hiệu pastry thực tế!",
    time: "Hôm nay",
    starColor: "#FFAEC9",
    position: [0.8, 0.4, 0.6],
  },
  {
    id: "w2",
    author: "Thy (Graphic Designer)",
    wish: "Bánh xinh xỉu! Rất thích phong cách Wonky Cake và màu pastel này!",
    time: "Hôm nay",
    starColor: "#A0C4FF",
    position: [-1.2, 0.7, -0.5],
  },
  {
    id: "w3",
    author: "Hằng (Flight Attendant)",
    wish: "Hộp quà ngôi nhà nhìn cưng quá, ước gì có thể đặt tặng sinh nhật ngay!",
    time: "Hôm qua",
    starColor: "#FFD166",
    position: [1.3, -0.6, -0.8],
  },
  {
    id: "w4",
    author: "Thầy Hướng Dẫn",
    wish: "Concept hoàn chỉnh, tính thẩm mỹ cao và ứng dụng 3D rất mượt mà. Xuất sắc!",
    time: "Hôm qua",
    starColor: "#BEE3DB",
    position: [-0.9, -0.5, 1.1],
  },
  {
    id: "w5",
    author: "Minh Anh (Art Director)",
    wish: "Subsurface scattering trên kem bơ nhìn ngon mắt thật sự. Đồ án rất chỉn chu!",
    time: "Vừa xong",
    starColor: "#FF3366",
    position: [0.2, 1.1, -1.0],
  },
];

// --- 3D CELESTIAL MOBIUS RIBBON GALAXY ---

function CelestialRibbonGalaxy({
  wishes,
  selectedWishId,
  onSelectWish,
}: {
  wishes: CommunityWish[];
  selectedWishId: string | null;
  onSelectWish: (wish: CommunityWish) => void;
}) {
  const galaxyRef = useRef<THREE.Group>(null);

  // Procedural 3D Ribbon Tube following a 3D infinity knot (CatmullRomCurve3)
  const ribbonGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 2;
      const x = Math.sin(u) * 2.2;
      const y = Math.sin(u * 2) * 0.75;
      const z = Math.cos(u) * 1.8;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
    return new THREE.TubeGeometry(curve, 100, 0.08, 16, true);
  }, []);

  useFrame((state) => {
    if (!galaxyRef.current) return;
    const t = state.clock.getElapsedTime();
    galaxyRef.current.rotation.y = t * 0.15;
    galaxyRef.current.rotation.x = Math.sin(t * 0.1) * 0.08;
  });

  return (
    <group ref={galaxyRef}>
      {/* 1. Undulating Silk Ribbon Mesh */}
      <mesh geometry={ribbonGeometry}>
        <meshPhysicalMaterial
          color="#FFAEC9"
          emissive="#331122"
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* 2. Secondary Ethereal Blue Glow Ribbon */}
      <mesh geometry={ribbonGeometry} scale={[1.05, 1.05, 1.05]}>
        <meshBasicMaterial color="#A0C4FF" wireframe transparent opacity={0.15} />
      </mesh>

      {/* 3. Community Wish Crystal Stars Attached in 3D Space */}
      {wishes.map((w) => {
        const isSelected = selectedWishId === w.id;
        return (
          <group
            key={w.id}
            position={w.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWish(w);
            }}
          >
            <Float speed={3} rotationIntensity={0.6} floatIntensity={0.4}>
              {/* Outer Glow Halo */}
              <Sphere args={[isSelected ? 0.22 : 0.14, 24, 24]}>
                <meshStandardMaterial
                  color={w.starColor}
                  emissive={w.starColor}
                  emissiveIntensity={isSelected ? 3.5 : 1.8}
                  roughness={0.1}
                />
              </Sphere>

              {/* Interactive Cursor Indicator Tooltip */}
              <Html position={[0, 0.35, 0]} center distanceFactor={8}>
                <div
                  className={`cursor-pointer px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap transition-all shadow-md ${
                    isSelected
                      ? "bg-wishes-cherry text-white scale-125 ring-2 ring-white"
                      : "bg-white/80 text-wishes-chocolate hover:bg-white hover:scale-110"
                  }`}
                >
                  ✨ {w.author}
                </div>
              </Html>
            </Float>
          </group>
        );
      })}

      {/* 4. Ambient Stardust Particles */}
      {Array.from({ length: 45 }).map((_, i) => {
        const angle = (i / 45) * Math.PI * 2;
        const r = 2.4 + Math.sin(i) * 0.8;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              (Math.sin(i * 3) * 1.2),
              Math.sin(angle) * r,
            ]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#FFD166" : "#FFF9E6"} />
          </mesh>
        );
      })}
    </group>
  );
}

// --- MAIN WISHING WELL COMPONENT ---

import { useInView } from "./common/useInView";

export default function WishingWell() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ rootMargin: "200px 0px" });
  const [authorName, setAuthorName] = useState("");
  const [wishText, setWishText] = useState("");
  const [wishes, setWishes] = useState<CommunityWish[]>(INITIAL_WISHES);
  const [selectedWish, setSelectedWish] = useState<CommunityWish | null>(INITIAL_WISHES[0]);

  // Web Audio Synthesized Crystal Chime
  const playCrystalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Crystal chime chord progression (C6 - G6)
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    // Random coordinates along the 3D galaxy
    const randomAngle = Math.random() * Math.PI * 2;
    const randomX = Math.sin(randomAngle) * 1.8;
    const randomY = (Math.random() - 0.5) * 1.4;
    const randomZ = Math.cos(randomAngle) * 1.5;

    const newWish: CommunityWish = {
      id: "w-" + Date.now(),
      author: authorName.trim() || "Người Bạn Ẩn Danh",
      wish: wishText.trim(),
      time: "Vừa xong",
      starColor: ["#FFAEC9", "#A0C4FF", "#BEE3DB", "#FFD166", "#FF3366"][
        Math.floor(Math.random() * 5)
      ],
      position: [randomX, randomY, randomZ],
    };

    setWishes([newWish, ...wishes]);
    setSelectedWish(newWish);
    setAuthorName("");
    setWishText("");

    playCrystalChime();

    // Starburst celebration confetti
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.65 },
      colors: ["#FFAEC9", "#A0C4FF", "#FFD166", "#BEE3DB", "#FF3366"],
    });
  };

  return (
    <section ref={sectionRef} id="wishing-well" className="relative w-full py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-block mb-3">
          Virtual Wishing Well • Celestial Galaxy
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          Dải Ngân Hà Điều Ước (Celestial Galaxy)
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-wishes-chocolate/75 font-sans">
          Mỗi lời chúc được chuyển hóa thành một <strong>Tinh Cầu Pha Lê 3D</strong> đính trên dải ruy-băng
          Möbius vĩnh cửu. Nhấp vào các ngôi sao trên bầu trời 3D để lắng nghe âm hưởng chúc phúc từ cộng đồng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wish Submission Form & Selected Wish (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active / Inspected Wish Spotlight Card */}
          {selectedWish && (
            <div className="p-6 rounded-3xl glass-panel border-2 border-wishes-cherry/40 shadow-dreamy relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-wishes-pink/40 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-wishes-cherry" />
                  <span>Điều Ước Đang Chiếu Sáng</span>
                </span>
                <span className="text-[10px] text-wishes-chocolate/60">{selectedWish.time}</span>
              </div>
              <p className="text-sm font-serif-swash italic text-wishes-chocolate mb-3 font-semibold leading-relaxed">
                "{selectedWish.wish}"
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-wishes-chocolate/10 text-xs">
                <span className="font-bold text-wishes-chocolate">Từ: {selectedWish.author}</span>
                <button
                  onClick={playCrystalChime}
                  className="px-2.5 py-1 rounded-full bg-white text-[10px] font-bold text-wishes-cherry shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Ngân Vang Chuông</span>
                </button>
              </div>
            </div>
          )}

          {/* Submission Input Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/80 shadow-pastel">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-wishes-cherry" />
              <h3 className="text-xl font-serif-swash font-bold text-wishes-chocolate">
                Gửi Điều Ước Lên Ngân Hà
              </h3>
            </div>
            <p className="text-xs text-wishes-chocolate/75 mb-6">
              Lời chúc của bạn sẽ bay vào dải ngân hà 3D kèm âm thanh chuông pha lê ngân vang:
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-wishes-chocolate/80 block mb-1">
                  Tên của bạn hoặc Biệt danh
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Tử Bé, Bạn Cùng Lớp..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-wishes-pink/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-wishes-chocolate/80 block mb-1">
                  Lời chúc tốt nghiệp gửi tác giả
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Gửi gắm ước mơ, lời chúc thành công đến đồ án Wishes..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-wishes-pink/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-wishes-cherry text-wishes-chocolate font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full candy-btn text-xs font-bold flex items-center justify-center gap-2 shadow-pastel"
              >
                <Send className="w-4 h-4 text-wishes-cherry" />
                <span>Phóng Điều Ước Vào Dải Ngân Hà 3D</span>
              </button>
            </form>
          </div>
        </div>

        {/* 3D WebGL Galaxy Ribbon Canvas (7 Cols) */}
        <div className="lg:col-span-7 relative w-full aspect-square sm:aspect-[4/3] rounded-3xl glass-panel shadow-dreamy border border-white/80 overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-b from-wishes-cream/60 via-white/40 to-wishes-blue/20">
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-wishes-chocolate shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>3D Ribbon Galaxy • Xoay Trái Phải Khám Phá</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-wishes-cherry shadow-sm">
              ✨ {wishes.length} Vì Sao Đang Chiếu Sáng
            </span>
          </div>

          {/* 3D Galaxy Canvas */}
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 1.8, 5.0], fov: 45 }}
              frameloop={isInView ? "always" : "never"}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <ambientLight intensity={0.9} />
              <pointLight position={[0, 4, 3]} intensity={2.2} color="#FFF9E6" />
              <pointLight position={[-4, -2, -3]} intensity={2.5} color="#FFAEC9" />
              <pointLight position={[4, 2, -3]} intensity={2.0} color="#A0C4FF" />

              <CelestialRibbonGalaxy
                wishes={wishes}
                selectedWishId={selectedWish?.id || null}
                onSelectWish={(w) => {
                  setSelectedWish(w);
                  playCrystalChime();
                }}
              />

              <OrbitControls
                enableZoom={true}
                minDistance={3.0}
                maxDistance={7.5}
                autoRotate={true}
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>

          {/* Bottom Prompt */}
          <div className="z-10 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold text-wishes-chocolate shadow-sm flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-wishes-blue" />
              <span>Bấm vào tinh cầu để đọc lời chúc của người khác</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
