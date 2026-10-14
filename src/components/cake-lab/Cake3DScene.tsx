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
  toppings: ToppingConfig;
  isCutawayMode: boolean;
  drawingState: SmartDrawingState;
  activeStep?: number;
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
  activeStep = 1,
}: Cake3DSceneProps) {
  const cakeGroupRef = useRef<THREE.Group>(null);
  const heartGeometry = useWonkyHeartGeometry();
  const rectangleGeometry = useBaroqueRectangleGeometry();
  const roundArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.5, 1.0, 0.045), []);
  const tier1ArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.7, 0.7, 0.04), []);
  const tier2ArtisanalGeom = useMemo(() => createArtisanalCakeGeometry(1.05, 0.65, 0.04), []);

  // Procedural Textures generated in-memory (Material Truth)
  const frostingBumpMap = useMemo(() => createFrostingBumpMap(), []);
  const crumbBumpMap = useMemo(() => createCrumbBumpMap(), []);
  const pipingBumpMap = useMemo(() => createPipingBumpMap(), []);

  // Non-uniform realistic size scaling: mini cakes remain chubby & tall, larger cakes expand wider proportionally
  const isCelebrationCake =
    shape === "round" || shape === "heart" || shape === "rectangle" || shape === "two-tier";
  const radialScale = size / 16;
  const heightScale = isCelebrationCake ? 0.85 + ((size - 10) / 14) * 0.25 : (size / 16) * 1.05;
  const groupScale: [number, number, number] = isCelebrationCake
    ? [radialScale, heightScale, radialScale]
    : [(size / 16) * 1.05, (size / 16) * 1.05, (size / 16) * 1.05];

  // Material settings according to Finish (Haute Pâtisserie SSS)
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
    // Rustic Buttercream with SSS (Warm Core & Palette-Knife Swirl Bands)
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

  // Determine top surface plane height and radius dynamically for any shape with exact precision
  const { surfaceY, surfaceRadius } = useMemo(() => {
    switch (shape) {
      case "two-tier":
        return { surfaceY: 0.785, surfaceRadius: 0.95 };
      case "heart":
        return { surfaceY: 0.755, surfaceRadius: 1.15 };
      case "rectangle":
        return { surfaceY: 0.58, surfaceRadius: 1.25 };
      case "cinnamon-roll":
        return { surfaceY: 0.365, surfaceRadius: 0.95 };
      case "croissant":
        return { surfaceY: 0.48, surfaceRadius: 0.85 };
      case "egg-tart":
        return { surfaceY: 0.35, surfaceRadius: 0.95 };
      case "cookie":
        return { surfaceY: 0.12, surfaceRadius: 1.1 };
      case "round":
      default:
        return { surfaceY: 0.505, surfaceRadius: 1.38 };
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

  // 3D Volumetric Tubes for Multi-point Hand-Piped Strokes with Fluted Star Nozzle & Taper
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

  // Subtle floating idle motion with Wonky Charm tilt
  useFrame((state) => {
    if (!cakeGroupRef.current || isCutawayMode) return;
    const t = state.clock.getElapsedTime();
    cakeGroupRef.current.position.y = -0.2 + Math.sin(t * 1.2) * 0.025;
    cakeGroupRef.current.rotation.x = 0.018 + Math.sin(t * 0.8) * 0.002;
    cakeGroupRef.current.rotation.z = -0.015 + Math.cos(t * 0.7) * 0.002;
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

  return (
    <group
      ref={cakeGroupRef}
      scale={groupScale}
      position={[0, -0.2, 0]}
      rotation={[0.018, 0, -0.015]}
    >
      {/* 1. Main Pastry Body Geometries */}
      {shape === "round" && (
        <group>
          {/* Artisanal Cake Body with Soft Palette-Knife Beveled Rims */}
          <mesh geometry={roundArtisanalGeom} position={[0, 0, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Procedural Viscous Drips when Mirror Glaze finish */}
          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.49} y={0.5} color={frostingColor} />
          )}

          {/* Top Piping Ring on Upper Softened Rim */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.46}
            y={0.50}
            color={pipingColor}
            shapeType="round"
          />

          {/* Bottom Rim Piping Ring */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.52}
            y={-0.50}
            color={pipingColor}
            scale={1.06}
            shapeType="round"
          />

          {/* Mid-body Garland Shells */}
          {pipingStyle === "wilton-shell" && (
            <HautePipingPattern
              style="wilton-shell"
              radius={1.51}
              y={0.0}
              color={frostingColor}
              scale={0.88}
              shapeType="round"
            />
          )}

          {/* Top Calligraphy Canvas Disc */}
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
          {/* Heart Body */}
          <mesh geometry={heartGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Heart Top Accent Piping tracing Wonky Heart Contour */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.25}
            y={surfaceY}
            color={pipingColor}
            shapeType="heart"
          />

          {/* Procedural Viscous Drips when Mirror Glaze finish */}
          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.22} y={surfaceY} color={frostingColor} count={22} />
          )}

          {/* Top Calligraphy Canvas Disc */}
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
          {/* Baroque Rectangle Body */}
          <mesh geometry={rectangleGeometry} castShadow receiveShadow position={[0, 0, 0]}>
            <meshPhysicalMaterial color={frostingColor} {...materialProps} />
          </mesh>

          {/* Rectangle Top Piping tracing Baroque Contour */}
          <HautePipingPattern
            style={pipingStyle}
            radius={1.35}
            y={surfaceY}
            color={pipingColor}
            shapeType="rectangle"
          />

          {/* Top Calligraphy Canvas Disc */}
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
          {/* Base Tier 1 (20cm) with Artisanal Rims */}
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

          {/* Top Tier 2 (12cm) with Artisanal Rims */}
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

          {/* Tier 2 Viscous Drip Rim when Mirror Glaze finish */}
          {finish === "mirror-glaze" && (
            <ViscousDripRim radius={1.04} y={surfaceY} color={frostingColor} count={20} />
          )}

          {/* Top Calligraphy Canvas Disc on Tier 2 */}
          {canvasTexture && (
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
            <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

      {shape === "cookie" && (
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

      {/* 2. 3D Hand-Drawn Volumetric Cream Tubes with Longitudinal Fluted Ridges */}
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

      {/* 3. 3D Cream Rosettes for Single-Point Taps */}
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

      {/* 4. Toppings & Accessories for All Pastries (Precision Resting on Top Surface) */}
      <group position={[0, 0, 0]}>
        {/* Cherry with fluted rosette bed */}
        {toppings.cherry && (
          <RealisticCherry position={[0, surfaceY, 0]} />
        )}

        {/* Fresh Strawberry */}
        {toppings.strawberry && (
          <RealisticStrawberry position={[0.45, surfaceY + 0.01, 0.35]} />
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
          <PastelSpiralCandle position={[-0.45, surfaceY + 0.01, -0.35]} />
        )}

        {/* Birthday Crown (Slide 85) */}
        {toppings.crown && (
          <BirthdayCrown position={[0, surfaceY + 0.01, 0]} />
        )}

        {/* Enamel Pin Badge (Slide 83) */}
        {toppings.enamelPin && (
          <EnamelBadgePin position={[0.65, surfaceY + 0.01, 0.45]} />
        )}
      </group>
    </group>
  );
}
