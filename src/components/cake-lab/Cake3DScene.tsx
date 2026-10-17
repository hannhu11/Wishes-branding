import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  PipingPosition,
  ToppingConfig,
  SmartDrawingState,
  AccessoryItem,
  TypographyState,
} from "./types";
import {
  RealisticCherry,
  RealisticStrawberry,
  BlueberryCluster,
  SatinRibbonBow,
  BirthdayCrown,
  PastelSpiralCandle,
  NumberCandle,
  InstancedPastelSprinkles,
  PipedDaisyFlower,
  ChocolateBearTopper,
  CatGlassesEarsTopper,
  PuppyBowEarsTopper,
  MacaronTopper,
  ChocolatePlaqueTopper,
  EnamelBadgePin,
  WaferButterflyTopper,
  HautePipingPattern,
  LambethSideSwags,
  useWonkyHeartGeometry,
  useBaroqueRectangleGeometry,
  CinnamonRollMesh,
  FrenchCroissantMesh,
  CustardEggTartMesh,
  ArtisanalCookieMesh,
  CatY2KMesh,
  PuppyBowMesh,
  BunnyBowMesh,
  BearFaceMesh,
  FullCrossSectionCutaway,
  createFrostingBumpMap,
  createCrumbBumpMap,
  ViscousDripRim,
  createArtisanalCakeGeometry,
  createSweetcoreHeartShape,
} from "./PastryGeometries";
import {
  strokeTo3DCurve,
  renderPipingToCanvas,
  createTaperedFlutedTubeGeometry,
  createFlutedRosetteGeometry,
  createPipingBumpMap,
} from "./SmartPipingEngine";

interface Cake3DSceneProps {
  shape: CakeShape;
  size: number;
  sponge: SpongeType;
  gelee: GeleeType;
  mousse: MousseType;
  finish: FrostingFinish;
  frostingColor: string;
  pipingStyle: PipingStyle;
  pipingColor: string;
  pipingPosition?: PipingPosition;
  toppings?: ToppingConfig;
  accessories?: AccessoryItem[];
  isCutawayMode: boolean;
  drawingState: SmartDrawingState;
  typography?: TypographyState;
  activeStep?: number;
  onCakeClick?: (pos: [number, number, number]) => void;
}

export default function Cake3DScene({
  shape,
  size,
  sponge,
  gelee,
  mousse,
  finish,
  frostingColor,
  pipingStyle,
  pipingColor,
  pipingPosition = "dual-rim",
  toppings,
  accessories = [],
  isCutawayMode,
  drawingState,
  typography,
  activeStep = 1,
  onCakeClick,
}: Cake3DSceneProps) {
  const cakeGroupRef = useRef<THREE.Group>(null);
  const heartGeometry = useWonkyHeartGeometry();
  const rectangleGeometry = useBaroqueRectangleGeometry();
  const roundArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 1.0, 0.045), []);
  const tier1ArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.7, 0.7, 0.04), []);
  const tier2ArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.05, 0.65, 0.04), []);

  const frostingBumpMap = useMemo(() => createFrostingBumpMap(), []);
  const crumbBumpMap = useMemo(() => createCrumbBumpMap(), []);
  const pipingBumpMap = useMemo(() => createPipingBumpMap(), []);

  const isCelebrationCake =
    shape === "round" ||
    shape === "heart" ||
    shape === "rectangle" ||
    shape === "two-tier" ||
    shape === "cat-y2k" ||
    shape === "puppy-bow" ||
    shape === "bunny-bow" ||
    shape === "bear-face";

  const radialScale = size / 16;
  const heightScale = isCelebrationCake ? 0.85 + ((size - 10) / 14) * 0.25 : (size / 16) * 1.05;
  const groupScale: [number, number, number] = isCelebrationCake
    ? [radialScale, heightScale, radialScale]
    : [(size / 16) * 1.05, (size / 16) * 1.05, (size / 16) * 1.05];

  // Material settings according to Finish
  const materialProps = useMemo(() => {
    if (finish === "mirror-glaze") {
      return {
        roughness: 0.04,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 0.95,
        transmission: 0.15,
        thickness: 1.2,
        ior: 1.48,
        attenuationColor: new THREE.Color(frostingColor),
      };
    }
    if (finish === "velvet-spray") {
      return {
        roughness: 0.82,
        metalness: 0.0,
        sheen: 0.85,
        sheenRoughness: 0.7,
        sheenColor: new THREE.Color("#FFF0F5"),
        clearcoat: 0.02,
        transmission: 0.02,
        thickness: 0.6,
        bumpMap: crumbBumpMap || undefined,
        bumpScale: 0.012,
      };
    }
    if (finish === "airbrush-stars") {
      return {
        roughness: 0.28,
        metalness: 0.02,
        clearcoat: 0.4,
        sheen: 0.75,
        sheenColor: new THREE.Color("#FFD1DC"),
        transmission: 0.06,
        thickness: 0.6,
      };
    }
    if (finish === "holographic-glitter") {
      return {
        roughness: 0.18,
        metalness: 0.35,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.98,
        sheen: 1.0,
        sheenRoughness: 0.2,
        sheenColor: new THREE.Color("#FFE66D"),
        transmission: 0.08,
        thickness: 0.7,
        bumpMap: frostingBumpMap || undefined,
        bumpScale: 0.015,
      };
    }
    if (finish === "jelly-glass") {
      return {
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        reflectivity: 0.98,
        transmission: 0.45,
        thickness: 1.8,
        ior: 1.46,
        attenuationColor: new THREE.Color(frostingColor),
      };
    }
    // Rustic Buttercream with SSS
    return {
      roughness: 0.32,
      metalness: 0.01,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      sheen: 0.65,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#FFF5EA"),
      transmission: 0.08,
      thickness: 0.6,
      attenuationColor: new THREE.Color("#FFE5D9"),
      bumpMap: frostingBumpMap || undefined,
      bumpScale: 0.018,
    };
  }, [finish, frostingColor, frostingBumpMap, crumbBumpMap]);

  // Determine top surface plane height and radius dynamically
  const { surfaceY, surfaceRadius } = useMemo(() => {
    switch (shape) {
      case "two-tier":
        return { surfaceY: 0.785, surfaceRadius: 0.95 };
      case "heart":
        return { surfaceY: 0.52, surfaceRadius: 1.15 };
      case "rectangle":
        return { surfaceY: 0.505, surfaceRadius: 1.25 };
      case "cat-y2k":
      case "puppy-bow":
      case "bunny-bow":
      case "bear-face":
        return { surfaceY: 0.505, surfaceRadius: 1.38 };
      case "cinnamon-roll":
        return { surfaceY: 0.28, surfaceRadius: 0.95 };
      case "croissant":
      case "croissant-bow":
        return { surfaceY: 0.35, surfaceRadius: 0.85 };
      case "egg-tart":
        return { surfaceY: 0.25, surfaceRadius: 0.95 };
      case "cookie":
      case "cookie-bear":
        return { surfaceY: 0.16, surfaceRadius: 1.1 };
      case "round":
      default:
        return { surfaceY: 0.505, surfaceRadius: 1.38 };
    }
  }, [shape]);

  // Texture Canvas for Top Calligraphy & 3D Embossed Text
  const { canvasTexture, dynamicCanvas } = useMemo(() => {
    if (typeof document === "undefined") {
      return { canvasTexture: null, dynamicCanvas: null };
    }
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return { canvasTexture: tex, dynamicCanvas: canvas };
  }, []);

  const hasCenterTextOrPiping = useMemo(() => {
    const txt = (typography?.text || drawingState.customText || drawingState.presetText || "").trim();
    return txt.length > 0 || drawingState.strokes.length > 0;
  }, [typography?.text, drawingState.customText, drawingState.presetText, drawingState.strokes.length]);

  useEffect(() => {
    if (!dynamicCanvas || !canvasTexture) return;
    renderPipingToCanvas(
      dynamicCanvas,
      [],
      drawingState.customText || drawingState.presetText,
      drawingState.textColor,
      false,
      typography
    );
    canvasTexture.needsUpdate = true;
  }, [
    dynamicCanvas,
    canvasTexture,
    drawingState.customText,
    drawingState.presetText,
    drawingState.textColor,
    typography,
  ]);

  // 3D Volumetric Tubes for Multi-point Hand-Piped Strokes
  const tubeGeometries = useMemo(() => {
    return drawingState.strokes
      .map((stroke) => {
        if (!stroke.points || stroke.points.length < 2) return null;
        const curve = strokeTo3DCurve(stroke, surfaceRadius, surfaceY + 0.005);
        if (!curve) return null;
        return {
          geom: createTaperedFlutedTubeGeometry(curve, stroke.gauge * 0.018, 8, 40),
          color: stroke.color,
        };
      })
      .filter(Boolean);
  }, [drawingState.strokes, surfaceRadius, surfaceY]);

  // 3D Volumetric Cream Beads / Rosettes for Single-Point Taps
  const singlePointBeads = useMemo(() => {
    return drawingState.strokes
      .filter((s) => s.points && s.points.length === 1)
      .map((s) => {
        const pt = s.points[0];
        const x3d = (pt.x - 0.5) * (surfaceRadius * 1.5);
        const z3d = (pt.y - 0.5) * (surfaceRadius * 1.5);
        const radius = s.gauge * 0.024;
        return {
          position: [x3d, surfaceY + 0.002, z3d] as [number, number, number],
          geom: createFlutedRosetteGeometry(radius, 8, 8),
          color: s.color,
        };
      });
  }, [drawingState.strokes, surfaceRadius, surfaceY]);

  // Subtle floating idle motion
  useFrame((state) => {
    if (!cakeGroupRef.current || isCutawayMode) return;
    const t = state.clock.getElapsedTime();
    cakeGroupRef.current.position.y = -0.2 + Math.sin(t * 1.2) * 0.025;
    cakeGroupRef.current.rotation.x = 0.018 + Math.sin(t * 0.8) * 0.002;
    cakeGroupRef.current.rotation.z = -0.015 + Math.cos(t * 0.7) * 0.002;
  });

  // Backward compatibility: If no accessories in array but old toppings boolean is present
  const resolvedAccessories: AccessoryItem[] = useMemo(() => {
    if (accessories && accessories.length > 0) return accessories;
    if (!toppings) return [];
    const list: AccessoryItem[] = [];
    if (toppings.cherry) {
      list.push({ id: "legacy-cherry", type: "cherry", count: 1, layout: "center", scale: 1.0, unitPrice: 12000 });
    }
    if (toppings.strawberry) {
      list.push({ id: "legacy-straw", type: "strawberry", count: 1, layout: "front-arc", scale: 1.0, unitPrice: 15000 });
    }
    if (toppings.sprinkles) {
      list.push({ id: "legacy-sprinkles", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 });
    }
    if (toppings.ribbonBow) {
      list.push({ id: "legacy-bow", type: "satin-bow", count: 1, layout: "corners", scale: 1.0, unitPrice: 18000 });
    }
    if (toppings.spiralCandle) {
      list.push({ id: "legacy-candle", type: "spiral-candle", count: 1, layout: "corners", scale: 1.0, unitPrice: 8000 });
    }
    if (toppings.crown) {
      list.push({ id: "legacy-crown", type: "crown", count: 1, layout: "center", scale: 1.0, unitPrice: 45000 });
    }
    if (toppings.enamelPin) {
      list.push({ id: "legacy-pin", type: "enamel-pin", count: 1, layout: "front-arc", scale: 1.0, unitPrice: 45000 });
    }
    return list;
  }, [accessories, toppings]);

  // Helper to compute layout positions on cake top surface
  const computeAccessoryPositions = (
    item: AccessoryItem
  ): [number, number, number][] => {
    const count = item.count;
    const r = surfaceRadius * 0.78;

    if (item.customPositions && item.customPositions.length > 0) {
      if (item.customPositions.length >= item.count) {
        return item.customPositions.slice(0, item.count);
      }
      const filled = [...item.customPositions];
      for (let i = filled.length; i < item.count; i++) {
        const a = (i / item.count) * Math.PI * 2;
        filled.push([Math.cos(a) * r * 0.5, surfaceY, Math.sin(a) * r * 0.5]);
      }
      return filled;
    }

    const isDaily =
      shape === "cinnamon-roll" ||
      shape === "croissant" ||
      shape === "croissant-bow" ||
      shape === "egg-tart" ||
      shape === "cookie" ||
      shape === "cookie-bear";

    // Daily pastries: do not scatter random cherries in thin air
    if (isDaily) {
      if (item.type === "cherry") {
        if (shape === "egg-tart") return [[0.85, surfaceY + 0.12, 0.65]];
        return [[0, surfaceY + 0.05, 0]];
      }
      if (item.type === "satin-bow") {
        return [[0, surfaceY + 0.08, 0]];
      }
      if (item.type === "sugar-pearls") {
        return []; // Pastry already has built-in sprinkles
      }
      return [[0, surfaceY + 0.05, 0]];
    }

    // Enamel pin always mounted on front vertical wall / cake board ribbon
    if (item.type === "enamel-pin") {
      if (count === 1) {
        return [[0, surfaceY - 0.35, surfaceRadius + 0.05]];
      }
      const arcSpan = Math.PI * 0.35;
      const startA = Math.PI * 0.5 - arcSpan / 2;
      return Array.from({ length: count }, (_, i) => {
        const a = startA + (i / (count - 1)) * arcSpan;
        return [
          Math.cos(a) * (surfaceRadius + 0.05),
          surfaceY - 0.35,
          Math.sin(a) * (surfaceRadius + 0.05),
        ] as [number, number, number];
      });
    }

    // Heart shape: Sample points along true sweetcore heart contour
    if (shape === "heart") {
      if (item.layout === "center") {
        return [[0, surfaceY, hasCenterTextOrPiping ? -0.4 : 0.05]];
      }
      const heartShape = createSweetcoreHeartShape();
      const pts = heartShape.getSpacedPoints(count);
      return pts.map((p) => [p.x * 0.70, surfaceY, -p.y * 0.70] as [number, number, number]);
    }

    // Rectangle shape: Distribute along rectangular perimeter
    if (shape === "rectangle") {
      if (item.layout === "center") {
        return [[0, surfaceY, hasCenterTextOrPiping ? -0.45 : 0]];
      }
      if (item.layout === "corners") {
        const cx = 1.15;
        const cz = 0.78;
        const cornerCoords: [number, number][] = [
          [-cx, -cz],
          [cx, -cz],
          [cx, cz],
          [-cx, cz],
        ];
        return Array.from({ length: count }, (_, i) => [
          cornerCoords[i % 4][0],
          surfaceY,
          cornerCoords[i % 4][1],
        ]);
      }
      if (item.layout === "ring") {
        const w = 1.15;
        const h = 0.78;
        return Array.from({ length: count }, (_, i) => {
          const t = (i / count) * 4;
          let x = 0;
          let z = 0;
          if (t < 1) {
            x = -w + t * (2 * w);
            z = -h;
          } else if (t < 2) {
            x = w;
            z = -h + (t - 1) * (2 * h);
          } else if (t < 3) {
            x = w - (t - 2) * (2 * w);
            z = h;
          } else {
            x = -w;
            z = h - (t - 3) * (2 * h);
          }
          return [x, surfaceY, z] as [number, number, number];
        });
      }
    }

    // Mascot animal cakes (cat-y2k, puppy-bow, bunny-bow, bear-face): prevent ear and face collisions
    if (
      shape === "cat-y2k" ||
      shape === "puppy-bow" ||
      shape === "bunny-bow" ||
      shape === "bear-face"
    ) {
      if (item.layout === "center") {
        if (hasCenterTextOrPiping) {
          return [[0, surfaceY, -surfaceRadius * 0.55]];
        }
        return [[0, surfaceY, -0.15]];
      }
      if (item.layout === "ring" || item.layout === "corners") {
        return Array.from({ length: count }, (_, i) => {
          // Spread across side and back perimeter, avoiding front face z > 0.8
          const a = -Math.PI * 0.65 + (i / count) * Math.PI * 1.3;
          return [Math.cos(a) * r * 0.9, surfaceY, Math.sin(a) * r * 0.9] as [number, number, number];
        });
      }
      if (item.layout === "front-arc") {
        const arcSpan = Math.PI * 0.45;
        const startA = Math.PI * 0.5 - arcSpan / 2;
        return Array.from({ length: count }, (_, i) => {
          const a = count > 1 ? startA + (i / (count - 1)) * arcSpan : Math.PI * 0.5;
          return [Math.cos(a) * r * 0.9, surfaceY, Math.sin(a) * r * 0.9] as [number, number, number];
        });
      }
    }

    // Standard round / 2-tier cakes
    if (item.layout === "center") {
      if (hasCenterTextOrPiping) {
        return [[0, surfaceY, -surfaceRadius * 0.65]];
      }
      return [[0, surfaceY, 0]];
    }

    if (item.layout === "ring") {
      return Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return [Math.cos(a) * r, surfaceY, Math.sin(a) * r] as [number, number, number];
      });
    }

    if (item.layout === "corners") {
      return Array.from({ length: count }, (_, i) => {
        const a = Math.PI * 0.25 + (i / count) * Math.PI * 2;
        return [Math.cos(a) * r, surfaceY, Math.sin(a) * r] as [number, number, number];
      });
    }

    if (item.layout === "front-arc") {
      const arcSpan = Math.PI * 0.6;
      const startA = Math.PI * 0.5 - arcSpan / 2;
      return Array.from({ length: count }, (_, i) => {
        const a = count > 1 ? startA + (i / (count - 1)) * arcSpan : Math.PI * 0.5;
        return [Math.cos(a) * r, surfaceY, Math.sin(a) * r] as [number, number, number];
      });
    }

    // Default: scatter
    return Array.from({ length: count }, (_, i) => {
      const a = (i * 2.39996) % (Math.PI * 2);
      const dist = (0.35 + (i % 3) * 0.2) * r;
      return [Math.cos(a) * dist, surfaceY, Math.sin(a) * dist] as [number, number, number];
    });
  };

  // If in cutaway mode, render full 5-layer engineering cross-section
  if (isCutawayMode) {
    return (
      <FullCrossSectionCutaway
        size={size}
        shape={shape}
        sponge={sponge}
        gelee={gelee}
        mousse={mousse}
        frostingColor={frostingColor}
        finish={finish}
      />
    );
  }

  return (
    <group
      ref={cakeGroupRef}
      scale={groupScale}
      position={[0, -0.2, 0]}
      rotation={[0.018, 0, -0.015]}
      onClick={(e) => {
        if (onCakeClick) {
          e.stopPropagation();
          onCakeClick([e.point.x, surfaceY, e.point.z]);
        }
      }}
    >
      {/* 1. MAIN PASTRY BODIES (10 DISTINCT SHAPES) */}

      {shape === "round" && (
        <group>
          <mesh geometry={roundArtisanalGeom} position={[0, 0, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.49} y={0.5} color={frostingColor} />
          )}

          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.5}
            color={pipingColor}
            shapeType="round"
          />

          {(pipingPosition === "dual-rim" || pipingPosition === "full-lambeth-swag") && (
            <HautePipingPattern
              style={pipingStyle}
              radius={1.52}
              y={-0.5}
              color={pipingColor}
              scale={1.06}
              shapeType="round"
            />
          )}

          {pipingPosition === "full-lambeth-swag" && (
            <LambethSideSwags radius={1.51} topY={0.45} color={pipingColor} />
          )}

          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 48]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "heart" && (
        <group>
          <mesh geometry={heartGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          <HautePipingPattern
            style={pipingStyle}
            radius={1.25}
            y={surfaceY}
            color={pipingColor}
            shapeType="heart"
          />

          {(pipingPosition === "dual-rim" || pipingPosition === "full-lambeth-swag") && (
            <HautePipingPattern
              style={pipingStyle}
              radius={1.28}
              y={-0.45}
              color={pipingColor}
              scale={1.03}
              shapeType="heart"
            />
          )}

          {pipingPosition === "full-lambeth-swag" && (
            <LambethSideSwags radius={1.25} topY={surfaceY - 0.05} color={pipingColor} shapeType="heart" />
          )}

          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.22} y={surfaceY} color={frostingColor} count={22} />
          )}

          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "rectangle" && (
        <group>
          <mesh geometry={rectangleGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          <HautePipingPattern
            style={pipingStyle}
            radius={1.35}
            y={surfaceY}
            color={pipingColor}
            shapeType="rectangle"
          />

          {(pipingPosition === "dual-rim" || pipingPosition === "full-lambeth-swag") && (
            <HautePipingPattern
              style={pipingStyle}
              radius={1.38}
              y={-0.45}
              color={pipingColor}
              scale={1.03}
              shapeType="rectangle"
            />
          )}

          {pipingPosition === "full-lambeth-swag" && (
            <LambethSideSwags radius={1.35} topY={surfaceY - 0.05} color={pipingColor} shapeType="rectangle" />
          )}

          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 1.8]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "two-tier" && (
        <group>
          <mesh geometry={tier1ArtisanalGeom} position={[0, -0.3, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>
          <HautePipingPattern
            style={pipingStyle}
            radius={1.66}
            y={0.05}
            color={pipingColor}
            shapeType="round"
          />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.72}
            y={-0.65}
            color={pipingColor}
            scale={1.05}
            shapeType="round"
          />

          <mesh geometry={tier2ArtisanalGeom} position={[0, 0.45, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>
          <HautePipingPattern
            style={pipingStyle}
            radius={1.02}
            y={surfaceY}
            color={pipingColor}
            shapeType="round"
          />

          {pipingPosition === "full-lambeth-swag" && (
            <LambethSideSwags radius={1.05} topY={surfaceY - 0.05} color={pipingColor} swagsCount={6} />
          )}

          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.04} y={surfaceY} color={frostingColor} count={20} />
          )}

          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "cat-y2k" && (
        <group>
          <CatY2KMesh frostingColor={frostingColor} pipingColor={pipingColor} />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.5}
            color={pipingColor}
            shapeType="round"
          />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius * 0.9, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "puppy-bow" && (
        <group>
          <PuppyBowMesh frostingColor={frostingColor} pipingColor={pipingColor} />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.5}
            color={pipingColor}
            shapeType="round"
          />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius * 0.9, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "bunny-bow" && (
        <group>
          <BunnyBowMesh frostingColor={frostingColor} pipingColor={pipingColor} />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.5}
            color={pipingColor}
            shapeType="round"
          />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius * 0.9, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "bear-face" && (
        <group>
          <BearFaceMesh frostingColor={frostingColor} pipingColor={pipingColor} />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.5}
            color={pipingColor}
            shapeType="round"
          />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius * 0.9, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "cinnamon-roll" && (
        <group>
          <CinnamonRollMesh />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {(shape === "croissant" || shape === "croissant-bow") && (
        <group>
          <FrenchCroissantMesh />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 24]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "egg-tart" && (
        <group>
          <CustardEggTartMesh />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {(shape === "cookie" || shape === "cookie-bear") && (
        <group>
          <ArtisanalCookieMesh color={frostingColor} />
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {/* 2. 3D HAND-DRAWN VOLUMETRIC CREAM TUBES */}
      {tubeGeometries.map(
        (tube, idx) =>
          tube && (
            <mesh key={`tube-${idx}`} geometry={tube.geom} castShadow>
              <meshPhysicalMaterial
                color={tube.color}
                roughness={0.28}
                clearcoat={0.4}
                clearcoatRoughness={0.25}
                bumpMap={pipingBumpMap || undefined}
                bumpScale={0.025}
                sheen={0.45}
                sheenColor={new THREE.Color("#FFFDF5")}
              />
            </mesh>
          )
      )}

      {/* 3. 3D CREAM ROSETTES FOR SINGLE-POINT TAPS */}
      {singlePointBeads.map((bead, idx) => (
        <mesh key={`bead-${idx}`} position={bead.position} geometry={bead.geom} castShadow>
          <meshPhysicalMaterial
            color={bead.color}
            roughness={0.28}
            clearcoat={0.4}
            clearcoatRoughness={0.25}
            sheen={0.45}
            sheenColor={new THREE.Color("#FFFDF5")}
          />
        </mesh>
      ))}

      {/* 4. MULTI-INSTANCE 3D ACCESSORY STUDIO RENDERING */}
      <group>
        {resolvedAccessories.map((item) => {
          const positions = computeAccessoryPositions(item);
          return positions.map((pos, pIdx) => {
            const key = `acc-${item.id}-${pIdx}`;
            switch (item.type) {
              case "cherry":
                return <RealisticCherry key={key} position={pos} scale={item.scale} />;
              case "strawberry":
                return <RealisticStrawberry key={key} position={pos} scale={item.scale} />;
              case "blueberry-cluster":
                return <BlueberryCluster key={key} position={pos} scale={item.scale} />;
              case "satin-bow":
                return (
                  <SatinRibbonBow
                    key={key}
                    position={pos}
                    scale={item.scale}
                    color={item.color || "#A0C4FF"}
                  />
                );
              case "crown":
                return <BirthdayCrown key={key} position={pos} scale={item.scale} />;
              case "spiral-candle":
                return <PastelSpiralCandle key={key} position={pos} scale={item.scale} />;
              case "number-candle":
                return (
                  <NumberCandle
                    key={key}
                    position={pos}
                    scale={item.scale}
                    numberText={item.customText || "20"}
                  />
                );
              case "sugar-pearls":
                return (
                  <InstancedPastelSprinkles
                    key={key}
                    radius={surfaceRadius * 0.9}
                    y={surfaceY + 0.01}
                  />
                );
              case "piped-flowers":
                return <PipedDaisyFlower key={key} position={pos} scale={item.scale} />;
              case "chocolate-bear":
                return <ChocolateBearTopper key={key} position={pos} scale={item.scale} />;
              case "cat-glasses-ears":
                return <CatGlassesEarsTopper key={key} position={pos} scale={item.scale} />;
              case "puppy-bow-ears":
                return <PuppyBowEarsTopper key={key} position={pos} scale={item.scale} />;
              case "macaron":
                return (
                  <MacaronTopper
                    key={key}
                    position={pos}
                    scale={item.scale}
                    color={item.color || "#FFAEC9"}
                  />
                );
              case "chocolate-plaque":
                return (
                  <ChocolatePlaqueTopper
                    key={key}
                    position={pos}
                    scale={item.scale}
                    text={item.customText || typography?.text || "WISHES"}
                  />
                );
              case "enamel-pin":
                return <EnamelBadgePin key={key} position={pos} />;
              case "wafer-butterfly":
                return <WaferButterflyTopper key={key} position={pos} scale={item.scale} />;
              default:
                return null;
            }
          });
        })}
      </group>
    </group>
  );
}

export interface CapturedAngles {
  topDown: string;
  front: string;
  iso: string;
  profile: string;
}

export function PhotoCaptureHelper({
  onRegisterCapture,
}: {
  onRegisterCapture?: (fn: () => Promise<CapturedAngles>) => void;
}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!onRegisterCapture) return;

    const captureAll = async (): Promise<CapturedAngles> => {
      // Save original camera configuration
      const origPos = camera.position.clone();
      const origRot = camera.rotation.clone();
      const origFov = (camera as THREE.PerspectiveCamera).fov;

      const takeSnapshotAt = (
        pos: [number, number, number],
        target: [number, number, number]
      ): string => {
        camera.position.set(...pos);
        camera.lookAt(...target);
        camera.updateMatrixWorld();
        gl.render(scene, camera);
        return gl.domElement.toDataURL("image/png");
      };

      // 1. Top-Down Blueprint Angle (0° azimuth, 90° elevation)
      const topDown = takeSnapshotAt([0, 4.4, 0.01], [0, 0, 0]);

      // 2. Front Elevation Angle (0° azimuth, 0° elevation)
      const front = takeSnapshotAt([0, 0.7, 4.2], [0, 0.1, 0]);

      // 3. Isometric Beauty Angle (45° azimuth, 30° elevation)
      const iso = takeSnapshotAt([2.8, 2.4, 2.8], [0, 0.1, 0]);

      // 4. Profile / Side Angle
      const profile = takeSnapshotAt([-3.4, 1.1, 2.4], [0, 0.1, 0]);

      // Restore camera state perfectly
      camera.position.copy(origPos);
      camera.rotation.copy(origRot);
      if ((camera as THREE.PerspectiveCamera).fov !== origFov) {
        (camera as THREE.PerspectiveCamera).fov = origFov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
      camera.updateMatrixWorld();
      gl.render(scene, camera);

      return { topDown, front, iso, profile };
    };

    onRegisterCapture(captureAll);
  }, [gl, scene, camera, onRegisterCapture]);

  return null;
}

