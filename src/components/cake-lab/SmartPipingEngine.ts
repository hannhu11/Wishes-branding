import * as THREE from "three";
import { DrawPoint, DrawStroke } from "./types";

/**
 * Chaikin's Algorithm for smoothing polygonal curves.
 * Subdivides each segment by cutting corners at 25% and 75% marks.
 */
export function chaikinSmooth(points: DrawPoint[], iterations: number = 2): DrawPoint[] {
  if (points.length <= 1) return points;

  // Subdivide 2 points so it can smoothly bend
  let current: DrawPoint[] = points;
  if (points.length === 2) {
    const p0 = points[0];
    const p1 = points[1];
    current = [
      p0,
      { x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y },
      { x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y },
      p1,
    ];
  }

  for (let it = 0; it < iterations; it++) {
    const next: DrawPoint[] = [];
    next.push(current[0]);

    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];

      const q = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      };
      const r = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      };

      next.push(q);
      next.push(r);
    }

    next.push(current[current.length - 1]);
    current = next;
  }

  return current;
}

/**
 * Simplifies a polyline by filtering out points that are too close to each other.
 */
export function filterMinDistance(points: DrawPoint[], minDist: number = 3): DrawPoint[] {
  if (points.length <= 1) return points;
  const filtered: DrawPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist) {
      filtered.push(curr);
    }
  }

  if (points.length > 1 && filtered[filtered.length - 1] !== points[points.length - 1]) {
    filtered.push(points[points.length - 1]);
  }

  return filtered;
}

/**
 * Converts screen normalized points [0, 1] into 3D Vector3 points on top of the cake.
 */
export function strokeTo3DCurve(
  stroke: DrawStroke,
  radius: number = 1.4,
  yPos: number = 0.51
): THREE.CatmullRomCurve3 | null {
  if (stroke.points.length < 2) return null;

  const smoothed = chaikinSmooth(stroke.points, 2);
  const vectors: THREE.Vector3[] = [];

  for (const pt of smoothed) {
    // pt.x and pt.y are in range [0, 1] relative to the drawing canvas
    // Map to [-radius * 0.75, radius * 0.75]
    const x3d = (pt.x - 0.5) * (radius * 1.5);
    const z3d = (pt.y - 0.5) * (radius * 1.5);
    const vec = new THREE.Vector3(x3d, yPos, z3d);
    if (vectors.length === 0 || vec.distanceTo(vectors[vectors.length - 1]) > 0.005) {
      vectors.push(vec);
    }
  }

  if (vectors.length < 2) return null;
  return new THREE.CatmullRomCurve3(vectors, false, "centripetal");
}

/**
 * Draws the smoothed user strokes and celebratory text onto a 2D Canvas
 * to be used as a dynamic Three.js CanvasTexture.
 */
export function renderPipingToCanvas(
  canvas: HTMLCanvasElement,
  strokes: DrawStroke[],
  text: string,
  textColor: string = "#4A2E1B",
  includeStrokes: boolean = true
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear transparent
  ctx.clearRect(0, 0, width, height);

  // 1. Draw smoothed hand-piped strokes (if enabled)
  if (includeStrokes) {
    for (const stroke of strokes) {
      if (!stroke.points || stroke.points.length === 0) continue;

      const gaugeWidth = stroke.gauge * 3.5;

      // Single-point tap: Draw rounded cream pearl / dollop
      if (stroke.points.length === 1) {
        const pt = stroke.points[0];
        const r = gaugeWidth * 0.9;

        // A. Soft Drop Shadow
        ctx.beginPath();
        ctx.arc(pt.x * width + 1.5, pt.y * height + 2.5, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74, 46, 27, 0.22)";
        ctx.fill();

        // B. Cream Base Bead
        ctx.beginPath();
        ctx.arc(pt.x * width, pt.y * height, r, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();

        // C. Glossy Icing Highlight
        ctx.beginPath();
        ctx.arc(pt.x * width - r * 0.35, pt.y * height - r * 0.35, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.fill();
        continue;
      }

      const smoothed = chaikinSmooth(stroke.points, 2);

      // A. Soft Cream Drop Shadow
      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 46, 27, 0.22)";
      ctx.lineWidth = gaugeWidth + 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(smoothed[0].x * width + 1.5, smoothed[0].y * height + 2.5);
      for (let i = 1; i < smoothed.length; i++) {
        ctx.lineTo(smoothed[i].x * width + 1.5, smoothed[i].y * height + 2.5);
      }
      ctx.stroke();

      // B. Cream Base Stroke
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = gaugeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(smoothed[0].x * width, smoothed[0].y * height);
      for (let i = 1; i < smoothed.length; i++) {
        ctx.lineTo(smoothed[i].x * width, smoothed[i].y * height);
      }
      ctx.stroke();

      // C. Glossy Icing Highlight
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = Math.max(1.5, gaugeWidth * 0.35);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(smoothed[0].x * width - 1, smoothed[0].y * height - 1);
      for (let i = 1; i < smoothed.length; i++) {
        ctx.lineTo(smoothed[i].x * width - 1, smoothed[i].y * height - 1);
      }
      ctx.stroke();
    }
  }

  // 2. Render Elegant Calligraphic Text if present
  if (text && text.trim() !== "") {
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Calligraphy font stack
    ctx.font = "italic bold 32px 'Playfair Display', 'Brush Script MT', 'Dancing Script', cursive, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Cream text shadow
    ctx.fillStyle = "rgba(74, 46, 27, 0.25)";
    ctx.fillText(text, 2, 3);

    // Cream 3D relief layer
    ctx.fillStyle = textColor;
    ctx.fillText(text, 0, 0);

    // Subtle highlight on top of text
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(text, -0.8, -0.8);

    ctx.restore();
  }
}

/**
 * Creates a fluted star shape representing a Wilton #21 / #1M piping tip cross-section.
 */
export function createFlutedStarShape(
  radius: number,
  points: number = 8,
  ridgeDepth: number = 0.22
): THREE.Shape {
  const shape = new THREE.Shape();
  const total = points * 2;
  const innerRadius = radius * (1 - ridgeDepth);

  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const r = i % 2 === 0 ? radius : innerRadius;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Builds a 3D volumetric tube geometry along a CatmullRomCurve3
 * featuring 8-pointed star nozzle grooves and organic start/end tapers (lifted piping bag effect).
 */
export function createTaperedFlutedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  baseRadius: number = 0.035,
  points: number = 8,
  tubularSegments: number = 40
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const numVerticesPerRing = points * 2;

  // Compute Frenet frames for the curve
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices for each ring along the curve
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const point = curve.getPointAt(t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    // Tapering profile: organic start 8%, end 12%
    const startTaper = smoothstep(0, 0.08, t);
    const endTaper = 1 - smoothstep(0.88, 1.0, t);
    const taper = Math.max(0.18, Math.min(startTaper, endTaper));
    const rOuter = baseRadius * taper;
    const rInner = rOuter * (1 - 0.22); // Fluted star valley

    for (let j = 0; j < numVerticesPerRing; j++) {
      const angle = (j / numVerticesPerRing) * Math.PI * 2;
      const r = j % 2 === 0 ? rOuter : rInner;
      const cx = Math.cos(angle) * r;
      const cy = Math.sin(angle) * r;

      // Project into world plane spanned by normal & binormal
      const vx = point.x + normal.x * cx + binormal.x * cy;
      const vy = point.y + normal.y * cx + binormal.y * cy;
      const vz = point.z + normal.z * cx + binormal.z * cy;

      positions.push(vx, vy, vz);
      uvs.push(j / numVerticesPerRing, t);
    }
  }

  // Generate indices for the tube body
  for (let i = 0; i < tubularSegments; i++) {
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
  const startPt = curve.getPointAt(0);
  positions.push(startPt.x, startPt.y, startPt.z);
  uvs.push(0.5, 0);
  for (let j = 0; j < numVerticesPerRing; j++) {
    const nextJ = (j + 1) % numVerticesPerRing;
    indices.push(startCenterIdx, nextJ, j);
  }

  // Cap end
  const endCenterIdx = positions.length / 3;
  const endPt = curve.getPointAt(1);
  positions.push(endPt.x, endPt.y, endPt.z);
  uvs.push(0.5, 1);
  const lastRingOffset = tubularSegments * numVerticesPerRing;
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
 * Creates a fluted star cream rosette / dollop for single-point taps.
 */
export function createFlutedRosetteGeometry(
  radius: number = 0.05,
  points: number = 8,
  rings: number = 10
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const numVerticesPerRing = points * 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = Math.pow(t, 0.75) * radius * 1.35;
    const rProfile = Math.max(0.01, (1 - t) * Math.sqrt(Math.max(0.01, 1 - Math.pow(t - 0.2, 2) * 0.3)));
    const rOuter = radius * 1.15 * rProfile;
    const rInner = rOuter * (1 - 0.25);
    const swirl = t * 0.45; // Subtle spiral twist of star tip

    for (let j = 0; j < numVerticesPerRing; j++) {
      const angle = (j / numVerticesPerRing) * Math.PI * 2 + swirl;
      const r = j % 2 === 0 ? rOuter : rInner;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      positions.push(x, y, z);
      uvs.push(j / numVerticesPerRing, t);
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < numVerticesPerRing; j++) {
      const current = i * numVerticesPerRing + j;
      const next = i * numVerticesPerRing + ((j + 1) % numVerticesPerRing);
      const above = (i + 1) * numVerticesPerRing + j;
      const aboveNext = (i + 1) * numVerticesPerRing + ((j + 1) % numVerticesPerRing);

      indices.push(current, above, next);
      indices.push(next, above, aboveNext);
    }
  }

  // Peak tip vertex
  const peakIdx = positions.length / 3;
  positions.push(0, radius * 1.4, 0);
  uvs.push(0.5, 1);
  const lastRingOffset = rings * numVerticesPerRing;
  for (let j = 0; j < numVerticesPerRing; j++) {
    const nextJ = (j + 1) % numVerticesPerRing;
    indices.push(peakIdx, lastRingOffset + j, lastRingOffset + nextJ);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

/**
 * Creates a procedural normal bump map for fluted star tip grooves.
 */
export function createPipingBumpMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const flute = Math.sin((x / size) * Math.PI * 16) * 45;
      const grain = (Math.random() - 0.5) * 8;
      const val = Math.min(255, Math.max(0, 128 + flute + grain));

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
  texture.repeat.set(1, 4);
  texture.needsUpdate = true;
  return texture;
}
