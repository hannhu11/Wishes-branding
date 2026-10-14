import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  ToppingConfig,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
} from "./types";
import { strokeTo3DCurve } from "./SmartPipingEngine";

// --- PROCEDURAL 3D ACCESSORIES & TOPPINGS (FROM PROPOSAL) ---

// 1. Realistic Glossy Cherry with Dew Droplets & Curved Stem (Slide 59)
export function RealisticCherry({
  position = [0, 0.75, 0],
}: {
  position?: [number, number, number];
}) {
  const stemGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.22, 0),
      new THREE.Vector3(0.06, 0.42, 0.04),
      new THREE.Vector3(0.14, 0.62, 0.02),
      new THREE.Vector3(0.08, 0.75, -0.06),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.014, 8, false);
  }, []);

  return (
    <group position={position}>
      {/* Cherry Body */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshPhysicalMaterial
          color="#E60033"
          roughness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          reflectivity={0.9}
          ior={1.48}
        />
      </mesh>

      {/* Indentation */}
      <mesh position={[0, 0.23, 0]}>
        <torusGeometry args={[0.03, 0.015, 8, 16]} />
        <meshStandardMaterial color="#5A0515" roughness={0.6} />
      </mesh>

      {/* Curved Stem */}
      <mesh geometry={stemGeometry} castShadow>
        <meshStandardMaterial color="#4A6B32" roughness={0.4} />
      </mesh>

      {/* Water Droplets */}
      <mesh position={[0.12, 0.12, 0.18]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0}
          ior={1.33}
        />
      </mesh>
      <mesh position={[-0.14, 0.05, 0.16]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0}
          ior={1.33}
        />
      </mesh>
    </group>
  );
}

// 2. Fresh Ripe Strawberry with Green Calyx Leaves
export function RealisticStrawberry({
  position = [0, 0.75, 0],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0.15, 0.3, -0.1]}>
      {/* Strawberry Body (Cone with rounded tip) */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <coneGeometry args={[0.2, 0.42, 24]} />
        <meshPhysicalMaterial
          color="#D90429"
          roughness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Strawberry Base Sphere for rounded shoulder */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshPhysicalMaterial color="#D90429" roughness={0.15} clearcoat={0.8} />
      </mesh>

      {/* Leafy Green Calyx (5 star leaves) */}
      {Array.from({ length: 5 }).map((_, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.14, 0.44, Math.sin(angle) * 0.14]}
            rotation={[0.3, angle, 0.4]}
          >
            <cylinderGeometry args={[0.06, 0.01, 0.18, 8]} />
            <meshStandardMaterial color="#2D6A4F" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

// 3. Satin Ribbon Bow in Baby Blue (Slide 84)
export function SatinRibbonBow({
  position = [0, 0.65, 0],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0.2, 0, 0]}>
      {/* Center Knot */}
      <mesh castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial
          color="#A0C4FF"
          roughness={0.3}
          clearcoat={0.5}
          sheen={1}
          sheenColor={new THREE.Color("#D0E2FF")}
        />
      </mesh>

      {/* Left Loop */}
      <mesh position={[-0.18, 0.06, 0]} rotation={[0, 0, 0.4]} castShadow>
        <torusGeometry args={[0.14, 0.045, 12, 24, Math.PI * 1.5]} />
        <meshPhysicalMaterial
          color="#A0C4FF"
          roughness={0.3}
          clearcoat={0.5}
          sheen={1}
          sheenColor={new THREE.Color("#D0E2FF")}
        />
      </mesh>

      {/* Right Loop */}
      <mesh position={[0.18, 0.06, 0]} rotation={[0, 0, -0.4]} castShadow>
        <torusGeometry args={[0.14, 0.045, 12, 24, Math.PI * 1.5]} />
        <meshPhysicalMaterial
          color="#A0C4FF"
          roughness={0.3}
          clearcoat={0.5}
          sheen={1}
          sheenColor={new THREE.Color("#D0E2FF")}
        />
      </mesh>

      {/* Hanging Ribbons */}
      <mesh position={[-0.1, -0.22, 0.02]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.32, 12]} />
        <meshPhysicalMaterial color="#A0C4FF" roughness={0.3} clearcoat={0.5} />
      </mesh>
      <mesh position={[0.1, -0.22, 0.02]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.32, 12]} />
        <meshPhysicalMaterial color="#A0C4FF" roughness={0.3} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

// 4. Pastel Spiral Candle with Flickering Flame Glow
export function PastelSpiralCandle({
  position = [0, 0.52, 0],
}: {
  position?: [number, number, number];
}) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flameRef.current) return;
    const t = state.clock.getElapsedTime();
    flameRef.current.scale.y = 1 + Math.sin(t * 12) * 0.15;
    flameRef.current.scale.x = 1 + Math.cos(t * 15) * 0.1;
  });

  return (
    <group position={position}>
      {/* Candle Cylinder Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 16]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.3} />
      </mesh>

      {/* Spiral Stripes on Candle */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.69, 16]} />
        <meshStandardMaterial color="#FFF9E6" roughness={0.3} wireframe />
      </mesh>

      {/* Candle Wick */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
        <meshBasicMaterial color="#2B1810" />
      </mesh>

      {/* Flickering Teardrop Flame */}
      <mesh ref={flameRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#FFA000" />
      </mesh>

      {/* Point Light emitted by Candle */}
      <pointLight position={[0, 0.85, 0]} intensity={1.8} distance={2.5} color="#FFD166" />
    </group>
  );
}

// 5. Golden Wishes Birthday Crown / Tiara (Slide 85)
export function BirthdayCrown({
  position = [0, 0.65, 0],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} scale={[0.5, 0.5, 0.5]}>
      {/* Crown Rim Band */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.12, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#FFD700"
          metalness={0.85}
          roughness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Crown Peak Spikes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.65;
        const z = Math.sin(angle) * 0.65;
        return (
          <mesh
            key={i}
            position={[x, 0.18, z]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <coneGeometry args={[0.12, 0.28, 4]} />
            <meshPhysicalMaterial
              color="#FFD700"
              metalness={0.85}
              roughness={0.2}
              clearcoat={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// 6. Wishes Enamel Badge / Pin (Slide 83)
export function EnamelBadgePin({
  position = [0.45, 0.55, 0.45],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={[-0.2, 0.3, 0.15]}>
      {/* Gold Rim Frame */}
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 32]} />
        <meshPhysicalMaterial color="#DAA520" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Inner Enamel Cream Infill */}
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.01, 32]} />
        <meshPhysicalMaterial
          color="#FFFDF5"
          roughness={0.05}
          clearcoat={1.0}
        />
      </mesh>

      {/* Wishes Star Emblem in Enamel */}
      <mesh position={[0, 0.025, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.07, 0.01, 0.07]} />
        <meshPhysicalMaterial color="#FF3366" roughness={0.1} />
      </mesh>
    </group>
  );
}

// --- INSTANCED SPRINKLES FOR 60FPS ZERO-LAG RENDERING ---

export function InstancedPastelSprinkles({
  radius = 1.35,
  y = 0.52,
}: {
  radius?: number;
  y?: number;
}) {
  const count = 38;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const colors = useMemo(
    () => [
      new THREE.Color("#FF3366"),
      new THREE.Color("#A0C4FF"),
      new THREE.Color("#BEE3DB"),
      new THREE.Color("#FFD166"),
      new THREE.Color("#FFAEC9"),
      new THREE.Color("#E2C6FF"),
      new THREE.Color("#FFFFFF"),
    ],
    []
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Golden spiral distribution
      const r = Math.sqrt(i / count) * radius * 0.88;
      const theta = i * 2.39996; // Golden angle
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      dummy.position.set(x, y + (Math.sin(i) * 0.008), z);
      dummy.rotation.set(Math.sin(i) * 0.2, theta, Math.cos(i) * 0.2);
      dummy.scale.setScalar(0.04 + (i % 3) * 0.012);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, colors[i % colors.length]);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [radius, y, count, colors]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhysicalMaterial roughness={0.15} clearcoat={0.9} clearcoatRoughness={0.1} />
    </instancedMesh>
  );
}

// --- PIPING PATTERN COMPONENT ---

export function HautePipingPattern({
  style,
  radius,
  y,
  color,
  scale = 1,
}: {
  style: PipingStyle;
  radius: number;
  y: number;
  color: string;
  scale?: number;
}) {
  const count = style === "st-honore" ? 18 : style === "ruffle-ribbon" ? 36 : 28;

  const beads = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotationY = -angle + Math.PI / 2;
      arr.push({ x, z, rotationY, angle });
    }
    return arr;
  }, [radius, count]);

  if (style === "minimal") return null;

  return (
    <group position={[0, y, 0]} scale={[scale, scale, scale]}>
      {beads.map((b, idx) => (
        <group key={idx} position={[b.x, 0, b.z]} rotation={[0.1, b.rotationY, -0.1]}>
          {style === "wilton-shell" && (
            <>
              {/* Shell bead */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.075, 14, 14]} />
                <meshPhysicalMaterial
                  color={color}
                  roughness={0.28}
                  transmission={0.06}
                  thickness={0.8}
                  clearcoat={0.3}
                />
              </mesh>
              {/* Teardrop tail */}
              <mesh position={[0.035, -0.02, 0]} rotation={[0, 0, -0.4]}>
                <coneGeometry args={[0.05, 0.12, 10]} />
                <meshPhysicalMaterial
                  color={color}
                  roughness={0.28}
                  clearcoat={0.3}
                />
              </mesh>
            </>
          )}

          {style === "st-honore" && (
            <mesh position={[0, 0.04, 0]} rotation={[0.3, 0.2, 0.4]} castShadow>
              <cylinderGeometry args={[0.02, 0.08, 0.18, 12]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.25}
                transmission={0.08}
                clearcoat={0.4}
              />
            </mesh>
          )}

          {style === "ruffle-ribbon" && (
            <mesh position={[0, 0.01, 0]} rotation={[0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.14, 0.025, 0.08]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.35}
                clearcoat={0.2}
              />
            </mesh>
          )}

          {style === "drop-flowers" && (
            <group position={[0, 0.04, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.08, 14, 14]} />
                <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.3} />
              </mesh>
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// --- SHAPE SPECIFIC GEOMETRIES ---

// A. Wonky Heart Extruded Geometry
export function useWonkyHeartGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.5, 0.5);
    shape.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0);
    shape.bezierCurveTo(-0.6, -0.6, -0.6, 0.7, -0.6, 0.7);
    shape.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9);
    shape.bezierCurveTo(1.2, 1.54, 1.6, 1.1, 1.6, 0.7);
    shape.bezierCurveTo(1.6, 0.7, 1.6, 0, 1.0, 0);
    shape.bezierCurveTo(0.7, 0.5, 0.5, 0.5, 0.5, 0.5);

    const extrudeSettings = {
      depth: 0.95,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 3,
      bevelSize: 0.14,
      bevelThickness: 0.14,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(Math.PI / 2);
    geom.scale(1.22, 1.22, 1.22);
    return geom;
  }, []);
}

// B. Baroque Rectangle Geometry
export function useBaroqueRectangleGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.6;
    const h = 1.2;
    const r = 0.25;

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    const extrudeSettings = {
      depth: 0.9,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);
}

// --- DAILY BAKED GOODS PROCEDURAL 3D MESHES (PROPOSAL SLIDE 60-64) ---

// 1. Cinnamon Roll (Quế cuộn kem vani chảy)
export function CinnamonRollMesh() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Outer spiral golden bun dough */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.1, 0.35, 24, 48]} />
        <meshStandardMaterial color="#B07D4F" roughness={0.65} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <torusGeometry args={[0.65, 0.32, 24, 48]} />
        <meshStandardMaterial color="#C89666" roughness={0.65} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.5, 24]} />
        <meshStandardMaterial color="#A0693B" roughness={0.7} />
      </mesh>

      {/* Dripping Vanilla Icing Glaze */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.2, 0.12, 32]} />
        <meshPhysicalMaterial
          color="#FFFDF5"
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.1}
        />
      </mesh>
      {/* Icing Drips */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(ang) * 1.35, 0.05 - (i % 2) * 0.1, Math.sin(ang) * 1.35]}
            castShadow
          >
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshPhysicalMaterial color="#FFFDF5" roughness={0.08} clearcoat={1.0} />
          </mesh>
        );
      })}
    </group>
  );
}

// 2. French Butter Croissant (Bánh sừng bò bơ Pháp)
export function FrenchCroissantMesh() {
  return (
    <group position={[0, 0, 0]} rotation={[0.2, 0.4, 0]}>
      {/* Curved central thick crescent body */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.0, 0.42, 24, 48, Math.PI * 1.3]} />
        <meshStandardMaterial color="#D48B38" roughness={0.45} />
      </mesh>
      {/* Layered flaky crust rings */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[1.0, 0.44, 16, 32, Math.PI * 0.9]} />
        <meshStandardMaterial color="#E8A856" roughness={0.4} />
      </mesh>
      {/* Tapered end tips */}
      <mesh position={[-0.8, -0.2, 0.5]} rotation={[0, 0.8, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshStandardMaterial color="#B87326" roughness={0.5} />
      </mesh>
      <mesh position={[0.8, -0.2, 0.5]} rotation={[0, -0.8, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshStandardMaterial color="#B87326" roughness={0.5} />
      </mesh>
    </group>
  );
}

// 3. Custard Egg Tart (Tart trứng vỏ ngàn lớp)
export function CustardEggTartMesh() {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Fluted puff pastry shell */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 0.95, 0.65, 32]} />
        <meshStandardMaterial color="#C68B59" roughness={0.65} />
      </mesh>
      {/* Golden egg custard filling */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[1.15, 0.85, 0.25, 32]} />
        <meshPhysicalMaterial
          color="#FFA000"
          roughness={0.15}
          clearcoat={0.8}
        />
      </mesh>
      {/* Caramelized blister spots (Crème Brûlée spots) */}
      <mesh position={[0.2, 0.35, 0.1]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#4A2E1B" />
      </mesh>
      <mesh position={[-0.3, 0.35, -0.2]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#5C381E" />
      </mesh>
    </group>
  );
}

// 4. Artisanal Soft Cookie (Cookie socola/matcha)
export function ArtisanalCookieMesh({ color = "#587E4C" }: { color?: string }) {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Rustic bumpy cookie disc */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.42, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Chocolate Chunks */}
      {[
        [0.4, 0.22, 0.3],
        [-0.5, 0.22, 0.4],
        [0.2, 0.22, -0.6],
        [-0.4, 0.22, -0.3],
        [0.7, 0.22, -0.2],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.22]} />
          <meshStandardMaterial color="#2B1810" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// --- FULL 3D CROSS-SECTION CUTAWAY BLUEPRINT ---

export function FullCrossSectionCutaway({
  size,
  shape = "round",
  sponge,
  gelee,
  mousse,
  frostingColor,
  finish,
}: {
  size: number;
  shape?: CakeShape;
  sponge: SpongeType;
  gelee: GeleeType;
  mousse: MousseType;
  frostingColor: string;
  finish: FrostingFinish;
}) {
  const scale = (size / 16) * 1.05;
  const spongeObj = SPONGE_OPTIONS.find((s) => s.id === sponge);
  const geleeObj = GELEE_OPTIONS.find((g) => g.id === gelee);
  const mousseObj = MOUSSE_OPTIONS.find((m) => m.id === mousse);

  const isDaily =
    shape === "cinnamon-roll" ||
    shape === "croissant" ||
    shape === "egg-tart" ||
    shape === "cookie";

  return (
    <group scale={[scale, scale, scale]} position={[0, -0.2, 0]}>
      {/* 3/4 Outer Frosting Shell */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 1.0, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={finish === "mirror-glaze" ? 0.04 : finish === "velvet-spray" ? 0.85 : 0.4}
          clearcoat={finish === "mirror-glaze" ? 1.0 : 0.25}
          transmission={0.06}
          thickness={1.1}
        />
      </mesh>

      {/* Layer 1: Base Crust / Feuilletine Crunch */}
      <mesh position={[0, -0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.46, 0.1, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={shape === "croissant" ? "#D48B38" : shape === "egg-tart" ? "#C68B59" : "#B07D4F"}
          roughness={0.9}
        />
      </mesh>

      {/* Layer 2: Main Sponge / Pastry Core */}
      <mesh position={[0, -0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.46, 0.26, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={
            shape === "cinnamon-roll"
              ? "#C89666"
              : shape === "croissant"
              ? "#F0D399"
              : shape === "egg-tart"
              ? "#FFA000"
              : shape === "cookie"
              ? "#4A2E1B"
              : spongeObj?.color || "#F7E7B4"
          }
          roughness={spongeObj?.roughness || 0.75}
        />
      </mesh>

      {/* Layer 3: Compote / Swirl / Honeycomb Layer */}
      {(gelee !== "none" || isDaily) && (
        <mesh position={[0, -0.07, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.46, 1.46, 0.12, 64, 1, false, 0, Math.PI * 1.5]} />
          <meshPhysicalMaterial
            color={
              shape === "cinnamon-roll"
                ? "#5C381E"
                : shape === "croissant"
                ? "#E8A856"
                : shape === "egg-tart"
                ? "#FFB300"
                : shape === "cookie"
                ? "#2B1810"
                : geleeObj?.color || "#B8002E"
            }
            roughness={0.1}
            transmission={isDaily ? 0.05 : 0.4}
            thickness={0.5}
            clearcoat={0.8}
          />
        </mesh>
      )}

      {/* Layer 4: Mousse / Custard / Cream Filling */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.46, 0.26, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={
            shape === "cinnamon-roll"
              ? "#FFFDF5"
              : shape === "croissant"
              ? "#F5E1B5"
              : shape === "egg-tart"
              ? "#FFC107"
              : shape === "cookie"
              ? "#3D2314"
              : mousseObj?.color || "#FFFDF5"
          }
          roughness={0.4}
        />
      </mesh>

      {/* Layer 5: Top Cream / Glaze Coating */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.46, 0.24, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshPhysicalMaterial color={frostingColor} roughness={0.3} transmission={0.05} />
      </mesh>

      {/* Extracted Floating Cut Wedge */}
      <group position={[0.65, 0.18, 0.65]} rotation={[0, Math.PI * 0.25, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.48, 1.48, 1.0, 32, 1, false, 0, Math.PI * 0.45]} />
          <meshPhysicalMaterial
            color={frostingColor}
            roughness={0.3}
            transmission={0.08}
            clearcoat={0.3}
          />
        </mesh>
      </group>

      {/* Engineering Callouts */}
      <Html position={[1.65, 0.42, 0]} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-wishes-pink shadow-md text-[9px] font-bold text-wishes-chocolate whitespace-nowrap animate-pulse">
          {shape === "cinnamon-roll"
            ? "🧁 L5: Warm Vanilla Icing Glaze (12mm)"
            : shape === "croissant"
            ? "🥐 L5: Caramelized Golden Flakes (8mm)"
            : shape === "egg-tart"
            ? "🍮 L5: Crème Brûlée Blister Top (6mm)"
            : shape === "cookie"
            ? "🍪 L5: Valrhona Ganache Glaze (10mm)"
            : `🍰 L5: ${mousseObj?.name.split(" ")[0]} Top (15mm)`}
        </div>
      </Html>
      <Html position={[1.65, 0.12, 0]} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-wishes-pink shadow-md text-[9px] font-bold text-wishes-cherry whitespace-nowrap">
          {shape === "cinnamon-roll"
            ? "🍨 L4: Mascarpone Cream Cheese (25mm)"
            : shape === "croissant"
            ? "🥐 L4: Alvéolage Honeycomb Crumb (35mm)"
            : shape === "egg-tart"
            ? "🍮 L4: Silky Egg Custard Center (28mm)"
            : shape === "cookie"
            ? "🍫 L4: Molten Chocolate Pockets (22mm)"
            : `🍨 L4: ${mousseObj?.name} (25mm)`}
        </div>
      </Html>
      {(gelee !== "none" || isDaily) && (
        <Html position={[1.65, -0.07, 0]} center>
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-300 shadow-md text-[9px] font-bold text-red-700 whitespace-nowrap">
            {shape === "cinnamon-roll"
              ? "🌿 L3: Valrhona Cinnamon Swirl (12mm)"
              : shape === "croissant"
              ? "🧈 L3: Tourage Butter Sheen (15mm)"
              : shape === "egg-tart"
              ? "🍯 L3: Vanilla Custard Infusion (12mm)"
              : shape === "cookie"
              ? "🌰 L3: Roasted Hazelnut Core (14mm)"
              : `🍓 L3: ${geleeObj?.name.split("(")[0]} (15mm)`}
          </div>
        </Html>
      )}
      <Html position={[1.65, -0.26, 0]} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-300 shadow-md text-[9px] font-bold text-amber-900 whitespace-nowrap">
          {shape === "cinnamon-roll"
            ? "🌾 L2: Fluffy Cardamom Brioche (35mm)"
            : shape === "croissant"
            ? "🌾 L2: French Tourage Dough (81 Layers)"
            : shape === "egg-tart"
            ? "🌾 L2: Mille-Feuille Tart Shell (30mm)"
            : shape === "cookie"
            ? "🌾 L2: Fudgy Butter Dough (32mm)"
            : `🌾 L2: ${spongeObj?.name} (35mm)`}
        </div>
      </Html>
      <Html position={[1.65, -0.45, 0]} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500 shadow-md text-[9px] font-bold text-amber-950 whitespace-nowrap">
          {shape === "croissant" || shape === "egg-tart"
            ? "🥐 L1: Crisp Flaky Butter Base (10mm)"
            : "🍪 L1: Feuilletine Crunch Base (10mm)"}
        </div>
      </Html>
    </group>
  );
}
