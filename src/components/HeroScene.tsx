"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles, ArrowDown, Heart, Eye } from "lucide-react";

// Floating 3D Pastry Model
function FloatingPastry() {
  const cakeGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!cakeGroup.current) return;
    const t = state.clock.getElapsedTime();
    cakeGroup.current.rotation.y = t * 0.35;
    cakeGroup.current.position.y = Math.sin(t * 0.9) * 0.18;
  });

  return (
    <group ref={cakeGroup} position={[0, -0.2, 0]}>
      {/* Base Cake Sponge */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.7, 64]} />
        <meshStandardMaterial color="#FFF9E6" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Middle Icing Cream (Pastel Pink with Distort Material) */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.6, 64]} />
        <MeshDistortMaterial
          color="#FFAEC9"
          speed={1.5}
          distort={0.08}
          roughness={0.25}
          metalness={0.02}
        />
      </mesh>

      {/* Top Tier (Baby Blue Cream) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.45, 64]} />
        <meshStandardMaterial color="#BDE0FE" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Glossy Cherry on Top */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.6}>
        <group position={[0, 0.75, 0]}>
          <Sphere args={[0.26, 32, 32]} castShadow>
            <meshPhysicalMaterial
              color="#FF1A4B"
              roughness={0.08}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              transmission={0.1}
            />
          </Sphere>
          {/* Stem */}
          <mesh position={[0.08, 0.22, 0]} rotation={[0, 0, -0.35]}>
            <cylinderGeometry args={[0.018, 0.018, 0.35, 8]} />
            <meshStandardMaterial color="#3D5A40" roughness={0.5} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

// Pastel Floating Sprinkles Particles Cloud
function SprinklesParticles({ count = 120 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const colors = ["#FFAEC9", "#A0C4FF", "#BEE3DB", "#FFF3B0", "#FFD166", "#FF3366"];
    return Array.from({ length: count }, () => ({
      pos: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
      ],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      speed: 0.3 + Math.random() * 0.4,
      color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.pos[0],
        p.pos[1] + Math.sin(t * p.speed + i) * 0.15,
        p.pos[2]
      );
      dummy.rotation.x = p.rot[0] + t * 0.1;
      dummy.rotation.y = p.rot[1] + t * 0.15;
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
      meshRef.current?.setColorAt(i, p.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.035, 0.035, 0.16, 8]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
    </instancedMesh>
  );
}

import { useInView } from "./common/useInView";

export default function HeroScene() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ rootMargin: "200px 0px" });

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* 3D WebGL Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 1.2, 4.8], fov: 42 }}
          frameloop={isInView ? "always" : "never"}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          {/* Pastel Lighting Studio */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[6, 8, 6]} intensity={1.6} color="#FFF5EA" castShadow />
          {/* Rim light 1: Cotton Candy Pink */}
          <pointLight position={[-4, 3, -2]} intensity={2.2} color="#FFAEC9" />
          {/* Rim light 2: Sky Blue */}
          <pointLight position={[4, 2, -3]} intensity={1.8} color="#A0C4FF" />

          <FloatingPastry />
          <SprinklesParticles count={100} />
        </Canvas>
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Academic Capstone Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-wishes-pink/70 text-wishes-chocolate text-xs font-bold shadow-pastel mb-6">
          <Heart className="w-3.5 h-3.5 text-wishes-cherry animate-pulse" />
          <span>FPT Capstone Project 2026 • GFA26GD60 • Nguyễn Hồng Thu Phương</span>
        </div>

        {/* Cinematic Main Title */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif-swash font-bold text-wishes-chocolate tracking-tight drop-shadow-sm leading-none">
          Wishes
        </h1>

        {/* Tagline & Slogan */}
        <p className="mt-4 text-base sm:text-xl md:text-2xl font-display-bubbly text-wishes-chocolate/85 tracking-widest uppercase">
          MAKE A WISH. TAKE A BITE.
        </p>

        {/* Subtitle Description */}
        <p className="mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-wishes-chocolate/75 leading-relaxed font-sans">
          Không gian trải nghiệm tiệm bánh ngọt nghệ thuật cao cấp (Boutique Pastry) kết hợp 3D Surrealism và nét duyên dáng bất toàn (*Wonky & Whimsical*). Nơi mỗi chiếc bánh là một điều ước được đánh thức.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#cake-lab"
            className="px-7 py-3.5 rounded-full candy-btn text-sm font-bold flex items-center gap-2 shadow-pastel hover:scale-105 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-wishes-cherry" />
            <span>Phòng Thí Nghiệm Bánh 3D</span>
          </a>

          <a
            href="#gallery"
            className="px-6 py-3.5 rounded-full glass-panel border border-wishes-chocolate/20 text-sm font-bold text-wishes-chocolate hover:bg-white/80 active:scale-95 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-wishes-chocolate/70" />
            <span>Triển Lãm Đồ Án</span>
          </a>
        </div>

        {/* Scroll indicator */}
        <a
          href="#story"
          className="mt-14 inline-flex flex-col items-center gap-1.5 text-xs text-wishes-chocolate/60 hover:text-wishes-chocolate transition-colors animate-bounce"
        >
          <span>Khám phá hành trình</span>
          <ArrowDown className="w-4 h-4 text-wishes-cherry" />
        </a>
      </div>
    </section>
  );
}
