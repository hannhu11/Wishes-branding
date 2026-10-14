import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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
  FullCrossSectionCutaway,
  createFrostingBumpMap,
  createCrumbBumpMap,
  ViscousDripRim,
  createArtisanalCakeGeometry,
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
    shape === "puppy-bow";

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
        return { surfaceY: 0.755, surfaceRadius: 1.15 };
      case "rectangle":
        return { surfaceY: 0.58, surfaceRadius: 1.25 };
      case "cat-y2k":
      case "puppy-bow":
        return { surfaceY: 0.505, surfaceRadius: 1.38 };
      case "cinnamon-roll":
        return { surfaceY: 0.365, surfaceRadius: 0.95 };
      case "croissant":
      case "croissant-bow":
        return { surfaceY: 0.48, surfaceRadius: 0.85 };
      case "egg-tart":
        return { surfaceY: 0.35, surfaceRadius: 0.95 };
      case "cookie":
      case "cookie-bear":
        return { surfaceY: 0.14, surfaceRadius: 1.1 };
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
    if (item.customPositions && item.customPositions.length > 0) {
      return item.customPositions;
    }

    const positions: [number, number, number][] = [];
    const count = item.count;
    const r = surfaceRadius * 0.78;

    if (item.layout === "center" || count === 1) {
      if (item.type === "enamel-pin") {
        // Enamel pin always mounted on front vertical wall / cake board ribbon
        return [[0, surfaceY - 0.35, surfaceRadius + 0.05]];
      }
      if (hasCenterTextOrPiping) {
        // Avoid center collision: place at top crest
        return [[0, surfaceY, -surfaceRadius * 0.65]];
      }
      return [[0, surfaceY, 0]];
    }

    if (item.layout === "ring") {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        positions.push([Math.cos(a) * r, surfaceY, Math.sin(a) * r]);
      }
      return positions;
    }

    if (item.layout === "corners") {
      if (shape === "rectangle") {
        const cx = 1.1;
        const cz = 0.8;
        const cornerCoords: [number, number][] = [
          [-cx, -cz],
          [cx, -cz],
          [-cx, cz],
          [cx, cz],
        ];
        for (let i = 0; i < count; i++) {
          const c = cornerCoords[i % 4];
          positions.push([c[0], surfaceY, c[1]]);
        }
        return positions;
      }
      for (let i = 0; i < count; i++) {
        const a = Math.PI * 0.25 + (i / count) * Math.PI * 2;
        positions.push([Math.cos(a) * r, surfaceY, Math.sin(a) * r]);
      }
      return positions;
    }

    if (item.layout === "front-arc") {
      const arcSpan = Math.PI * 0.6;
      const startA = Math.PI * 0.5 - arcSpan / 2;
      for (let i = 0; i < count; i++) {
        const a = count > 1 ? startA + (i / (count - 1)) * arcSpan : Math.PI * 0.5;
        positions.push([Math.cos(a) * r, surfaceY, Math.sin(a) * r]);
      }
      return positions;
    }

    // Default: scatter
    for (let i = 0; i < count; i++) {
      const a = (i * 2.39996) % (Math.PI * 2);
      const dist = (0.35 + (i % 3) * 0.2) * r;
      positions.push([Math.cos(a) * dist, surfaceY, Math.sin(a) * dist]);
    }
    return positions;
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
          <CatY2KMesh frostingColor={frostingColor} />
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
          <PuppyBowMesh frostingColor={frostingColor} />
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
