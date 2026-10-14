# 🍰 SKILL: THREE.JS & 3D SURREALISM FOR DIGITAL ART PORTFOLIOS

## PURPOSE & DOMAIN
This skill provides production-ready WebGL / Three.js patterns for building interactive 3D surrealist scenes, procedural pastry configurators, liquid frosting shaders, and studio lighting setups for the **Wishes** Capstone showcase website.

---

## 1. 3D VISUAL DIRECTION: THE SWEET DREAMSCAPE
- **Lighting Mood:** High-key pastel studio lighting. A warm main key light (`#FFF5EA`), soft baby-blue ambient fill (`#BDE0FE`), and a vibrant pink rim light (`#FFB6C1`) to accentuate curved frosting edges.
- **Material Qualities:**
  - Soft Fondant / Cake Base: Roughness `0.4`, Metalness `0.02`, Subsurface scattering approximation.
  - Glossy Glaze / Jelly: Physical material with `clearcoat: 1.0`, `clearcoatRoughness: 0.1`, `transmission: 0.6`, `ior: 1.45`.
  - Sugar Sprinkles / Candies: Saturated pastel colors, subtle reflection.

---

## 2. PROCEDURAL 3D CAKE CUSTOMIZER (LAB COMPONENT)
Recreating the interactive cake builder from Proposal Slide 69 in React Three Fiber:

```tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { MeshDistortMaterial } from "@react-three/drei";

interface CakeProps {
  shape: "round" | "heart";
  diameter: number; // e.g. 10 to 24 (cm)
  frostingColor: string;
  hasCherry: boolean;
  hasSprinkles: boolean;
}

export function InteractiveCake({
  shape = "round",
  diameter = 16,
  frostingColor = "#FFAEC9",
  hasCherry = true,
  hasSprinkles = true,
}: CakeProps) {
  // Normalize scale (16cm = scale 1.0)
  const scaleFactor = diameter / 16;

  // Procedural Heart Shape Geometry
  const heartGeometry = useMemo(() => {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const extrudeSettings = {
      depth: 0.8,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const geom = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geom.center();
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  return (
    <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
      {/* Cake Body */}
      {shape === "round" ? (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 1.0, 64]} />
          <MeshDistortMaterial
            color={frostingColor}
            speed={1.0}
            distort={0.05}
            roughness={0.25}
          />
        </mesh>
      ) : (
        <mesh geometry={heartGeometry} castShadow receiveShadow>
          <MeshDistortMaterial
            color={frostingColor}
            speed={1.0}
            distort={0.05}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* Glossy Cherry Topper */}
      {hasCherry && (
        <group position={[0, 0.7, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshPhysicalMaterial
              color="#FF1A4B"
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Cherry Stem */}
          <mesh position={[0.08, 0.25, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#4A7C59" />
          </mesh>
        </group>
      )}
    </group>
  );
}
```

---

## 3. CUSTOM GLSL RIPPLE SHADER (LIQUID ICING ON HOVER)
Adds a tactile liquid gelatin distortion when hovering over portfolio artwork cards:

```glsl
// vertexShader.glsl
varying vec2 vUv;
uniform float uTime;
uniform float uHover;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Wave deformation on hover
  float wave = sin(uv.x * 12.0 + uTime * 3.0) * cos(uv.y * 12.0 + uTime * 3.0);
  pos.z += wave * 0.05 * uHover;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

```glsl
// fragmentShader.glsl
uniform sampler2D uTexture;
uniform float uTime;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 distortedUv = vUv;
  distortedUv.x += sin(vUv.y * 10.0 + uTime * 2.0) * 0.015 * uHover;
  distortedUv.y += cos(vUv.x * 10.0 + uTime * 2.0) * 0.015 * uHover;

  vec4 color = texture2D(uTexture, distortedUv);
  
  // Subtle chromatic aberration on edges during active hover
  float r = texture2D(uTexture, distortedUv + vec2(0.005 * uHover, 0.0)).r;
  float g = color.g;
  float b = texture2D(uTexture, distortedUv - vec2(0.005 * uHover, 0.0)).b;

  gl_FragColor = vec4(r, g, b, color.a);
}
```

---

## 4. PARTICLES SYSTEM: PASTEL SPRINKLES CLOUD
Floating confectionary particles scattered in 3D space:
```tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function FloatingSprinkles({ count = 200 }) {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);

  const colors = ["#FFB6C1", "#BEE3DB", "#FFF3B0", "#A0C4FF", "#FFD166"];
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      speed: 0.2 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      dummy.position.set(
        particle.position[0],
        particle.position[1] + Math.sin(t * particle.speed + i) * 0.2,
        particle.position[2]
      );
      dummy.rotation.x = particle.rotation[0] + t * 0.1;
      dummy.rotation.y = particle.rotation[1] + t * 0.15;
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Pill-shaped sprinkle geometry */}
      <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
    </instancedMesh>
  );
}
```
