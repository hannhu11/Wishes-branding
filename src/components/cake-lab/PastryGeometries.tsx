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
  length: number = 0.38
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
  const pearlsRef = useRef<THREE.InstancedMesh>(null);
  const rodsRef = useRef<THREE.InstancedMesh>(null);
  const pearlsCount = Math.floor(count * 0.55);
  const rodsCount = count - pearlsCount;

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
    const dummy = new THREE.Object3D();

    if (pearlsRef.current) {
      for (let i = 0; i < pearlsCount; i++) {
        const r = (0.35 + Math.sqrt(i / pearlsCount) * 0.58) * radius;
        const theta = i * 2.39996;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        dummy.position.set(x, y + 0.003, z);
        dummy.rotation.set(Math.sin(i) * 0.2, theta, Math.cos(i) * 0.2);
        dummy.scale.setScalar(0.016 + (i % 3) * 0.004);
        dummy.updateMatrix();

        pearlsRef.current.setMatrixAt(i, dummy.matrix);
        pearlsRef.current.setColorAt(i, colors[i % colors.length]);
      }
      pearlsRef.current.instanceMatrix.needsUpdate = true;
      if (pearlsRef.current.instanceColor) pearlsRef.current.instanceColor.needsUpdate = true;
    }

    if (rodsRef.current) {
      for (let i = 0; i < rodsCount; i++) {
        const r = (0.3 + Math.sqrt(i / rodsCount) * 0.62) * radius;
        const theta = (i + 0.5) * 2.39996;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        dummy.position.set(x, y + 0.003, z);
        dummy.rotation.set(Math.PI * 0.48, (i * 1.3) % Math.PI, Math.sin(i) * 0.15);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        rodsRef.current.setMatrixAt(i, dummy.matrix);
        rodsRef.current.setColorAt(i, colors[(i + 3) % colors.length]);
      }
      rodsRef.current.instanceMatrix.needsUpdate = true;
      if (rodsRef.current.instanceColor) rodsRef.current.instanceColor.needsUpdate = true;
    }
  }, [radius, y, pearlsCount, rodsCount, colors]);

  return (
    <group>
      <instancedMesh ref={pearlsRef} args={[undefined, undefined, pearlsCount]} castShadow receiveShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhysicalMaterial roughness={0.15} clearcoat={0.9} clearcoatRoughness={0.1} />
      </instancedMesh>
      <instancedMesh ref={rodsRef} args={[undefined, undefined, rodsCount]} castShadow receiveShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.045, 8]} />
        <meshPhysicalMaterial roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.15} />
      </instancedMesh>
    </group>
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
  shapeType = "round",
}: {
  radius?: number;
  topY?: number;
  swagsCount?: number;
  color?: string;
  shapeType?: CakeShape;
}) {
  const swagTubes = useMemo(() => {
    const arr = [];
    const rosetteGeom = createFlutedRosetteGeometry(0.055, 8, 8);

    if (shapeType === "rectangle") {
      const halfW = 1.45;
      const halfD = 1.05;
      const wallY = topY;

      // 8 perimeter junction anchor points around the rectangular cake
      const perimeterPoints: [number, number][] = [
        [-halfW, -halfD],
        [0, -halfD],
        [halfW, -halfD],
        [halfW, 0],
        [halfW, halfD],
        [0, halfD],
        [-halfW, halfD],
        [-halfW, 0],
      ];

      for (let i = 0; i < perimeterPoints.length; i++) {
        const p0 = perimeterPoints[i];
        const p1 = perimeterPoints[(i + 1) % perimeterPoints.length];

        const points: THREE.Vector3[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const x = p0[0] + u * (p1[0] - p0[0]);
          const z = p0[1] + u * (p1[1] - p0[1]);
          const sag = 0.16 * Math.sin(Math.PI * u);
          const y = wallY - sag - 0.08;
          points.push(new THREE.Vector3(x, y, z));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.022, 8, false);
        const junctionPos: [number, number, number] = [p0[0], wallY - 0.08, p0[1]];

        arr.push({ tubeGeom, junctionPos, rosetteGeom });
      }
      return arr;
    }

    if (shapeType === "heart") {
      const shape = new THREE.Shape();
      shape.moveTo(0.5, 0.5);
      shape.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0);
      shape.bezierCurveTo(-0.6, -0.6, -0.6, 0.7, -0.6, 0.7);
      shape.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9);
      shape.bezierCurveTo(1.2, 1.54, 1.6, 1.1, 1.6, 0.7);
      shape.bezierCurveTo(1.6, 0.7, 1.6, 0, 1.0, 0);
      shape.bezierCurveTo(0.7, 0.5, 0.5, 0.5, 0.5, 0.5);

      const count = 6;
      const pts = shape.getSpacedPoints(count);
      for (let i = 0; i < count; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % count];
        const x0 = (p0.x - 0.5) * 1.25;
        const z0 = (p0.y - 0.95) * 1.25;
        const x1 = (p1.x - 0.5) * 1.25;
        const z1 = (p1.y - 0.95) * 1.25;

        const points: THREE.Vector3[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const x = x0 + u * (x1 - x0);
          const z = z0 + u * (z1 - z0);
          const sag = 0.16 * Math.sin(Math.PI * u);
          const y = topY - sag - 0.08;
          points.push(new THREE.Vector3(x, y, z));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.022, 8, false);
        const junctionPos: [number, number, number] = [x0, topY - 0.08, z0];
        arr.push({ tubeGeom, junctionPos, rosetteGeom });
      }
      return arr;
    }

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
  }, [radius, topY, swagsCount, shapeType]);

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
  const lambethShellGeom = useMemo(() => createLambethShellGeometry(0.065, 0.38), []);
  const rosetteGeom = useMemo(() => createFlutedRosetteGeometry(0.075, 8, 8), []);

  const beads = useMemo(() => {
    const arr = [];

    if (shapeType === "heart") {
      const shape = createSweetcoreHeartShape();
      const pts = shape.getSpacedPoints(count);
      for (let i = 0; i < count; i++) {
        const p = pts[i];
        const nextP = pts[(i + 1) % count];
        const x = p.x * 0.92;
        const z = -p.y * 0.92;
        const nextX = nextP.x * 0.92;
        const nextZ = -nextP.y * 0.92;
        const dx = nextX - x;
        const dz = nextZ - z;
        const rotationY = Math.atan2(-dz, dx);
        arr.push({ x, z, rotationY });
      }
      return arr;
    }

    if (shapeType === "rectangle") {
      const w = 1.42;
      const h = 1.02;
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
        const z = -p.y;
        const nextX = nextP.x;
        const nextZ = -nextP.y;
        const dx = nextX - x;
        const dz = nextZ - z;
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

export function createSweetcoreHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Centered heart curve with smooth lobes and wonky charm
  shape.moveTo(0, 0.35);
  shape.bezierCurveTo(-0.05, 0.72, -0.65, 1.15, -1.25, 0.95);
  shape.bezierCurveTo(-1.85, 0.75, -1.80, 0.12, -1.30, -0.42);
  shape.bezierCurveTo(-0.90, -0.92, -0.32, -1.30, 0, -1.60);
  shape.bezierCurveTo(0.32, -1.30, 0.90, -0.92, 1.30, -0.42);
  shape.bezierCurveTo(1.80, 0.12, 1.85, 0.75, 1.25, 0.95);
  shape.bezierCurveTo(0.65, 1.15, 0.05, 0.72, 0, 0.35);
  return shape;
}

export function useWonkyHeartGeometry() {
  return useMemo(() => {
    const shape = createSweetcoreHeartShape();
    const extrudeSettings = {
      depth: 0.92,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(-Math.PI / 2);
    geom.computeVertexNormals();
    return geom;
  }, []);
}

export function useBaroqueRectangleGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.55;
    const h = 1.15;
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
      depth: 0.90,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(-Math.PI / 2);
    geom.computeVertexNormals();
    return geom;
  }, []);
}

// --- DAILY BAKED GOODS & SCULPTED PASTRIES (PROPOSAL SLIDES 40-45 & 58-64) ---

// 1. Signature Cinnamon Roll (Slide 40 & 61)
// Flat horizontal brioche bun with oozing glossy vanilla cream cheese glaze and pastel star sprinkles
export function CinnamonRollMesh() {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Base Foundation Bun */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.30, 1.36, 0.28, 48]} />
        <meshPhysicalMaterial color="#C58548" roughness={0.6} />
      </mesh>
      {/* Outer Brioche Spiral Ring */}
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.05, 0.26, 24, 48]} />
        <meshPhysicalMaterial color="#BA7638" roughness={0.55} clearcoat={0.2} />
      </mesh>
      {/* Middle Cinnamon Sugar Layer */}
      <mesh position={[0, 0.30, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.68, 0.22, 24, 48]} />
        <meshPhysicalMaterial color="#884A22" roughness={0.65} />
      </mesh>
      {/* Center Spiral Core */}
      <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.34, 32]} />
        <meshPhysicalMaterial color="#6B3514" roughness={0.65} />
      </mesh>

      {/* Oozing Warm Cream Cheese Vanilla Glaze Top */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[0.98, 36]} />
        <meshPhysicalMaterial
          color="#FFFDF7"
          roughness={0.06}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transmission={0.12}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFEEDD")}
        />
      </mesh>
      {/* Glaze Organic Drips spilling over the perimeter */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 1.05 + Math.sin(i * 2.5) * 0.10;
        const dripLen = 0.16 + Math.sin(i * 1.8) * 0.08;
        return (
          <group key={`glaze-drip-${i}`} position={[Math.cos(a) * r, 0.38, Math.sin(a) * r]}>
            <mesh position={[0, -dripLen / 2, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.035, dripLen, 12]} />
              <meshPhysicalMaterial color="#FFFDF7" roughness={0.06} clearcoat={1.0} />
            </mesh>
            <mesh position={[0, -dripLen, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshPhysicalMaterial color="#FFFDF7" roughness={0.06} clearcoat={1.0} />
            </mesh>
          </group>
        );
      })}

      {/* Pastel Star Confetti (Slide 40 Reference) */}
      {[
        { x: -0.3, z: -0.2, c: "#FFAEC9" },
        { x: 0.35, z: 0.15, c: "#A0C4FF" },
        { x: -0.1, z: 0.38, c: "#FFD166" },
        { x: 0.45, z: -0.3, c: "#BEE3DB" },
        { x: -0.42, z: 0.2, c: "#FF3366" },
        { x: 0.15, z: -0.38, c: "#FFAEC9" },
        { x: 0.0, z: 0.0, c: "#FFD166" },
      ].map((star, idx) => (
        <mesh key={`cinnamon-star-${idx}`} position={[star.x, 0.44, star.z]} rotation={[0, idx * 0.8, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.015, 5]} />
          <meshStandardMaterial color={star.c} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// 2. French Butter Croissant (Slide 45 & 64)
// Lies horizontally, golden flaky laminated pastry with central waist ribbon
export function FrenchCroissantMesh() {
  return (
    <group position={[0, -0.05, 0]} rotation={[0, -0.2, 0]}>
      {/* Central Spindle Body (Plumpest waist) */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.55, 0.65, 32]} />
        <meshPhysicalMaterial
          color="#D27E26"
          roughness={0.28}
          clearcoat={0.35}
          clearcoatRoughness={0.3}
          metalness={0.02}
        />
      </mesh>

      {/* Mid Laminated Lobes (Left & Right) */}
      {[-1, 1].map((dir, i) => (
        <group key={`mid-${i}`}>
          <mesh
            position={[dir * 0.42, 0.20, 0.12]}
            rotation={[Math.PI / 2, 0, -dir * 0.35]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.42, 0.46, 0.55, 28]} />
            <meshPhysicalMaterial
              color="#DC892E"
              roughness={0.3}
              clearcoat={0.3}
            />
          </mesh>
          {/* Outer Curved Horns */}
          <mesh
            position={[dir * 0.82, 0.16, 0.38]}
            rotation={[Math.PI / 2, 0, -dir * 0.75]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.28, 0.38, 0.55, 24]} />
            <meshPhysicalMaterial
              color="#C97520"
              roughness={0.32}
              clearcoat={0.25}
            />
          </mesh>
          {/* Tapered Pointed Tips curling forward */}
          <mesh
            position={[dir * 1.15, 0.12, 0.72]}
            rotation={[Math.PI / 2, 0, -dir * 1.25]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[0.22, 0.48, 20]} />
            <meshPhysicalMaterial
              color="#B66418"
              roughness={0.35}
              clearcoat={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Flaky Lamination Shell Ribs across top */}
      {[-0.2, 0, 0.2].map((xOffset, idx) => (
        <mesh
          key={`rib-${idx}`}
          position={[xOffset, 0.38, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.48, 0.05, 12, 32, Math.PI]} />
          <meshPhysicalMaterial
            color="#ECA248"
            roughness={0.25}
            clearcoat={0.4}
          />
        </mesh>
      ))}

      {/* Signature Coquette Pastel Blue Satin Ribbon Bow (Slide 45 Wishes Proposal) */}
      <SatinRibbonBow position={[0, 0.44, 0.12]} scale={1.05} color="#A0C4FF" />

      {/* Subtle dusting of powdered sugar sparkles */}
      {Array.from({ length: 18 }).map((_, i) => {
        const sx = (Math.random() - 0.5) * 1.2;
        const sz = (Math.random() - 0.5) * 0.6;
        return (
          <mesh key={`sugar-${i}`} position={[sx, 0.42 + Math.random() * 0.04, sz]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

// 3. Portuguese Custard Egg Tart (Pastéis de Nata - Slide 43 & 63)
export function CustardEggTartMesh() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Laminated Fluted Tart Crust Cup (81 Layers of butter puff) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 0.85, 0.65, 36]} />
        <meshPhysicalMaterial color="#C57E3B" roughness={0.6} clearcoat={0.2} />
      </mesh>
      {/* Fluted Rim Edge (Lies horizontally along top edge) */}
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.32, 0.12, 16, 48]} />
        <meshPhysicalMaterial color="#B26A28" roughness={0.55} clearcoat={0.25} />
      </mesh>

      {/* 2. Silky Golden Custard Interior (Concave Creme) */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[1.18, 0.88, 0.28, 36]} />
        <meshPhysicalMaterial
          color="#FFA500"
          roughness={0.16}
          clearcoat={0.85}
          clearcoatRoughness={0.15}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFE5A3")}
        />
      </mesh>

      {/* 3. Caramelized Charred Blisters (Crème Brûlée Torch Spots) */}
      {[
        { x: 0.25, z: 0.15, r: 0.26, color: "#3B1906" },
        { x: -0.32, z: -0.22, r: 0.22, color: "#4A220A" },
        { x: 0.12, z: -0.42, r: 0.18, color: "#582C0E" },
        { x: -0.38, z: 0.25, r: 0.16, color: "#3B1906" },
        { x: 0.45, z: -0.15, r: 0.14, color: "#4A220A" },
      ].map((b, idx) => (
        <mesh key={`blister-${idx}`} position={[b.x, 0.37, b.z]} rotation={[-Math.PI / 2, 0, idx]}>
          <circleGeometry args={[b.r, 16]} />
          <meshPhysicalMaterial color={b.color} roughness={0.22} clearcoat={0.6} />
        </mesh>
      ))}

      {/* Fresh Berry Accent on side */}
      <group position={[0.85, 0.42, 0.65]}>
        <RealisticCherry position={[0, 0, 0]} scale={0.65} />
      </group>
    </group>
  );
}

// 4. Artisanal Soft Cookie & Sleepy Bear Blanket (Slide 42 & 62)
export function ArtisanalCookieMesh({ color = "#FFAEC9" }: { color?: string }) {
  return (
    <group position={[0, -0.12, 0]}>
      {/* 1. Scalloped Petit Beurre Biscuit Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.22, 1.7]} />
        <meshPhysicalMaterial color="#D79854" roughness={0.68} />
      </mesh>
      {/* Scalloped perimeter border notches */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`notch-x-${i}`} position={[-1.05 + i * 0.3, 0.11, 0.85]}>
          <cylinderGeometry args={[0.06, 0.06, 0.22, 12]} />
          <meshStandardMaterial color="#C68540" roughness={0.7} />
        </mesh>
      ))}

      {/* 2. Soft Whipped Cream Pillow */}
      <mesh position={[-0.65, 0.18, 0]} castShadow>
        <boxGeometry args={[0.72, 0.14, 1.25]} />
        <meshPhysicalMaterial color="#FFFDF7" roughness={0.25} clearcoat={0.3} />
      </mesh>

      {/* 3. Sleeping Chocolate Bear Head on Pillow */}
      <group position={[-0.65, 0.25, 0]} rotation={[0, 0.3, -0.15]}>
        <ChocolateBearTopper position={[0, 0, 0]} scale={0.95} />
      </group>

      {/* 4. Pastel Frosting Blanket with Scalloped Folded Edge */}
      <mesh position={[0.38, 0.22, 0]} castShadow>
        <boxGeometry args={[1.35, 0.14, 1.45]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.28}
          clearcoat={0.3}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFF5EA")}
        />
      </mesh>
      {/* Blanket folded cuff */}
      <mesh position={[-0.28, 0.28, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.45, 16]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} clearcoat={0.3} />
      </mesh>

      {/* Tiny Sugar Stars on Blanket */}
      {[
        { x: 0.1, z: -0.4, c: "#FFF9E6" },
        { x: 0.4, z: 0.3, c: "#A0C4FF" },
        { x: 0.7, z: -0.2, c: "#FFF9E6" },
        { x: 0.2, z: 0.1, c: "#FFD166" },
      ].map((s, idx) => (
        <mesh key={`cookie-star-${idx}`} position={[s.x, 0.30, s.z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.015, 5]} />
          <meshBasicMaterial color={s.c} />
        </mesh>
      ))}
    </group>
  );
}

// 5. Mèo Ngầu Y2K (Slide 58 FU CAKE)
export function CatY2KMesh({
  frostingColor = "#FFAEC9",
  pipingColor = "#FFFDF5",
}: {
  frostingColor?: string;
  pipingColor?: string;
}) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 0.95, 0.045), []);
  return (
    <group position={[0, -0.05, 0]}>
      {/* Plump Cat Cake Body */}
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={0.3}
          clearcoat={0.25}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFF5EA")}
        />
      </mesh>

      {/* 3D Sculpted Pointed Cat Ears with Inner Pink Pads */}
      {[-1, 1].map((dir, i) => (
        <group key={`ear-${i}`} position={[dir * 0.72, 0.62, -0.32]} rotation={[0.15, -dir * 0.2, dir * 0.25]}>
          {/* Outer Ear Cone */}
          <mesh castShadow>
            <coneGeometry args={[0.34, 0.58, 18]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} clearcoat={0.2} />
          </mesh>
          {/* Inner Sweet Pink Ear Pad */}
          <mesh position={[0, 0, 0.09]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.22, 0.44, 16]} />
            <meshPhysicalMaterial color="#FFB5C5" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Airbrushed Star Spots across forehead & body (Slide 58) */}
      {[
        { x: -0.65, y: 0.35, z: 1.15, c: "#FF6B35", s: 0.05 },
        { x: 0.72, y: 0.32, z: 1.1, c: "#FFAEC9", s: 0.045 },
        { x: 0, y: 0.55, z: 1.25, c: "#FFE66D", s: 0.055 },
        { x: -0.85, y: -0.1, z: 0.9, c: "#A0C4FF", s: 0.04 },
        { x: 0.88, y: -0.08, z: 0.95, c: "#FF6B35", s: 0.045 },
      ].map((star, idx) => (
        <mesh key={`cat-star-${idx}`} position={[star.x, star.y, star.z]} rotation={[0, 0, idx * 0.6]}>
          <cylinderGeometry args={[star.s, star.s, 0.015, 5]} />
          <meshBasicMaterial color={star.c} />
        </mesh>
      ))}

      {/* Y2K Star Sunglasses across front face (Slide 58 FU CAKE) */}
      <group position={[0, 0.24, 1.45]}>
        {/* Left Star Sunglasses Frame & Lens */}
        <group position={[-0.38, 0, 0]} rotation={[0, 0, 0.08]}>
          {/* Outer Orange/Gold Frame */}
          <mesh position={[0, 0, -0.01]}>
            <cylinderGeometry args={[0.27, 0.27, 0.04, 5]} />
            <meshStandardMaterial color="#FF6B35" metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Dark Mirrored Lens */}
          <mesh position={[0, 0, 0.015]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 5]} />
            <meshPhysicalMaterial color="#111111" roughness={0.05} clearcoat={1.0} reflectivity={0.9} />
          </mesh>
          {/* Star Catchlight Reflection */}
          <mesh position={[0.07, 0.07, 0.03]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.005, 5]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Right Star Sunglasses Frame & Lens */}
        <group position={[0.38, 0, 0]} rotation={[0, 0, -0.08]}>
          {/* Outer Orange/Gold Frame */}
          <mesh position={[0, 0, -0.01]}>
            <cylinderGeometry args={[0.27, 0.27, 0.04, 5]} />
            <meshStandardMaterial color="#FF6B35" metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Dark Mirrored Lens */}
          <mesh position={[0, 0, 0.015]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 5]} />
            <meshPhysicalMaterial color="#111111" roughness={0.05} clearcoat={1.0} reflectivity={0.9} />
          </mesh>
          {/* Star Catchlight Reflection */}
          <mesh position={[-0.07, 0.07, 0.03]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.005, 5]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Chic Sunglasses Golden Bridge */}
        <mesh position={[0, 0.04, 0.01]}>
          <boxGeometry args={[0.26, 0.035, 0.02]} />
          <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.15} />
        </mesh>
      </group>

      {/* Chubby Cream Muzzle Puffs (2 Sculpted Puffy Cheeks) */}
      <group position={[0, -0.06, 1.48]}>
        {/* Left Cheek Puff */}
        <mesh position={[-0.14, 0, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshPhysicalMaterial color="#FFFDF7" roughness={0.3} clearcoat={0.2} />
        </mesh>
        {/* Right Cheek Puff */}
        <mesh position={[0.14, 0, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshPhysicalMaterial color="#FFFDF7" roughness={0.3} clearcoat={0.2} />
        </mesh>

        {/* Cute Heart Nose */}
        <mesh position={[0, 0.06, 0.08]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.055, 0.065, 3]} />
          <meshBasicMaterial color="#FF3366" />
        </mesh>

        {/* Piped Whiskers Left */}
        {[-0.03, 0.03].map((wy, idx) => (
          <mesh key={`lw-${idx}`} position={[-0.30, wy - 0.02, 0.04]} rotation={[0, 0, wy * 2.5]}>
            <boxGeometry args={[0.22, 0.014, 0.01]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
        ))}
        {/* Piped Whiskers Right */}
        {[-0.03, 0.03].map((wy, idx) => (
          <mesh key={`rw-${idx}`} position={[0.30, wy - 0.02, 0.04]} rotation={[0, 0, -wy * 2.5]}>
            <boxGeometry args={[0.22, 0.014, 0.01]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
        ))}
      </group>

      {/* Pastel Flower Rosette Base Collar */}
      <HautePipingPattern
        style="drop-flowers"
        radius={1.52}
        y={-0.45}
        color={pipingColor || "#BDE0FE"}
        shapeType="round"
      />
    </group>
  );
}

// 6. Cún Tai Dài Đính Nơ (Slide 59 FU CAKE)
export function PuppyBowMesh({
  frostingColor = "#FFF9E6",
  pipingColor = "#A0C4FF",
}: {
  frostingColor?: string;
  pipingColor?: string;
}) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 0.95, 0.045), []);
  return (
    <group position={[0, -0.05, 0]}>
      {/* Puppy Cake Body */}
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={0.35}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFF5EA")}
        />
      </mesh>

      {/* Two Long Floppy Droopy Cream Ears (Left & Right) with Satin Bows */}
      {[-1, 1].map((dir, i) => (
        <group key={`ear-${i}`} position={[dir * 1.35, 0.22, 0.2]} rotation={[0, 0, -dir * 0.35]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.24, 0.72, 16, 24]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.4} />
          </mesh>
          {/* Fluffy piped ear swirl texture rings */}
          {[-0.15, 0.05, 0.22].map((ey, idx) => (
            <mesh key={`ering-${idx}`} position={[0, ey, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.035, 8, 20]} />
              <meshPhysicalMaterial color={frostingColor} roughness={0.35} />
            </mesh>
          ))}
          {/* Baby Blue Satin Ribbon Bow at top of ear (Slide 59) */}
          <SatinRibbonBow position={[0, 0.44, 0.15]} scale={0.78} color="#A0C4FF" />
        </group>
      ))}

      {/* Airbrushed Star Spots on puppy cheeks & top */}
      {[
        { x: -0.65, y: 0.32, z: 1.1, c: "#A0C4FF" },
        { x: 0.65, y: 0.32, z: 1.1, c: "#FFAEC9" },
        { x: 0, y: 0.52, z: 1.2, c: "#FFE66D" },
      ].map((star, idx) => (
        <mesh key={`pup-star-${idx}`} position={[star.x, star.y, star.z]} rotation={[0, 0, idx * 0.7]}>
          <cylinderGeometry args={[0.045, 0.045, 0.015, 5]} />
          <meshBasicMaterial color={star.c} />
        </mesh>
      ))}

      {/* Chubby Cream Muzzle Bump */}
      <mesh position={[0, 0.06, 1.48]} castShadow>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshPhysicalMaterial color="#FFFDF7" roughness={0.28} clearcoat={0.2} />
      </mesh>

      {/* Puppy Face: Glossy Black Button Eyes & Nose */}
      <group position={[0, 0.12, 1.55]}>
        {/* Glossy Black Button Nose */}
        <mesh position={[0, -0.04, 0.12]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshPhysicalMaterial color="#1A1A1A" roughness={0.1} clearcoat={1.0} />
        </mesh>
        {/* Left Button Eye with White Catchlight */}
        <group position={[-0.26, 0.08, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshPhysicalMaterial color="#1A1A1A" roughness={0.1} clearcoat={1.0} />
          </mesh>
          <mesh position={[0.015, 0.015, 0.04]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
        {/* Right Button Eye with White Catchlight */}
        <group position={[0.26, 0.08, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshPhysicalMaterial color="#1A1A1A" roughness={0.1} clearcoat={1.0} />
          </mesh>
          <mesh position={[-0.015, 0.015, 0.04]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Rosy Blush Cheeks */}
        <mesh position={[-0.42, -0.04, -0.08]}>
          <circleGeometry args={[0.09, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.65} />
        </mesh>
        <mesh position={[0.42, -0.04, -0.08]}>
          <circleGeometry args={[0.09, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Front Paws with Ruby Cherry (Slide 59) */}
      <group position={[0, -0.32, 1.42]}>
        {/* Left Paw */}
        <mesh position={[-0.25, 0, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshPhysicalMaterial color={frostingColor} roughness={0.35} />
        </mesh>
        {/* Right Paw */}
        <mesh position={[0.25, 0, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshPhysicalMaterial color={frostingColor} roughness={0.35} />
        </mesh>
        {/* Glossy Ruby Cherry nestled at paw center */}
        <RealisticCherry position={[0, 0.04, 0.08]} scale={0.72} />
      </group>

      {/* Base border rosettes */}
      <HautePipingPattern
        style="wilton-shell"
        radius={1.52}
        y={-0.45}
        color={pipingColor || "#FFAEC9"}
        shapeType="round"
      />
    </group>
  );
}

// 7. Bánh Thỏ Tai Dài Harajuku (Harajuku Bunny Bow Cake - MỚI)
export function BunnyBowMesh({
  frostingColor = "#FFAEC9",
  pipingColor = "#FFFDF5",
}: {
  frostingColor?: string;
  pipingColor?: string;
}) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 0.95, 0.045), []);
  return (
    <group position={[0, -0.05, 0]}>
      {/* Plump Bunny Cake Body */}
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={0.3}
          clearcoat={0.2}
          sheen={0.45}
          sheenColor={new THREE.Color("#FFF5EA")}
        />
      </mesh>

      {/* Tall Upright Bunny Ears with Sweet Pink Inner Pads */}
      {[-1, 1].map((dir, i) => (
        <group
          key={`bunny-ear-${i}`}
          position={[dir * 0.48, 0.88, -0.2]}
          rotation={[0.12, -dir * 0.08, dir * 0.16]}
        >
          {/* Main Ear Column */}
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.18, 0.95, 16, 24]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.32} clearcoat={0.2} />
          </mesh>
          {/* Inner Pink Ear Pad */}
          <mesh position={[0, 0, 0.08]}>
            <capsuleGeometry args={[0.11, 0.75, 16, 24]} />
            <meshPhysicalMaterial color="#FFB5C5" roughness={0.4} />
          </mesh>
          {/* Satin Ribbon Bow at ear base */}
          <SatinRibbonBow position={[0, -0.38, 0.16]} scale={0.75} color="#A0C4FF" />
        </group>
      ))}

      {/* Daisy Rosette Flower Crown between ears */}
      <PipedDaisyFlower position={[0, 0.58, 0.1]} scale={0.8} />

      {/* Innocent Bunny Face: Black Button Eyes, Heart Nose & Cheeks */}
      <group position={[0, 0.12, 1.48]}>
        {/* Left Eye */}
        <group position={[-0.24, 0.06, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshPhysicalMaterial color="#1A1A1A" roughness={0.1} clearcoat={1.0} />
          </mesh>
          <mesh position={[0.015, 0.015, 0.038]}>
            <sphereGeometry args={[0.013, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
        {/* Right Eye */}
        <group position={[0.24, 0.06, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshPhysicalMaterial color="#1A1A1A" roughness={0.1} clearcoat={1.0} />
          </mesh>
          <mesh position={[-0.015, 0.015, 0.038]}>
            <sphereGeometry args={[0.013, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Cute Heart-shaped Pink Bunny Nose */}
        <mesh position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.05, 0.06, 3]} />
          <meshBasicMaterial color="#FF3366" />
        </mesh>

        {/* Rosy Pink Blush */}
        <mesh position={[-0.38, -0.06, -0.03]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.38, -0.06, -0.03]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Base Flower Collar */}
      <HautePipingPattern
        style="drop-flowers"
        radius={1.52}
        y={-0.45}
        color={pipingColor || "#FFFDF5"}
        shapeType="round"
      />
    </group>
  );
}

// 8. Bánh Bento Gấu Hàn Quốc (Korean Bento Bear Cake - MỚI)
export function BearFaceMesh({
  frostingColor = "#FFE66D",
  pipingColor = "#FFF9E6",
}: {
  frostingColor?: string;
  pipingColor?: string;
}) {
  const roundBodyGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 0.95, 0.045), []);
  return (
    <group position={[0, -0.05, 0]}>
      {/* Plump Bear Cake Body */}
      <mesh geometry={roundBodyGeom} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={frostingColor}
          roughness={0.32}
          clearcoat={0.2}
          sheen={0.4}
          sheenColor={new THREE.Color("#FFF5EA")}
        />
      </mesh>

      {/* 2 Cute Round Bear Ears on top */}
      {[-1, 1].map((dir, i) => (
        <group
          key={`bear-ear-${i}`}
          position={[dir * 0.78, 0.58, -0.22]}
          rotation={[0.1, -dir * 0.15, dir * 0.22]}
        >
          {/* Round Ear */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.32, 20, 20]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.35} />
          </mesh>
          {/* Inner Cream Ear Pad */}
          <mesh position={[0, 0, 0.12]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshPhysicalMaterial color="#FFFDF7" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Mini Birthday Party Hat tilted playfully on right ear */}
      <group position={[0.42, 0.76, 0.05]} rotation={[0.1, 0, -0.25]}>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.48, 16]} />
          <meshPhysicalMaterial color="#FFAEC9" roughness={0.25} clearcoat={0.4} />
        </mesh>
        {/* Hat Pom-pom */}
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshPhysicalMaterial color="#FFFDF7" roughness={0.2} />
        </mesh>
      </group>

      {/* Cream Muzzle Oval */}
      <mesh position={[0, 0.02, 1.48]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshPhysicalMaterial color="#FFFDF7" roughness={0.25} />
      </mesh>

      {/* Bear Face: Black Button Eyes, Chocolate Oval Nose & Smile */}
      <group position={[0, 0.12, 1.56]}>
        {/* Oval Chocolate Nose */}
        <mesh position={[0, -0.07, 0.12]} castShadow>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshPhysicalMaterial color="#3D2314" roughness={0.15} clearcoat={1.0} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.28, 0.05, -0.04]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshPhysicalMaterial color="#3D2314" roughness={0.15} clearcoat={1.0} />
        </mesh>
        <mesh position={[0.28, 0.05, -0.04]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshPhysicalMaterial color="#3D2314" roughness={0.15} clearcoat={1.0} />
        </mesh>

        {/* Rosy Blush */}
        <mesh position={[-0.44, -0.06, -0.1]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.44, -0.06, -0.1]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#FFAEC9" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Base Wilton Shell Border */}
      <HautePipingPattern
        style="wilton-shell"
        radius={1.52}
        y={-0.45}
        color={pipingColor || "#FFF9E6"}
        shapeType="round"
      />
    </group>
  );
}

// Helper component: 3D Leader Line connecting cut face to callout badge
function LeaderLine({
  from,
  to,
  color = "#DAA520",
}: {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}) {
  const lineObject = useMemo(() => {
    const midX = (from[0] + to[0]) * 0.5;
    const points = [
      new THREE.Vector3(...from),
      new THREE.Vector3(midX, from[1], (from[2] + to[2]) * 0.5),
      new THREE.Vector3(...to),
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.65 });
    return new THREE.Line(geom, mat);
  }, [from, to, color]);

  return (
    <group>
      <mesh position={from}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <primitive object={lineObject} />
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

  // Clean non-overlapping architectural HUD badge positions
  const labelL5Pos: [number, number, number] = [1.88, 0.54, 0.25];
  const labelL4Pos: [number, number, number] = [1.88, 0.27, 0.25];
  const labelL3Pos: [number, number, number] = [1.88, 0.00, 0.25];
  const labelL2Pos: [number, number, number] = [1.88, -0.27, 0.25];
  const labelL1Pos: [number, number, number] = [1.88, -0.54, 0.25];

  // Leader line anchor coordinates on the visible cut face
  const cutFaceAnchors = useMemo(() => {
    if (shape === "heart") {
      return {
        l5: [0.01, 0.38, 0.25] as [number, number, number],
        l4: [0.01, 0.13, 0.25] as [number, number, number],
        l3: [0.01, -0.06, 0.25] as [number, number, number],
        l2: [0.01, -0.25, 0.25] as [number, number, number],
        l1: [0.01, -0.43, 0.25] as [number, number, number],
      };
    }
    // Rectangle or radial round cut face
    return {
      l5: [0.72, 0.38, 0.01] as [number, number, number],
      l4: [0.72, 0.11, 0.01] as [number, number, number],
      l3: [0.72, -0.08, 0.01] as [number, number, number],
      l2: [0.72, -0.27, 0.01] as [number, number, number],
      l1: [0.72, -0.45, 0.01] as [number, number, number],
    };
  }, [shape]);

  // Half-heart geometries for shape-accurate heart cutaway
  const { heartL1, heartL2, heartL3, heartL4, heartL5, heartFloatingSlice } = useMemo(() => {
    const shapeL = new THREE.Shape();
    shapeL.moveTo(0, -0.65);
    shapeL.bezierCurveTo(-0.55, -0.25, -1.25, 0.15, -1.25, 0.55);
    shapeL.bezierCurveTo(-1.25, 0.95, -0.65, 1.15, 0, 0.75);
    shapeL.lineTo(0, -0.65);

    const shapeR = new THREE.Shape();
    shapeR.moveTo(0, -0.65);
    shapeR.bezierCurveTo(0.55, -0.25, 1.25, 0.15, 1.25, 0.55);
    shapeR.bezierCurveTo(1.25, 0.95, 0.65, 1.15, 0, 0.75);
    shapeR.lineTo(0, -0.65);

    const makeExtrusion = (s: THREE.Shape, depth: number) => {
      const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
      g.rotateX(-Math.PI / 2);
      return g;
    };

    return {
      heartL1: makeExtrusion(shapeL, 0.10),
      heartL2: makeExtrusion(shapeL, 0.26),
      heartL3: makeExtrusion(shapeL, 0.12),
      heartL4: makeExtrusion(shapeL, 0.26),
      heartL5: makeExtrusion(shapeL, 0.24),
      heartFloatingSlice: makeExtrusion(shapeR, 0.98),
    };
  }, []);

  return (
    <group scale={groupScale} position={[0, -0.2, 0]}>
      {/* 3D Leader Lines connecting cut faces to callout badges */}
      <LeaderLine from={cutFaceAnchors.l5} to={labelL5Pos} color="#FF3366" />
      <LeaderLine from={cutFaceAnchors.l4} to={labelL4Pos} color="#A0C4FF" />
      {(gelee !== "none" || isDaily) && (
        <LeaderLine from={cutFaceAnchors.l3} to={labelL3Pos} color="#E6194B" />
      )}
      <LeaderLine from={cutFaceAnchors.l2} to={labelL2Pos} color="#DAA520" />
      <LeaderLine from={cutFaceAnchors.l1} to={labelL1Pos} color="#B07D4F" />

      {/* Render Shape-Aware Cutaway Mesh */}
      {shape === "rectangle" ? (
        // RECTANGULAR BAROQUE ACCURATE 3/4 L-SHAPED CUTAWAY (Front-Right Quadrant Open)
        <group>
          {/* Outer Frosting Shell on remaining 3 exterior sides */}
          <mesh position={[-1.51, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.02, 1.0, 2.2]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -1.11]} castShadow receiveShadow>
            <boxGeometry args={[3.02, 1.0, 0.02]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh position={[-0.75, 0, 1.11]} castShadow receiveShadow>
            <boxGeometry args={[1.52, 1.0, 0.02]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh position={[1.51, 0, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[0.02, 1.0, 1.12]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>

          {/* Top Frosting Layer on Intact L-Shape */}
          <mesh position={[0, 0.505, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 0.02, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh position={[-0.75, 0.505, 0.55]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.02, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>

          {/* 5 INTERNAL LAYERS: Each composed of Back-Half + Front-Left Quadrant */}
          {/* L1: Base Crunch */}
          <mesh position={[0, -0.45, -0.55]} castShadow>
            <boxGeometry args={[3.0, 0.1, 1.1]} />
            <meshStandardMaterial color="#B07D4F" roughness={0.9} />
          </mesh>
          <mesh position={[-0.75, -0.45, 0.55]} castShadow>
            <boxGeometry args={[1.5, 0.1, 1.1]} />
            <meshStandardMaterial color="#B07D4F" roughness={0.9} />
          </mesh>

          {/* L2: Sponge */}
          <mesh position={[0, -0.27, -0.55]} castShadow>
            <boxGeometry args={[3.0, 0.26, 1.1]} />
            <meshPhysicalMaterial
              color={spongeObj?.color || "#F7E7B4"}
              roughness={0.88}
              bumpMap={crumbBumpMap || undefined}
              bumpScale={0.035}
            />
          </mesh>
          <mesh position={[-0.75, -0.27, 0.55]} castShadow>
            <boxGeometry args={[1.5, 0.26, 1.1]} />
            <meshPhysicalMaterial
              color={spongeObj?.color || "#F7E7B4"}
              roughness={0.88}
              bumpMap={crumbBumpMap || undefined}
              bumpScale={0.035}
            />
          </mesh>

          {/* L3: Compote Gelée */}
          {gelee !== "none" && (
            <>
              <mesh position={[0, -0.08, -0.55]} castShadow>
                <boxGeometry args={[3.0, 0.12, 1.1]} />
                <meshPhysicalMaterial
                  color={geleeObj?.color || "#B8002E"}
                  roughness={0.1}
                  transmission={0.4}
                />
              </mesh>
              <mesh position={[-0.75, -0.08, 0.55]} castShadow>
                <boxGeometry args={[1.5, 0.12, 1.1]} />
                <meshPhysicalMaterial
                  color={geleeObj?.color || "#B8002E"}
                  roughness={0.1}
                  transmission={0.4}
                />
              </mesh>
            </>
          )}

          {/* L4: Mousse */}
          <mesh position={[0, 0.11, -0.55]} castShadow>
            <boxGeometry args={[3.0, 0.26, 1.1]} />
            <meshStandardMaterial color={mousseObj?.color || "#FFFDF5"} roughness={0.4} />
          </mesh>
          <mesh position={[-0.75, 0.11, 0.55]} castShadow>
            <boxGeometry args={[1.5, 0.26, 1.1]} />
            <meshStandardMaterial color={mousseObj?.color || "#FFFDF5"} roughness={0.4} />
          </mesh>

          {/* L5: Top Layer */}
          <mesh position={[0, 0.38, -0.55]} castShadow>
            <boxGeometry args={[3.0, 0.24, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh position={[-0.75, 0.38, 0.55]} castShadow>
            <boxGeometry args={[1.5, 0.24, 1.1]} />
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>

          {/* Extracted Floating Cutaway Slice in Front-Right */}
          <group position={[0.75, 0.18, 0.75]}>
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[1.3, 0.1, 0.9]} />
              <meshStandardMaterial color="#B07D4F" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.27, 0]} castShadow>
              <boxGeometry args={[1.3, 0.26, 0.9]} />
              <meshPhysicalMaterial color={spongeObj?.color || "#F7E7B4"} roughness={0.88} />
            </mesh>
            {gelee !== "none" && (
              <mesh position={[0, -0.08, 0]} castShadow>
                <boxGeometry args={[1.3, 0.12, 0.9]} />
                <meshPhysicalMaterial color={geleeObj?.color || "#B8002E"} roughness={0.1} />
              </mesh>
            )}
            <mesh position={[0, 0.11, 0]} castShadow>
              <boxGeometry args={[1.3, 0.26, 0.9]} />
              <meshStandardMaterial color={mousseObj?.color || "#FFFDF5"} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[1.3, 0.24, 0.9]} />
              <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
            </mesh>
          </group>

          {/* 4 Wooden Dowels Ø6mm with Front-Right dowel exposed in cutaway */}
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
            <Html position={[0.55, -0.58, 0.45]} center>
              <div className="bg-amber-900/95 backdrop-blur-md text-amber-100 px-2 py-0.5 rounded-lg border border-amber-400 shadow-md text-[8.5px] font-bold whitespace-nowrap animate-pulse">
                🛡️ 4x Trụ Dowel Gỗ Ø6mm (Gia Cố Kết Cấu)
              </div>
            </Html>
          </group>
        </group>
      ) : shape === "heart" ? (
        // HEART SHAPE-ACCURATE CUTAWAY (Left Lobe Intact, Right Sliced & Floating)
        <group>
          {/* Left Lobe 5 Layers along X=0 sagittal cut face */}
          <mesh geometry={heartL5} position={[0, 0.50, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          <mesh geometry={heartL4} position={[0, 0.26, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={mousseObj?.color || "#FFFDF5"} roughness={0.4} />
          </mesh>
          {gelee !== "none" && (
            <mesh geometry={heartL3} position={[0, 0.0, 0]} castShadow receiveShadow>
              <meshPhysicalMaterial color={geleeObj?.color || "#B8002E"} roughness={0.1} transmission={0.4} />
            </mesh>
          )}
          <mesh geometry={heartL2} position={[0, -0.12, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={spongeObj?.color || "#F7E7B4"}
              roughness={0.88}
              bumpMap={crumbBumpMap || undefined}
              bumpScale={0.035}
            />
          </mesh>
          <mesh geometry={heartL1} position={[0, -0.38, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#B07D4F" roughness={0.9} />
          </mesh>

          {/* Extracted Floating Right Lobe */}
          <group position={[0.65, 0.68, 0.25]}>
            <mesh geometry={heartFloatingSlice} castShadow receiveShadow>
              <meshPhysicalMaterial color={frostingColor} roughness={0.3} transmission={0.06} />
            </mesh>
          </group>

          {/* 4 Wooden Dowels in Heart Structure */}
          <group>
            {[
              [0, 0, 0.15],
              [-0.45, 0, 0.45],
              [-0.45, 0, -0.15],
              [0.45, 0, 0.45],
            ].map((pos, idx) => (
              <mesh key={`heart-dowel-${idx}`} position={pos as [number, number, number]} castShadow>
                <cylinderGeometry args={[0.045, 0.045, 0.92, 16]} />
                <meshStandardMaterial color="#D2A679" roughness={0.65} metalness={0.05} />
              </mesh>
            ))}
            <Html position={[0, -0.58, 0.15]} center>
              <div className="bg-amber-900/95 backdrop-blur-md text-amber-100 px-2 py-0.5 rounded-lg border border-amber-400 shadow-md text-[8.5px] font-bold whitespace-nowrap animate-pulse">
                🛡️ 4x Trụ Dowel Gỗ Ø6mm (Gia Cố Trái Tim)
              </div>
            </Html>
          </group>
        </group>
      ) : (
        // ROUND / TIERED RADIAL CUTAWAY
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
