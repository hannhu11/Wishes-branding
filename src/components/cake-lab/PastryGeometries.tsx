import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  PipingPosition,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
} from "./types";
import { createFlutedRosetteGeometry } from "./SmartPipingEngine";

// --- PROCEDURAL PASTRY TEXTURES (MATERIAL TRUTH) ---

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
    const ny = y / size;
    const band = Math.sin(ny * Math.PI * 4) * 16 + Math.cos(ny * Math.PI * 2) * 10;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const idx = (y * size + x) * 4;
      const swirl = Math.sin(nx * Math.PI * 2 + band * 0.08 + Math.cos(ny * Math.PI * 3) * 1.5) * 12;
      const microNoise = (Math.random() - 0.5) * 8;
      let pit = 0;
      if (Math.random() < 0.002) pit = -28;

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
  texture.repeat.set(2, 1);
  texture.needsUpdate = true;
  return texture;
}

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

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 28;
    const v = Math.min(255, Math.max(0, 128 + grain));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

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

export function createArtisanalCakeGeometry(
  radius: number = 1.5,
  height: number = 1.0,
  bevelRadius: number = 0.04
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const halfH = height / 2;
  const segments = 8;

  points.push(new THREE.Vector2(0, -halfH));
  points.push(new THREE.Vector2(radius - bevelRadius, -halfH));
  for (let i = 0; i <= segments; i++) {
    const a = -Math.PI / 2 + (i / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        radius - bevelRadius + Math.cos(a) * bevelRadius,
        -halfH + bevelRadius + Math.sin(a) * bevelRadius
      )
    );
  }
  points.push(new THREE.Vector2(radius, halfH - bevelRadius));
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        radius - bevelRadius + Math.cos(a) * bevelRadius,
        halfH - bevelRadius + Math.sin(a) * bevelRadius
      )
    );
  }
  points.push(new THREE.Vector2(0, halfH));

  const geom = new THREE.LatheGeometry(points, 64);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Fluted Lambeth Shell Geometry for Royal Wilton #21 borders.
 * Swollen head curls upward slightly, 8 longitudinal fluted ridges,
 * tapering smoothly to a slender tail that nestles under the next shell head.
 */
export function createLambethShellGeometry(
  baseRadius: number = 0.055,
  length: number = 0.28
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const segments = 16;
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
      radiusScale = 0.7 + (1.25 - 0.7) * Math.sin(u * Math.PI * 0.5);
    } else {
      const u = (t - 0.25) / 0.75;
      radiusScale = 1.25 - (1.25 - 0.22) * Math.sin(u * Math.PI * 0.5);
    }

    const rOuter = baseRadius * radiusScale;
    const rInner = rOuter * (1 - 0.24);

    // Shell curved arc trajectory along tangential X and upward curl Y
    const xCenter = (t - 0.5) * length;
    const yCenter = Math.sin(t * Math.PI) * 0.02 + (1 - t) * 0.01;
    const zCenter = 0;

    for (let j = 0; j < numVerticesPerRing; j++) {
      const angle = (j / numVerticesPerRing) * Math.PI * 2;
      const r = j % 2 === 0 ? rOuter : rInner;
      const dy = Math.sin(angle) * r;
      const dz = Math.cos(angle) * r;

      positions.push(xCenter, yCenter + dy, zCenter + dz);
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

  const startCenterIdx = positions.length / 3;
  positions.push(-0.5 * length, 0.01, 0);
  uvs.push(0.5, 0);
  for (let j = 0; j < numVerticesPerRing; j++) {
    const nextJ = (j + 1) % numVerticesPerRing;
    indices.push(startCenterIdx, nextJ, j);
  }

  const endCenterIdx = positions.length / 3;
  positions.push(0.5 * length, 0, 0);
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
 * Realistic Cherry Geometry (Indented stem cavity & subtle heart-shaped plumpness)
 */
export function createRealisticCherryGeometry(radius: number = 0.13): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(radius, 32, 32);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);

    if (y > 0) {
      y *= 1 - 0.28 * Math.exp(-r * r * (10 / (radius * radius)));
    }
    if (y < -radius * 0.2) {
      y *= 0.88;
    }
    const plump = 1 + 0.06 * Math.sin(((y + radius) / (radius * 2)) * Math.PI);
    x *= plump;
    z *= plump;

    pos.setXYZ(i, x, y, z);
  }
  geom.computeVertexNormals();
  return geom;
}

// --- 16 PROCEDURAL 3D ACCESSORY COMPONENTS ---

// 1. Realistic Cherry
export function RealisticCherry({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const cherryGeometry = useMemo(() => createRealisticCherryGeometry(0.12), []);
  const rosetteGeometry = useMemo(() => createFlutedRosetteGeometry(0.08, 8, 8), []);

  const stemGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(0.02, 0.26, 0.02),
      new THREE.Vector3(0.06, 0.38, 0.01),
      new THREE.Vector3(0.04, 0.46, -0.02),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.007, 8, false);
  }, []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Cream rosette bed underneath */}
      <mesh geometry={rosetteGeometry} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#FFFDF5"
          roughness={0.28}
          clearcoat={0.25}
          transmission={0.06}
          thickness={0.6}
        />
      </mesh>

      {/* Glossy ruby cherry body */}
      <mesh geometry={cherryGeometry} position={[0, 0.10, 0]} castShadow receiveShadow>
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

      {/* Curved green stem */}
      <mesh geometry={stemGeometry} castShadow>
        <meshStandardMaterial color="#5C8001" roughness={0.35} />
      </mesh>

      {/* Stem tip */}
      <mesh position={[0.04, 0.46, -0.02]} castShadow>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshStandardMaterial color="#405900" roughness={0.4} />
      </mesh>
    </group>
  );
}

// 2. Realistic Strawberry
export function RealisticStrawberry({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0.15, 0.3, -0.1]}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <coneGeometry args={[0.14, 0.28, 24]} />
        <meshPhysicalMaterial color="#D90429" roughness={0.12} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.14, 20, 16]} />
        <meshPhysicalMaterial color="#D90429" roughness={0.15} clearcoat={0.8} />
      </mesh>
      {Array.from({ length: 5 }).map((_, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.1, 0.28, Math.sin(angle) * 0.1]}
            rotation={[0.3, angle, 0.4]}
          >
            <cylinderGeometry args={[0.04, 0.008, 0.12, 8]} />
            <meshStandardMaterial color="#2D6A4F" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

// 3. Blueberry Cluster with Gold Leaf dust
export function BlueberryCluster({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {[
        [0, 0.06, 0],
        [0.08, 0.05, 0.04],
        [-0.07, 0.05, 0.03],
        [0.02, 0.05, -0.08],
        [0.03, 0.12, 0],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshPhysicalMaterial
            color="#2A3B66"
            roughness={0.25}
            clearcoat={0.6}
            sheen={0.8}
            sheenColor={new THREE.Color("#A0B4E8")}
          />
        </mesh>
      ))}
      {/* 24K Gold Leaf specks */}
      <mesh position={[0.04, 0.14, 0.02]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 4. Satin Ribbon Bow
export function SatinRibbonBow({
  position = [0, 0, 0],
  scale = 1.0,
  color = "#A0C4FF",
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0.2, 0, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          clearcoat={0.5}
          sheen={1}
          sheenColor={new THREE.Color("#FFF")}
        />
      </mesh>
      <mesh position={[-0.12, 0.04, 0]} rotation={[0, 0, 0.4]} castShadow>
        <torusGeometry args={[0.09, 0.03, 12, 24, Math.PI * 1.5]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.5} sheen={1} />
      </mesh>
      <mesh position={[0.12, 0.04, 0]} rotation={[0, 0, -0.4]} castShadow>
        <torusGeometry args={[0.09, 0.03, 12, 24, Math.PI * 1.5]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.5} sheen={1} />
      </mesh>
      <mesh position={[-0.07, -0.14, 0.02]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.2, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.5} />
      </mesh>
      <mesh position={[0.07, -0.14, 0.02]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.2, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

// 5. Golden Birthday Crown
export function BirthdayCrown({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale * 0.4, scale * 0.4, scale * 0.4]}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.12, 32, 1, true]} />
        <meshPhysicalMaterial color="#FFD700" metalness={0.85} roughness={0.2} clearcoat={0.9} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.65;
        const z = Math.sin(angle) * 0.65;
        return (
          <mesh key={i} position={[x, 0.18, z]} rotation={[0, -angle, 0]} castShadow>
            <coneGeometry args={[0.12, 0.28, 4]} />
            <meshPhysicalMaterial color="#FFD700" metalness={0.85} roughness={0.2} clearcoat={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

// 6. Pastel Spiral Candle
export function PastelSpiralCandle({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!flameRef.current) return;
    const t = state.clock.getElapsedTime();
    flameRef.current.scale.y = 1 + Math.sin(t * 12) * 0.15;
    flameRef.current.scale.x = 1 + Math.cos(t * 15) * 0.1;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 16]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
        <meshBasicMaterial color="#2B1810" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#FFA000" />
      </mesh>
      <pointLight position={[0, 0.55, 0]} intensity={1.5} distance={1.8} color="#FFD166" />
    </group>
  );
}

// 7. Number Candle ("00" to "99")
export function NumberCandle({
  position = [0, 0, 0],
  scale = 1.0,
  numberText = "20",
}: {
  position?: [number, number, number];
  scale?: number;
  numberText?: string;
}) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!flameRef.current) return;
    const t = state.clock.getElapsedTime();
    flameRef.current.scale.y = 1 + Math.sin(t * 12) * 0.15;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.26, 0.28, 0.06]} />
        <meshPhysicalMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <Html position={[0, 0.14, 0.04]} center transform>
        <div className="font-serif font-black text-amber-950 text-xs px-1 select-none pointer-events-none">
          {numberText || "20"}
        </div>
      </Html>
      <mesh ref={flameRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial color="#FF9900" />
      </mesh>
      <pointLight position={[0, 0.38, 0]} intensity={1.8} distance={1.8} color="#FFD166" />
    </group>
  );
}

// 8. Micro Sugar Pearls, Rods & Star Confetti
export function InstancedPastelSprinkles({
  radius = 1.35,
  y = 0.52,
  count = 90,
}: {
  radius?: number;
  y?: number;
  count?: number;
}) {
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
      const r = (0.55 + Math.sqrt(i / count) * 0.42) * radius;
      const theta = i * 2.39996;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      dummy.position.set(x, y + Math.sin(i) * 0.003, z);
      dummy.rotation.set(Math.sin(i) * 0.2, theta, Math.cos(i) * 0.2);
      // Realistic micro size (0.018)
      dummy.scale.setScalar(0.018 + (i % 3) * 0.005);
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 10, 10]} />
      <meshPhysicalMaterial roughness={0.15} clearcoat={0.9} clearcoatRoughness={0.1} />
    </instancedMesh>
  );
}

// 9. Piped Daisy Flower (5-petal buttercream flower)
export function PipedDaisyFlower({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 5 Petals */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.05, 0.01, Math.sin(a) * 0.05]}
            rotation={[0, -a, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.035, 0.02, 0.015, 12]} />
            <meshPhysicalMaterial color="#FFFDF5" roughness={0.3} clearcoat={0.2} />
          </mesh>
        );
      })}
      {/* Yellow center pistil */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial color="#FFD166" roughness={0.2} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

// 10. Chocolate Teddy Bear Topper
export function ChocolateBearTopper({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Bear Head */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#3D2314" roughness={0.4} />
      </mesh>
      {/* Left Ear */}
      <mesh position={[-0.11, 0.27, 0]} castShadow>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#3D2314" roughness={0.4} />
      </mesh>
      {/* Right Ear */}
      <mesh position={[0.11, 0.27, 0]} castShadow>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#3D2314" roughness={0.4} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.13, 0.1]} castShadow>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial color="#5C381E" roughness={0.5} />
      </mesh>
      {/* Black Nose */}
      <mesh position={[0, 0.16, 0.14]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshBasicMaterial color="#1A0D07" />
      </mesh>
    </group>
  );
}

// 11. Cat Ears & Y2K Star Sunglasses Topper
export function CatGlassesEarsTopper({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Left Pointed Cat Ear */}
      <mesh position={[-0.24, 0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.1, 0.26, 4]} />
        <meshPhysicalMaterial color="#FFAEC9" roughness={0.3} />
      </mesh>
      {/* Right Pointed Cat Ear */}
      <mesh position={[0.24, 0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.1, 0.26, 4]} />
        <meshPhysicalMaterial color="#FFAEC9" roughness={0.3} />
      </mesh>
      {/* Y2K Orange Star Sunglasses Bar */}
      <group position={[0, 0.05, 0.22]}>
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 5]} />
          <meshStandardMaterial color="#FF7A00" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 5]} />
          <meshStandardMaterial color="#FF7A00" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#FF7A00" />
        </mesh>
      </group>
    </group>
  );
}

// 12. Puppy Bow Ears Topper
export function PuppyBowEarsTopper({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Left Floppy Ear */}
      <mesh position={[-0.32, 0.05, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.35, 16]} />
        <meshPhysicalMaterial color="#FFF9E6" roughness={0.4} />
      </mesh>
      {/* Left Bow on ear */}
      <SatinRibbonBow position={[-0.26, 0.18, 0.08]} scale={0.7} color="#A0C4FF" />

      {/* Right Floppy Ear */}
      <mesh position={[0.32, 0.05, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.35, 16]} />
        <meshPhysicalMaterial color="#FFF9E6" roughness={0.4} />
      </mesh>
      {/* Right Bow on ear */}
      <SatinRibbonBow position={[0.26, 0.18, 0.08]} scale={0.7} color="#A0C4FF" />
    </group>
  );
}

// 13. French Mini Macaron Topper
export function MacaronTopper({
  position = [0, 0, 0],
  scale = 1.0,
  color = "#FFAEC9",
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0.2, 0.4, 0]}>
      {/* Top Shell */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.12, 0.045, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.3} />
      </mesh>
      {/* Filling Ganache */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.025, 24]} />
        <meshStandardMaterial color="#FFFDF5" roughness={0.4} />
      </mesh>
      {/* Bottom Shell */}
      <mesh position={[0, -0.01, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.11, 0.045, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

// 14. White Chocolate Plaque
export function ChocolatePlaqueTopper({
  position = [0, 0, 0],
  scale = 1.0,
  text = "WISHES",
}: {
  position?: [number, number, number];
  scale?: number;
  text?: string;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Plaque Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.65, 0.03, 0.28]} />
        <meshPhysicalMaterial color="#FFFDF5" roughness={0.15} clearcoat={0.8} />
      </mesh>
      {/* Golden Frame Border */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.62, 0.005, 0.25]} />
        <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.2} wireframe />
      </mesh>
      <Html position={[0, 0.04, 0]} center transform>
        <div className="font-serif italic font-bold text-amber-900 text-[10px] whitespace-nowrap select-none pointer-events-none">
          {text || "Wishes Pâtisserie"}
        </div>
      </Html>
    </group>
  );
}

// 15. Wishes Enamel Badge / Pin (Front Vertical Wall / Ribbon)
export function EnamelBadgePin({
  position = [0, -0.15, 1.55],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={[-0.1, 0, 0]}>
      {/* Gold Rim Frame */}
      <mesh castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.025, 32]} />
        <meshPhysicalMaterial color="#DAA520" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Inner Enamel Cream Infill */}
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 32]} />
        <meshPhysicalMaterial color="#FFFDF5" roughness={0.05} clearcoat={1.0} />
      </mesh>
      {/* Wishes Star Emblem in Enamel */}
      <mesh position={[0, 0.022, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.01, 0.06]} />
        <meshPhysicalMaterial color="#FF3366" roughness={0.1} />
      </mesh>
    </group>
  );
}

// 16. Wafer Butterflies & Gold Leaf
export function WaferButterflyTopper({
  position = [0, 0, 0],
  scale = 1.0,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0.4, 0.6, 0.2]}>
      {/* Left Wing */}
      <mesh position={[-0.06, 0.04, 0]} rotation={[0, -0.5, 0.3]} castShadow>
        <planeGeometry args={[0.1, 0.14]} />
        <meshPhysicalMaterial
          color="#FFF"
          transmission={0.8}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right Wing */}
      <mesh position={[0.06, 0.04, 0]} rotation={[0, 0.5, -0.3]} castShadow>
        <planeGeometry args={[0.1, 0.14]} />
        <meshPhysicalMaterial
          color="#FFF"
          transmission={0.8}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Butterfly Body */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
        <meshStandardMaterial color="#DAA520" metalness={0.9} />
      </mesh>
    </group>
  );
}

// --- VISCOUS DRIP RIM ---

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

// --- LAMBETH SIDE SWAGS / DROP GARLANDS (SLIDE 6 & 38) ---

export function LambethSideSwags({
  radius = 1.5,
  topY = 0.45,
  swagsCount = 8,
  color = "#FFFDF5",
}: {
  radius?: number;
  topY?: number;
  swagsCount?: number;
  color?: string;
}) {
  const swagTubes = useMemo(() => {
    const arr = [];
    const rosetteGeom = createFlutedRosetteGeometry(0.055, 8, 8);

    for (let i = 0; i < swagsCount; i++) {
      const a0 = (i / swagsCount) * Math.PI * 2;
      const a1 = ((i + 1) / swagsCount) * Math.PI * 2;

      // Catenary curve points
      const points: THREE.Vector3[] = [];
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const angle = a0 + u * (a1 - a0);
        const x = Math.cos(angle) * (radius + 0.02);
        const z = Math.sin(angle) * (radius + 0.02);
        const sag = 0.18 * Math.sin(Math.PI * u);
        const y = topY - sag - 0.08;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.022, 8, false);

      const junctionX = Math.cos(a0) * (radius + 0.025);
      const junctionZ = Math.sin(a0) * (radius + 0.025);
      const junctionPos: [number, number, number] = [junctionX, topY - 0.08, junctionZ];

      arr.push({ tubeGeom, junctionPos, rosetteGeom });
    }
    return arr;
  }, [radius, topY, swagsCount]);

  return (
    <group>
      {swagTubes.map((swag, idx) => (
        <group key={idx}>
          <mesh geometry={swag.tubeGeom} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={color}
              roughness={0.28}
              clearcoat={0.3}
              transmission={0.06}
            />
          </mesh>
          <mesh
            geometry={swag.rosetteGeom}
            position={swag.junctionPos}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- HAUTE PIPING PATTERN (PERFECT TANGENT ROTATION) ---

export function HautePipingPattern({
  style,
  radius,
  y,
  color,
  scale = 1,
  shapeType = "round",
}: {
  style: PipingStyle;
  radius: number;
  y: number;
  color: string;
  scale?: number;
  shapeType?: CakeShape;
}) {
  const count = style === "st-honore" ? 22 : style === "ruffle-ribbon" ? 36 : 28;
  const lambethShellGeom = useMemo(() => createLambethShellGeometry(0.065, 0.32), []);
  const rosetteGeom = useMemo(() => createFlutedRosetteGeometry(0.075, 8, 8), []);

  const beads = useMemo(() => {
    const arr = [];

    if (shapeType === "heart") {
      const shape = new THREE.Shape();
      shape.moveTo(0.5, 0.5);
      shape.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0);
      shape.bezierCurveTo(-0.6, -0.6, -0.6, 0.7, -0.6, 0.7);
      shape.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9);
      shape.bezierCurveTo(1.2, 1.54, 1.6, 1.1, 1.6, 0.7);
      shape.bezierCurveTo(1.6, 0.7, 1.6, 0, 1.0, 0);
      shape.bezierCurveTo(0.7, 0.5, 0.5, 0.5, 0.5, 0.5);

      const pts = shape.getSpacedPoints(count);
      for (let i = 0; i < count; i++) {
        const p = pts[i];
        const nextP = pts[(i + 1) % count];
        const x = (p.x - 0.5) * 1.22;
        const z = (p.y - 0.95) * 1.22;
        const nextX = (nextP.x - 0.5) * 1.22;
        const nextZ = (nextP.y - 0.95) * 1.22;
        const dx = nextX - x;
        const dz = nextZ - z;
        // Exact mathematical tangent angle
        const rotationY = Math.atan2(-dz, dx);
        arr.push({ x, z, rotationY });
      }
      return arr;
    }

    if (shapeType === "rectangle") {
      const w = 1.45;
      const h = 1.05;
      const r = 0.22;
      const shape = new THREE.Shape();
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      shape.quadraticCurveTo(w, -h, w, -h + r);
      shape.lineTo(w, h - r);
      shape.quadraticCurveTo(w, h, w - r, h);
      shape.lineTo(-w + r, h);
      shape.quadraticCurveTo(-w, h, -w, h - r);
      shape.lineTo(-w, -h + r);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);

      const pts = shape.getSpacedPoints(count);
      for (let i = 0; i < count; i++) {
        const p = pts[i];
        const nextP = pts[(i + 1) % count];
        const x = p.x;
        const z = p.y;
        const nextX = nextP.x;
        const nextZ = nextP.y;
        const dx = nextX - x;
        const dz = nextZ - z;
        // Exact mathematical tangent angle
        const rotationY = Math.atan2(-dz, dx);
        arr.push({ x, z, rotationY });
      }
      return arr;
    }

    // Default: Circular rim with exact tangent calculation
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const nextAngle = ((i + 1) / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const nextX = Math.cos(nextAngle) * radius;
      const nextZ = Math.sin(nextAngle) * radius;
      const dx = nextX - x;
      const dz = nextZ - z;
      const rotationY = Math.atan2(-dz, dx);
      arr.push({ x, z, rotationY });
    }
    return arr;
  }, [radius, count, shapeType]);

  if (style === "minimal") return null;

  return (
    <group position={[0, y, 0]} scale={[scale, scale, scale]}>
      {beads.map((b, idx) => (
        <group key={idx} position={[b.x, 0, b.z]} rotation={[0, b.rotationY, 0]}>
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
              <meshPhysicalMaterial color={color} roughness={0.25} transmission={0.08} clearcoat={0.4} />
            </mesh>
          )}

          {style === "ruffle-ribbon" && (
            <mesh position={[0, 0.01, 0]} rotation={[0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.14, 0.025, 0.08]} />
              <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.2} />
            </mesh>
          )}

          {style === "drop-flowers" && (
            <group position={[0, 0.02, 0]}>
              <mesh geometry={rosetteGeom} castShadow receiveShadow>
                <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.35} transmission={0.06} />
              </mesh>
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.018, 10, 10]} />
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

// --- DAILY BAKED GOODS & SCULPTED PASTRIES ---

// 1. Cinnamon Roll
export function CinnamonRollMesh() {
  return (
    <group position={[0, -0.1, 0]}>
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

// 2. French Butter Croissant (With optional coquette bow)
export function FrenchCroissantMesh() {
  return (
    <group position={[0, 0, 0]} rotation={[0.2, 0.4, 0]}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.0, 0.42, 24, 48, Math.PI * 1.3]} />
        <meshStandardMaterial color="#D48B38" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[1.0, 0.44, 16, 32, Math.PI * 0.9]} />
        <meshStandardMaterial color="#E8A856" roughness={0.4} />
      </mesh>
      <mesh position={[-0.8, -0.2, 0.5]} rotation={[0, 0.8, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshStandardMaterial color="#B87326" roughness={0.5} />
      </mesh>
      <mesh position={[0.8, -0.2, 0.5]} rotation={[0, -0.8, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshStandardMaterial color="#B87326" roughness={0.5} />
      </mesh>
      {/* Coquette Bow tied around waist */}
      <SatinRibbonBow position={[0, 0.35, 0.25]} scale={0.8} color="#A0C4FF" />
    </group>
  );
}

// 3. Custard Egg Tart
export function CustardEggTartMesh() {
  return (
    <group position={[0, -0.15, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 0.95, 0.65, 32]} />
        <meshStandardMaterial color="#C68B59" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[1.15, 0.85, 0.25, 32]} />
        <meshPhysicalMaterial color="#FFA000" roughness={0.15} clearcoat={0.8} />
      </mesh>
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

// 4. Artisanal Soft Cookie & Sleepy Bear Blanket (Slide 42 & 62)
export function ArtisanalCookieMesh({ color = "#FFAEC9" }: { color?: string }) {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Scalloped Petit Beurre butter biscuit base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.25, 1.6]} />
        <meshStandardMaterial color="#D2995B" roughness={0.7} />
      </mesh>
      {/* Cream Pillow */}
      <mesh position={[-0.6, 0.2, 0]} castShadow>
        <boxGeometry args={[0.65, 0.15, 1.1]} />
        <meshPhysicalMaterial color="#FFFDF5" roughness={0.3} clearcoat={0.2} />
      </mesh>
      {/* Sleeping Chocolate Bear Head on Pillow */}
      <ChocolateBearTopper position={[-0.6, 0.18, 0]} scale={0.85} />
      {/* Piped Icing Blanket with scalloped edge */}
      <mesh position={[0.35, 0.24, 0]} castShadow>
        <boxGeometry args={[1.25, 0.12, 1.4]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

// 5. Mèo Ngầu Y2K (Slide 58 FU CAKE)
export function CatY2KMesh({ frostingColor = "#FFAEC9" }: { frostingColor?: string }) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 1.0, 0.045), []);
  return (
    <group>
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
      </mesh>
      {/* Cat Ears & Y2K Star Glasses */}
      <CatGlassesEarsTopper position={[0, 0.5, 0.3]} scale={1.2} />
      {/* Airbrush Star freckles on cheeks */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 1.25]} rotation={[0, 0, 0.2]}>
          <planeGeometry args={[0.18, 0.18]} />
          <meshBasicMaterial color="#FF3366" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
}

// 6. Cún Tai Dài Đính Nơ (Slide 59 FU CAKE)
export function PuppyBowMesh({ frostingColor = "#FFF9E6" }: { frostingColor?: string }) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 1.0, 0.045), []);
  return (
    <group>
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial color={frostingColor} roughness={0.35} />
      </mesh>
      {/* Puppy Floppy Bow Ears */}
      <PuppyBowEarsTopper position={[0, 0.45, 0.2]} scale={1.2} />
      {/* Puppy Cute Nose & Eyes */}
      <group position={[0, 0.1, 1.48]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#2B1810" />
        </mesh>
        <mesh position={[-0.18, 0.12, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#2B1810" />
        </mesh>
        <mesh position={[0.18, 0.12, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#2B1810" />
        </mesh>
      </group>
    </group>
  );
}

// --- SHAPE-ACCURATE 3D CROSS-SECTION CUTAWAY BLUEPRINT ---

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
    shape === "round" || shape === "heart" || shape === "rectangle" || shape === "two-tier" || shape === "cat-y2k" || shape === "puppy-bow";
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
    shape === "croissant-bow" ||
    shape === "egg-tart" ||
    shape === "cookie" ||
    shape === "cookie-bear";

  // Staggered non-overlapping badge positions
  const labelL5Pos: [number, number, number] = [1.45, 0.45, 0.75];
  const labelL4Pos: [number, number, number] = [1.60, 0.20, 0.55];
  const labelL3Pos: [number, number, number] = [1.70, -0.05, 0.40];
  const labelL2Pos: [number, number, number] = [1.55, -0.30, 0.65];
  const labelL1Pos: [number, number, number] = [1.40, -0.55, 0.80];

  return (
    <group scale={groupScale} position={[0, -0.2, 0]}>
      {/* Render Shape-Aware Cutaway Mesh */}
      {shape === "rectangle" ? (
        // RECTANGULAR BAROQUE ACCURATE CUTAWAY (Front-Right Quadrant Sliced)
        <group>
          {/* Back-Left intact quadrant */}
          <mesh position={[-0.75, 0, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.0, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          {/* Back-Right intact quadrant */}
          <mesh position={[0.75, 0, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.0, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          {/* Front-Left intact quadrant */}
          <mesh position={[-0.75, 0, 0.55]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.0, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>

          {/* Front-Right EXPOSED INTERNAL LAYERS */}
          <group position={[0.75, 0, 0.55]}>
            {/* L1 Crunch Base */}
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[1.48, 0.1, 1.08]} />
              <meshStandardMaterial color="#B07D4F" roughness={0.9} />
            </mesh>
            {/* L2 Rectangular Sponge */}
            <mesh position={[0, -0.27, 0]} castShadow>
              <boxGeometry args={[1.48, 0.26, 1.08]} />
              <meshPhysicalMaterial
                color={spongeObj?.color || "#F7E7B4"}
                roughness={0.88}
                bumpMap={crumbBumpMap || undefined}
                bumpScale={0.035}
              />
            </mesh>
            {/* L3 Compote */}
            {gelee !== "none" && (
              <mesh position={[0, -0.08, 0]} castShadow>
                <boxGeometry args={[1.48, 0.12, 1.08]} />
                <meshPhysicalMaterial
                  color={geleeObj?.color || "#B8002E"}
                  roughness={0.1}
                  transmission={0.4}
                />
              </mesh>
            )}
            {/* L4 Mousse */}
            <mesh position={[0, 0.11, 0]} castShadow>
              <boxGeometry args={[1.48, 0.26, 1.08]} />
              <meshStandardMaterial color={mousseObj?.color || "#FFFDF5"} roughness={0.4} />
            </mesh>
            {/* L5 Top Frosting Layer */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[1.48, 0.24, 1.08]} />
              <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
            </mesh>
          </group>

          {/* 4 Wooden Dowels Ø6mm in rectangle corners */}
          <group>
            {[
              [0.55, 0, 0.45],
              [-0.55, 0, 0.45],
              [-0.55, 0, -0.45],
              [0.55, 0, -0.45],
            ].map((pos, idx) => (
              <mesh key={`rect-dowel-${idx}`} position={pos as [number, number, number]} castShadow>
                <cylinderGeometry args={[0.045, 0.045, 0.92, 16]} />
                <meshStandardMaterial color="#D2A679" roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>
      ) : (
        // ROUND / TIERED / HEART RADIAL CUTAWAY
        <group>
          {/* 3/4 Outer Frosting Shell */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 1.0, 64, 1, false, 0, Math.PI * 1.5]} />
            <meshPhysicalMaterial
              color={frostingColor}
              roughness={finish === "mirror-glaze" ? 0.04 : finish === "velvet-spray" ? 0.85 : 0.32}
              metalness={0.01}
              clearcoat={finish === "mirror-glaze" ? 1.0 : 0.15}
              bumpMap={finish === "rustic-buttercream" ? (frostingBumpMap || undefined) : undefined}
              bumpScale={0.018}
            />
          </mesh>

          {/* Layer 1: Base Crust */}
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
            <meshPhysicalMaterial
              color={
                shape === "cinnamon-roll"
                  ? "#C89666"
                  : shape === "croissant" || shape === "croissant-bow"
                  ? "#F0D399"
                  : shape === "egg-tart"
                  ? "#FFA000"
                  : shape === "cookie" || shape === "cookie-bear"
                  ? "#4A2E1B"
                  : spongeObj?.color || "#F7E7B4"
              }
              roughness={0.88}
              bumpMap={crumbBumpMap || undefined}
              bumpScale={0.035}
            />
          </mesh>

          {/* Layer 3: Compote / Swirl */}
          {(gelee !== "none" || isDaily) && (
            <mesh position={[0, -0.07, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.46, 1.46, 0.12, 64, 1, false, 0, Math.PI * 1.5]} />
              <meshPhysicalMaterial
                color={
                  shape === "cinnamon-roll"
                    ? "#5C381E"
                    : shape === "croissant" || shape === "croissant-bow"
                    ? "#E8A856"
                    : shape === "egg-tart"
                    ? "#FFB300"
                    : shape === "cookie" || shape === "cookie-bear"
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

          {/* Layer 4: Mousse / Custard */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.46, 1.46, 0.26, 64, 1, false, 0, Math.PI * 1.5]} />
            <meshStandardMaterial
              color={
                shape === "cinnamon-roll"
                  ? "#FFFDF5"
                  : shape === "croissant" || shape === "croissant-bow"
                  ? "#F5E1B5"
                  : shape === "egg-tart"
                  ? "#FFC107"
                  : shape === "cookie" || shape === "cookie-bear"
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
              <meshPhysicalMaterial color={frostingColor} roughness={0.3} transmission={0.08} />
            </mesh>
          </group>

          {/* 4 Central Support Dowels Ø6mm */}
          {(size >= 20 || shape === "two-tier") && (
            <group>
              {[
                [0.52, -0.05, 0.52],
                [-0.52, -0.05, 0.52],
                [-0.52, -0.05, -0.52],
                [0.52, -0.05, -0.52],
              ].map((pos, idx) => (
                <mesh key={`cutaway-dowel-${idx}`} position={pos as [number, number, number]} castShadow>
                  <cylinderGeometry args={[0.045, 0.045, 0.9, 16]} />
                  <meshStandardMaterial color="#D2A679" roughness={0.65} metalness={0.05} />
                </mesh>
              ))}
              <Html position={[0.65, 0.0, 0.65]} center>
                <div className="bg-amber-900/95 backdrop-blur-md text-amber-100 px-2.5 py-1 rounded-lg border border-amber-400 shadow-md text-[9px] font-bold whitespace-nowrap animate-pulse">
                  🛡️ 4x Trụ Dowel Gỗ Ø6mm + Đế Lót (Gia Cố Kết Cấu)
                </div>
              </Html>
            </group>
          )}
        </group>
      )}

      {/* Non-Overlapping Staggered Callout Badges */}
      <Html position={labelL5Pos} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-wishes-pink shadow-md text-[9px] font-bold text-wishes-chocolate whitespace-nowrap animate-pulse">
          {shape === "cinnamon-roll"
            ? "🧁 L5: Warm Vanilla Icing Glaze (12mm)"
            : shape === "croissant" || shape === "croissant-bow"
            ? "🥐 L5: Caramelized Golden Flakes (8mm)"
            : shape === "egg-tart"
            ? "🍮 L5: Crème Brûlée Blister Top (6mm)"
            : shape === "cookie" || shape === "cookie-bear"
            ? "🍪 L5: Valrhona Ganache Glaze (10mm)"
            : `🍰 L5: ${mousseObj?.name.split(" ")[0]} Top (15mm)`}
        </div>
      </Html>

      <Html position={labelL4Pos} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-wishes-pink shadow-md text-[9px] font-bold text-wishes-cherry whitespace-nowrap">
          {shape === "cinnamon-roll"
            ? "🍨 L4: Mascarpone Cream Cheese (25mm)"
            : shape === "croissant" || shape === "croissant-bow"
            ? "🥐 L4: Alvéolage Honeycomb Crumb (35mm)"
            : shape === "egg-tart"
            ? "🍮 L4: Silky Egg Custard Center (28mm)"
            : shape === "cookie" || shape === "cookie-bear"
            ? "🍫 L4: Molten Chocolate Pockets (22mm)"
            : `🍨 L4: ${mousseObj?.name} (25mm)`}
        </div>
      </Html>

      {(gelee !== "none" || isDaily) && (
        <Html position={labelL3Pos} center>
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-300 shadow-md text-[9px] font-bold text-red-700 whitespace-nowrap">
            {shape === "cinnamon-roll"
              ? "🌿 L3: Valrhona Cinnamon Swirl (12mm)"
              : shape === "croissant" || shape === "croissant-bow"
              ? "🧈 L3: Tourage Butter Sheen (15mm)"
              : shape === "egg-tart"
              ? "🍯 L3: Vanilla Custard Infusion (12mm)"
              : shape === "cookie" || shape === "cookie-bear"
              ? "🌰 L3: Roasted Hazelnut Core (14mm)"
              : `🍓 L3: ${geleeObj?.name.split("(")[0]} (15mm)`}
          </div>
        </Html>
      )}

      <Html position={labelL2Pos} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-300 shadow-md text-[9px] font-bold text-amber-900 whitespace-nowrap">
          {shape === "cinnamon-roll"
            ? "🌾 L2: Fluffy Cardamom Brioche (35mm)"
            : shape === "croissant" || shape === "croissant-bow"
            ? "🌾 L2: French Tourage Dough (81 Layers)"
            : shape === "egg-tart"
            ? "🌾 L2: Mille-Feuille Tart Shell (30mm)"
            : shape === "cookie" || shape === "cookie-bear"
            ? "🌾 L2: Fudgy Butter Dough (32mm)"
            : `🌾 L2: ${spongeObj?.name} (35mm)`}
        </div>
      </Html>

      <Html position={labelL1Pos} center>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500 shadow-md text-[9px] font-bold text-amber-950 whitespace-nowrap">
          {shape === "croissant" || shape === "croissant-bow" || shape === "egg-tart"
            ? "🥐 L1: Crisp Flaky Butter Base (10mm)"
            : "🍪 L1: Feuilletine Crunch Base (10mm)"}
        </div>
      </Html>
    </group>
  );
}
