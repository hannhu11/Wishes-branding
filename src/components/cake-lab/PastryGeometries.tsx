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
import { strokeTo3DCurve, createFlutedRosetteGeometry } from "./SmartPipingEngine";

// --- PROCEDURAL PASTRY TEXTURES (MATERIAL TRUTH) ---

/**
 * Procedural Palette-Knife Spatula Frosting Bump Map
 * 512x512 canvas texture with subtle horizontal swirl bands and micro air-pockets.
 */
export function createFrostingBumpMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    // Subtle horizontal palette-knife bands
    const band = Math.sin(y * 0.18) * 16 + Math.cos(y * 0.05) * 10;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const swirl = Math.sin(x * 0.04 + band * 0.08 + Math.cos(y * 0.06) * 1.8) * 12;
      const microNoise = (Math.random() - 0.5) * 10;

      // Micro air pockets in buttercream
      let pit = 0;
      if (Math.random() < 0.0018) {
        pit = -32;
      }

      const val = Math.min(255, Math.max(0, 128 + band + swirl + microNoise + pit));
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Sponge Crumb Alvéolage Bump Map (Slide 36-37)
 * 512x512 cellular porous noise canvas texture mimicking baked sponge air pockets.
 */
export function createCrumbBumpMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Fine flour / crumb grain
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 28;
    const v = Math.min(255, Math.max(0, 128 + grain));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw cellular porous air pockets (alvéoles)
  for (let p = 0; p < 420; p++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const pr = 1.2 + Math.random() * 4.8;
    const depth = 0.25 + Math.random() * 0.5;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
    grad.addColorStop(0, `rgba(45, 45, 45, ${depth})`);
    grad.addColorStop(0.65, `rgba(85, 85, 85, ${depth * 0.5})`);
    grad.addColorStop(1, "rgba(128, 128, 128, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Fluted Lambeth Shell Geometry for Royal Wilton #21 borders.
 * Features teardrop taper profile: head swells to 1.25x radius, curls upward, and tapers to 0.25x.
 */
export function createLambethShellGeometry(baseRadius: number = 0.072): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const segments = 14;
  const points = 8;
  const numVerticesPerRing = points * 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radiusScale = 0.35;
    if (t < 0.25) {
      const u = t / 0.25;
      radiusScale = 0.35 + (1.25 - 0.35) * Math.sin(u * Math.PI * 0.5);
    } else {
      const u = (t - 0.25) / 0.75;
      radiusScale = 1.25 - (1.25 - 0.25) * Math.sin(u * Math.PI * 0.5);
    }

    const rOuter = baseRadius * radiusScale;
    const rInner = rOuter * (1 - 0.24);

    // Shell curved arc trajectory
    const xCenter = (t - 0.3) * 0.15;
    const yCenter = Math.sin(t * Math.PI) * 0.035 - t * 0.012;
    const zCenter = (1 - Math.cos(t * Math.PI * 0.5)) * 0.018;

    for (let j = 0; j < numVerticesPerRing; j++) {
      const angle = (j / numVerticesPerRing) * Math.PI * 2;
      const r = j % 2 === 0 ? rOuter : rInner;
      const rx = Math.cos(angle) * r;
      const ry = Math.sin(angle) * r;

      positions.push(xCenter + rx, yCenter + ry, zCenter);
      uvs.push(j / numVerticesPerRing, t);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < numVerticesPerRing; j++) {
      const current = i * numVerticesPerRing + j;
      const next = i * numVerticesPerRing + ((j + 1) % numVerticesPerRing);
      const above = (i + 1) * numVerticesPerRing + j;
      const aboveNext = (i + 1) * numVerticesPerRing + ((j + 1) % numVerticesPerRing);

      indices.push(current, above, next);
      indices.push(next, above, aboveNext);
    }
  }

  // Cap start
  const startCenterIdx = positions.length / 3;
  positions.push(-0.3 * 0.15, 0, 0);
  uvs.push(0.5, 0);
  for (let j = 0; j < numVerticesPerRing; j++) {
    const nextJ = (j + 1) % numVerticesPerRing;
    indices.push(startCenterIdx, nextJ, j);
  }

  // Cap end
  const endCenterIdx = positions.length / 3;
  positions.push(0.7 * 0.15, -0.012, 0.018);
  uvs.push(0.5, 1);
  const lastRingOffset = segments * numVerticesPerRing;
  for (let j = 0; j < numVerticesPerRing; j++) {
    const nextJ = (j + 1) % numVerticesPerRing;
    indices.push(endCenterIdx, lastRingOffset + j, lastRingOffset + nextJ);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

/**
 * Custom vertex-deformed sphere with indented stem cavity (lúm cuống cherry)
 * and flattened bottom to nestle into a cream rosette.
 */
export function createRealisticCherryGeometry(): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.26, 36, 36);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);

    // Stem cavity indentation at top pole
    if (y > 0) {
      y *= 1 - 0.28 * Math.exp(-r * r * 14);
    }
    // Bottom flattening where it nestles into cream
    if (y < -0.06) {
      y *= 0.88;
    }
    // Heart-like plumpness
    const plump = 1 + 0.06 * Math.sin(((y + 0.26) / 0.52) * Math.PI);
    x *= plump;
    z *= plump;

    pos.setXYZ(i, x, y, z);
  }
  geom.computeVertexNormals();
  return geom;
}

// --- PROCEDURAL 3D ACCESSORIES & TOPPINGS (FROM PROPOSAL) ---

// 1. Realistic Glossy Cherry with Dew Droplets & Curved Stem (Slide 59)
export function RealisticCherry({
  position = [0, 0.75, 0],
}: {
  position?: [number, number, number];
}) {
  const cherryGeometry = useMemo(() => createRealisticCherryGeometry(), []);
  const rosetteGeometry = useMemo(() => createFlutedRosetteGeometry(0.12, 8, 8), []);

  const stemGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0.05, 0.42, 0.03),
      new THREE.Vector3(0.12, 0.62, 0.01),
      new THREE.Vector3(0.08, 0.78, -0.05),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.012, 8, false);
  }, []);

  return (
    <group position={position}>
      {/* Fluted Cream Rosette Bed underneath cherry */}
      <mesh geometry={rosetteGeometry} position={[0, -0.22, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#FFFDF5"
          roughness={0.28}
          clearcoat={0.25}
          transmission={0.06}
          thickness={0.6}
        />
      </mesh>

      {/* Anatomically Accurate Ruby Cherry Body */}
      <mesh geometry={cherryGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#E6194B"
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          ior={1.48}
          transmission={0.25}
          thickness={0.8}
          attenuationColor="#4A0010"
        />
      </mesh>

      {/* Indented Stem Cavity Core */}
      <mesh position={[0, 0.19, 0]}>
        <torusGeometry args={[0.026, 0.013, 8, 16]} />
        <meshStandardMaterial color="#4A0010" roughness={0.7} />
      </mesh>

      {/* Curved Green Stem */}
      <mesh geometry={stemGeometry} castShadow>
        <meshStandardMaterial color="#5C8001" roughness={0.35} />
      </mesh>

      {/* Stem Knob at Tip */}
      <mesh position={[0.08, 0.78, -0.05]} castShadow>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#405900" roughness={0.4} />
      </mesh>

      {/* Water Droplets */}
      <mesh position={[0.11, 0.1, 0.17]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.96}
          roughness={0}
          ior={1.33}
          clearcoat={1.0}
        />
      </mesh>
      <mesh position={[-0.13, 0.04, 0.15]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.96}
          roughness={0}
          ior={1.33}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
}

// Procedural Viscous Drip Rim for Mirror Glaze & Cinnamon Icing
export function ViscousDripRim({
  radius = 1.48,
  y = 0.5,
  color = "#C71585",
  count = 28,
}: {
  radius?: number;
  y?: number;
  color?: string;
  count?: number;
}) {
  const drips = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const wave = Math.sin(angle * 12) + 0.5 * Math.cos(angle * 7);
      const dripLength = 0.06 + Math.max(0.01, wave * 0.12 + 0.07);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      arr.push({ x, z, dripLength });
    }
    return arr;
  }, [radius, count]);

  return (
    <group position={[0, y, 0]}>
      {drips.map((d, idx) => (
        <group key={idx} position={[d.x, 0, d.z]}>
          <mesh position={[0, -d.dripLength * 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.014, d.dripLength, 10]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.06}
              clearcoat={1.0}
              clearcoatRoughness={0.04}
              transmission={0.2}
              thickness={0.5}
            />
          </mesh>
          <mesh position={[0, -d.dripLength, 0]} castShadow>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.04}
              transmission={0.22}
              thickness={0.6}
            />
          </mesh>
        </group>
      ))}
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
  const lambethShellGeom = useMemo(() => createLambethShellGeometry(0.075), []);
  const rosetteGeom = useMemo(() => createFlutedRosetteGeometry(0.075, 8, 8), []);

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
        <group key={idx} position={[b.x, 0, b.z]} rotation={[0.08, b.rotationY, -0.06]}>
          {style === "wilton-shell" && (
            <mesh geometry={lambethShellGeom} castShadow receiveShadow>
              <meshPhysicalMaterial
                color={color}
                roughness={0.28}
                clearcoat={0.35}
                clearcoatRoughness={0.25}
                transmission={0.06}
                thickness={0.8}
                sheen={0.4}
                sheenColor={new THREE.Color("#FFFDF5")}
              />
            </mesh>
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
            <group position={[0, 0.02, 0]}>
              <mesh geometry={rosetteGeom} castShadow receiveShadow>
                <meshPhysicalMaterial
                  color={color}
                  roughness={0.28}
                  clearcoat={0.35}
                  transmission={0.06}
                />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshPhysicalMaterial color="#FFFFFF" roughness={0.08} clearcoat={1.0} />
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
  const isCelebration =
    shape === "round" || shape === "heart" || shape === "rectangle" || shape === "two-tier";
  const radialScale = size / 16;
  const heightScale = isCelebration ? (0.85 + ((size - 10) / 14) * 0.25) : (size / 16) * 1.05;
  const groupScale: [number, number, number] = isCelebration
    ? [radialScale, heightScale, radialScale]
    : [(size / 16) * 1.05, (size / 16) * 1.05, (size / 16) * 1.05];

  const crumbBumpMap = useMemo(() => createCrumbBumpMap(), []);
  const frostingBumpMap = useMemo(() => createFrostingBumpMap(), []);

  const spongeObj = SPONGE_OPTIONS.find((s) => s.id === sponge);
  const geleeObj = GELEE_OPTIONS.find((g) => g.id === gelee);
  const mousseObj = MOUSSE_OPTIONS.find((m) => m.id === mousse);

  const isDaily =
    shape === "cinnamon-roll" ||
    shape === "croissant" ||
    shape === "egg-tart" ||
    shape === "cookie";

  return (
    <group scale={groupScale} position={[0, -0.2, 0]}>
      {/* 3/4 Outer Frosting Shell */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 1.0, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={finish === "mirror-glaze" ? 0.04 : finish === "velvet-spray" ? 0.85 : 0.32}
          metalness={0.01}
          clearcoat={finish === "mirror-glaze" ? 1.0 : 0.15}
          clearcoatRoughness={0.4}
          sheen={0.65}
          sheenRoughness={0.5}
          sheenColor={new THREE.Color("#FFF5EA")}
          transmission={finish === "mirror-glaze" ? 0.15 : 0.08}
          thickness={0.6}
          attenuationColor={new THREE.Color("#FFE5D9")}
          bumpMap={finish === "rustic-buttercream" ? (frostingBumpMap || undefined) : undefined}
          bumpScale={0.018}
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

      {/* Layer 2: Main Sponge / Pastry Core with Alvéolage Crumb Porosity */}
      <mesh position={[0, -0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.46, 0.26, 64, 1, false, 0, Math.PI * 1.5]} />
        <meshPhysicalMaterial
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
          roughness={0.88}
          bumpMap={crumbBumpMap || undefined}
          bumpScale={0.035}
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
