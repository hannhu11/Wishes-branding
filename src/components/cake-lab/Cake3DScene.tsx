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
  ToppingConfig,
  SmartDrawingState,
} from "./types";
import {
  RealisticCherry,
  RealisticStrawberry,
  SatinRibbonBow,
  PastelSpiralCandle,
  BirthdayCrown,
  EnamelBadgePin,
  InstancedPastelSprinkles,
  HautePipingPattern,
  useWonkyHeartGeometry,
  useBaroqueRectangleGeometry,
  CinnamonRollMesh,
  FrenchCroissantMesh,
  CustardEggTartMesh,
  ArtisanalCookieMesh,
  FullCrossSectionCutaway,
} from "./PastryGeometries";
import { strokeTo3DCurve, renderPipingToCanvas } from "./SmartPipingEngine";

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
  toppings: ToppingConfig;
  isCutawayMode: boolean;
  drawingState: SmartDrawingState;
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
  toppings,
  isCutawayMode,
  drawingState,
}: Cake3DSceneProps) {
  const cakeGroupRef = useRef<THREE.Group>(null);
  const heartGeometry = useWonkyHeartGeometry();
  const rectangleGeometry = useBaroqueRectangleGeometry();

  const scale = (size / 16) * 1.05;

  // Material settings according to Finish (Material Truth)
  const materialProps = useMemo(() => {
    if (finish === "mirror-glaze") {
      return {
        roughness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.95,
        transmission: 0.08,
        thickness: 1.2,
      };
    }
    if (finish === "velvet-spray") {
      return {
        roughness: 0.82,
        clearcoat: 0.05,
        transmission: 0.02,
        thickness: 0.6,
      };
    }
    // Rustic Buttercream
    return {
      roughness: 0.38,
      clearcoat: 0.28,
      clearcoatRoughness: 0.2,
      transmission: 0.06,
      thickness: 1.0,
    };
  }, [finish]);

  // Determine top surface plane height and radius dynamically for any shape
  const { surfaceY, surfaceRadius } = useMemo(() => {
    switch (shape) {
      case "two-tier":
        return { surfaceY: 0.785, surfaceRadius: 0.95 };
      case "heart":
        return { surfaceY: 0.49, surfaceRadius: 1.15 };
      case "rectangle":
        return { surfaceY: 0.49, surfaceRadius: 1.25 };
      case "cinnamon-roll":
        return { surfaceY: 0.35, surfaceRadius: 0.95 };
      case "croissant":
        return { surfaceY: 0.42, surfaceRadius: 0.85 };
      case "egg-tart":
        return { surfaceY: 0.35, surfaceRadius: 0.95 };
      case "cookie":
        return { surfaceY: 0.22, surfaceRadius: 1.1 };
      case "round":
      default:
        return { surfaceY: 0.515, surfaceRadius: 1.38 };
    }
  }, [shape]);

  // Texture Canvas for Top Calligraphy Text (render strokes as 3D tubes to avoid double rendering)
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

  // Update Canvas Texture when text changes (strokes are rendered in true 3D TubeGeometry)
  useEffect(() => {
    if (!dynamicCanvas || !canvasTexture) return;
    renderPipingToCanvas(
      dynamicCanvas,
      [], // Only render text on 2D disc to avoid duplicate lines with 3D tubes
      drawingState.customText || drawingState.presetText,
      drawingState.textColor,
      false
    );
    canvasTexture.needsUpdate = true;
  }, [dynamicCanvas, canvasTexture, drawingState.customText, drawingState.presetText, drawingState.textColor]);

  // 3D Volumetric Tubes for Multi-point Hand-Piped Strokes
  const tubeGeometries = useMemo(() => {
    return drawingState.strokes
      .map((stroke) => {
        if (!stroke.points || stroke.points.length < 2) return null;
        const curve = strokeTo3DCurve(stroke, surfaceRadius, surfaceY + 0.005);
        if (!curve) return null;
        return {
          geom: new THREE.TubeGeometry(curve, 36, stroke.gauge * 0.016, 8, false),
          color: stroke.color,
        };
      })
      .filter(Boolean);
  }, [drawingState.strokes, surfaceRadius, surfaceY]);

  // 3D Volumetric Cream Beads / Dollops for Single-Point Taps
  const singlePointBeads = useMemo(() => {
    return drawingState.strokes
      .filter((s) => s.points && s.points.length === 1)
      .map((s) => {
        const pt = s.points[0];
        const x3d = (pt.x - 0.5) * (surfaceRadius * 1.5);
        const z3d = (pt.y - 0.5) * (surfaceRadius * 1.5);
        return {
          position: [x3d, surfaceY + s.gauge * 0.016, z3d] as [number, number, number],
          radius: s.gauge * 0.022,
          color: s.color,
        };
      });
  }, [drawingState.strokes, surfaceRadius, surfaceY]);

  // Subtle floating idle motion
  useFrame((state) => {
    if (!cakeGroupRef.current || isCutawayMode) return;
    const t = state.clock.getElapsedTime();
    cakeGroupRef.current.position.y = Math.sin(t * 1.2) * 0.03;
  });

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

  const isCelebrationCake =
    shape === "round" || shape === "heart" || shape === "rectangle" || shape === "two-tier";

  return (
    <group ref={cakeGroupRef} scale={[scale, scale, scale]} position={[0, -0.2, 0]}>
      {/* 1. Main Pastry Body Geometries */}
      {shape === "round" && (
        <group>
          {/* Main Cylinder Body */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 1.0, 64]} />
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Top Piping Ring */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.52}
            color={pipingColor}
          />

          {/* Bottom Rim Piping Ring */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.52}
            y={-0.48}
            color={pipingColor}
            scale={1.06}
          />

          {/* Mid-body Garland Shells */}
          {pipingStyle === "wilton-shell" && (
            <HautePipingPattern
              style="wilton-shell"
              radius={1.51}
              y={0.0}
              color={frostingColor}
              scale={0.88}
            />
          )}

          {/* Top Calligraphy Canvas Disc */}
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 48]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "heart" && (
        <group>
          {/* Heart Body */}
          <mesh geometry={heartGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Heart Top Accent Piping */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.25}
            y={0.48}
            color={pipingColor}
          />

          {/* Top Calligraphy Canvas Disc */}
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "rectangle" && (
        <group>
          {/* Baroque Rectangle Body */}
          <mesh geometry={rectangleGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Rectangle Top Piping */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.35}
            y={0.48}
            color={pipingColor}
          />

          {/* Top Calligraphy Canvas Disc */}
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 1.8]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "two-tier" && (
        <group>
          {/* Base Tier 1 (20cm) */}
          <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.7, 1.7, 0.7, 64]} />
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>
          <HautePipingPattern
            style={pipingStyle}
            radius={1.66}
            y={0.06}
            color={pipingColor}
          />
          <HautePipingPattern
            style={pipingStyle}
            radius={1.72}
            y={-0.64}
            color={pipingColor}
            scale={1.05}
          />

          {/* Top Tier 2 (12cm) */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.05, 1.05, 0.65, 64]} />
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>
          <HautePipingPattern
            style={pipingStyle}
            radius={1.02}
            y={0.78}
            color={pipingColor}
          />

          {/* Top Calligraphy Canvas Disc on Tier 2 */}
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {/* Daily Baked Goods Procedural 3D Meshes */}
      {shape === "cinnamon-roll" && (
        <group>
          <CinnamonRollMesh />
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "croissant" && (
        <group>
          <FrenchCroissantMesh />
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {shape === "cookie" && (
        <group>
          <ArtisanalCookieMesh color={frostingColor} />
          {canvasTexture && (
            <mesh position={[0, surfaceY - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[surfaceRadius, 32]} />
              <meshBasicMaterial map={canvasTexture} transparent depthWrite={false} />
            </mesh>
          )}
        </group>
      )}

      {/* 2. 3D Hand-Drawn Volumetric Cream Tubes */}
      {tubeGeometries.map(
        (tube, idx) =>
          tube && (
            <mesh key={`tube-${idx}`} geometry={tube.geom} castShadow>
              <meshPhysicalMaterial
                color={tube.color}
                roughness={0.25}
                clearcoat={0.65}
                clearcoatRoughness={0.15}
              />
            </mesh>
          )
      )}

      {/* 3. 3D Cream Beads for Single-Point Taps */}
      {singlePointBeads.map((bead, idx) => (
        <mesh key={`bead-${idx}`} position={bead.position} castShadow>
          <sphereGeometry args={[bead.radius, 16, 16]} />
          <meshPhysicalMaterial
            color={bead.color}
            roughness={0.2}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ))}

      {/* 4. Toppings & Accessories for All Pastries */}
      <group position={[0, shape === "two-tier" ? 0.3 : 0, 0]}>
        {/* Cherry */}
        {toppings.cherry && (
          <RealisticCherry position={[0, surfaceY + 0.14, 0]} />
        )}

        {/* Fresh Strawberry */}
        {toppings.strawberry && (
          <RealisticStrawberry position={[0.45, surfaceY + 0.08, 0.35]} />
        )}

        {/* Pastel Sugar Pearls Sprinkles */}
        {toppings.sprinkles && (
          <InstancedPastelSprinkles radius={surfaceRadius * 0.9} y={surfaceY + 0.01} />
        )}

        {/* Baby Blue Satin Ribbon Bow (Slide 84) */}
        {toppings.ribbonBow && (
          <SatinRibbonBow position={[0, shape === "two-tier" ? -0.25 : -0.38, 1.55]} />
        )}

        {/* Pastel Spiral Candle */}
        {toppings.spiralCandle && (
          <PastelSpiralCandle position={[-0.45, surfaceY + 0.02, -0.35]} />
        )}

        {/* Birthday Crown (Slide 85) */}
        {toppings.crown && (
          <BirthdayCrown position={[0, surfaceY + 0.1, 0]} />
        )}

        {/* Enamel Pin Badge (Slide 83) */}
        {toppings.enamelPin && (
          <EnamelBadgePin position={[0.65, surfaceY + 0.03, 0.45]} />
        )}
      </group>
    </group>
  );
}
