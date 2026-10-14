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
    vectors.push(new THREE.Vector3(x3d, yPos, z3d));
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
