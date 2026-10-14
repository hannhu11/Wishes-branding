import * as THREE from "three";
import { DrawPoint, DrawStroke, TypographyState, FONT_OPTIONS } from "./types";

/**
 * Chaikin's Algorithm for smoothing polygonal curves.
 * Subdivides each segment by cutting corners at 25% and 75% marks.
 */
export function chaikinSmooth(points: DrawPoint[], iterations: number = 2): DrawPoint[] {
  if (points.length <= 1) return points;

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
 * Catmull-Rom Spline Resampling for smooth, fluid handwriting calligraphy (64 segments).
 */
export function catmullRomResample(points: DrawPoint[], numPoints: number = 64): DrawPoint[] {
  if (points.length <= 2) return chaikinSmooth(points, 3);

  const vectors = points.map((p) => new THREE.Vector2(p.x, p.y));
  const curve = new THREE.SplineCurve(vectors);
  const spaced = curve.getSpacedPoints(numPoints);

  return spaced.map((v) => ({ x: v.x, y: v.y }));
}

/**
 * AI / Algorithmic Aesthetic Beautifier ("✨ AI Tinh Chỉnh & Gợi Ý Nét Vẽ")
 * Analyzes stroke curvature, closure, and bounding box to snap to perfect aesthetic vector paths.
 */
export function beautifyStroke(points: DrawPoint[]): {
  detectedShape: "heart" | "star" | "flower" | "handwriting";
  beautifiedPoints: DrawPoint[];
} {
  if (points.length < 5) {
    return { detectedShape: "handwriting", beautifiedPoints: points };
  }

  // Calculate bounding box and center
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const width = Math.max(0.04, maxX - minX);
  const height = Math.max(0.04, maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const diag = Math.sqrt(width * width + height * height);

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = Math.sqrt(Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2));
  const isClosed = startEndDist < diag * 0.35;

  if (isClosed && points.length >= 8) {
    // Check for heart: has top center dip and bottom point
    // Find highest point near center X
    const midXPoints = points.filter((p) => Math.abs(p.x - cx) < width * 0.25);
    const topDip = midXPoints.reduce((min, p) => (p.y > min.y ? p : min), midXPoints[0] || points[0]);
    const bottomPoint = points.reduce((max, p) => (p.y > max.y ? p : max), points[0]);

    // If there is an indentation at top center compared to the peaks
    const hasTopDip = topDip && topDip.y > minY + height * 0.18;

    if (hasTopDip || (width / height > 0.75 && width / height < 1.35 && points.length > 12)) {
      // Snap to perfect Wonky Heart parametric curve
      const heartPoints: DrawPoint[] = [];
      const totalSteps = 48;
      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * Math.PI * 2;
        // Standard cardioid parametric curve scaled to bbox
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const normX = hx / 16; // -1 to 1
        const normY = (hy + 2.5) / 16.5; // -1 to 1

        heartPoints.push({
          x: cx + normX * (width * 0.48),
          y: cy + normY * (height * 0.48),
        });
      }
      return { detectedShape: "heart", beautifiedPoints: heartPoints };
    }

    // Check for 5-pointed Star: count direction turns
    let turns = 0;
    for (let i = 2; i < points.length; i++) {
      const v1x = points[i - 1].x - points[i - 2].x;
      const v1y = points[i - 1].y - points[i - 2].y;
      const v2x = points[i].x - points[i - 1].x;
      const v2y = points[i].y - points[i - 1].y;
      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
      if (mag1 > 0.005 && mag2 > 0.005) {
        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        if (cosAngle < 0.25) turns++;
      }
    }

    if (turns >= 4 && turns <= 8) {
      // Snap to 5-pointed Y2K Sparkle Star
      const starPoints: DrawPoint[] = [];
      const pointsCount = 5;
      const rOuter = Math.min(width, height) * 0.48;
      const rInner = rOuter * 0.42;
      for (let i = 0; i <= pointsCount * 2; i++) {
        const angle = -Math.PI / 2 + (i / (pointsCount * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? rOuter : rInner;
        starPoints.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }
      return { detectedShape: "star", beautifiedPoints: starPoints };
    }

    // Default closed loop -> Daisy Flower or Rose
    const flowerPoints: DrawPoint[] = [];
    const petals = 5;
    const rBase = Math.min(width, height) * 0.35;
    const rAmp = rBase * 0.35;
    for (let i = 0; i <= 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const r = rBase + rAmp * Math.sin(petals * angle);
      flowerPoints.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
    return { detectedShape: "flower", beautifiedPoints: flowerPoints };
  }

  // Open stroke -> Catmull-Rom spline smoothed handwriting
  const smoothed = catmullRomResample(points, 56);
  return { detectedShape: "handwriting", beautifiedPoints: smoothed };
}

/**
 * 8 One-Click Vector Piping Stamps
 */
export interface PipingStampDefinition {
  id: string;
  name: string;
  icon: string;
  generateStrokes: (center: DrawPoint, scale: number) => DrawPoint[][];
}

export const PIPING_STAMPS: PipingStampDefinition[] = [
  {
    id: "stamp-heart",
    name: "Trái Tim Wonky",
    icon: "💖",
    generateStrokes: (center, s = 0.15) => {
      const pts: DrawPoint[] = [];
      for (let i = 0; i <= 36; i++) {
        const t = (i / 36) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({
          x: center.x + (hx / 16) * s,
          y: center.y + ((hy + 2) / 16) * s,
        });
      }
      return [pts];
    },
  },
  {
    id: "stamp-star",
    name: "Sao Y2K Lấp Lánh",
    icon: "✨",
    generateStrokes: (center, s = 0.14) => {
      const pts: DrawPoint[] = [];
      for (let i = 0; i <= 8; i++) {
        const angle = -Math.PI / 2 + (i / 8) * Math.PI * 2;
        const r = i % 2 === 0 ? s : s * 0.28;
        pts.push({
          x: center.x + Math.cos(angle) * r,
          y: center.y + Math.sin(angle) * r,
        });
      }
      return [pts];
    },
  },
  {
    id: "stamp-flower",
    name: "Hoa Cúc 5 Cánh",
    icon: "🌸",
    generateStrokes: (center, s = 0.14) => {
      const pts: DrawPoint[] = [];
      for (let i = 0; i <= 50; i++) {
        const a = (i / 50) * Math.PI * 2;
        const r = s * (0.65 + 0.35 * Math.sin(5 * a));
        pts.push({
          x: center.x + Math.cos(a) * r,
          y: center.y + Math.sin(a) * r,
        });
      }
      return [pts];
    },
  },
  {
    id: "stamp-ribbon-bow",
    name: "Nơ Ruy-băng Kem",
    icon: "🎀",
    generateStrokes: (center, s = 0.16) => {
      // Loop 1 left
      const leftLoop: DrawPoint[] = [];
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        leftLoop.push({
          x: center.x - s * 0.5 + Math.cos(a) * s * 0.45,
          y: center.y + Math.sin(a) * s * 0.35,
        });
      }
      // Loop 2 right
      const rightLoop: DrawPoint[] = [];
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        rightLoop.push({
          x: center.x + s * 0.5 + Math.cos(a) * s * 0.45,
          y: center.y + Math.sin(a) * s * 0.35,
        });
      }
      return [leftLoop, rightLoop];
    },
  },
  {
    id: "stamp-smiley",
    name: "Mặt Cười Wonky",
    icon: "🙂",
    generateStrokes: (center, s = 0.15) => {
      // Face circle
      const face: DrawPoint[] = [];
      for (let i = 0; i <= 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        face.push({ x: center.x + Math.cos(a) * s, y: center.y + Math.sin(a) * s });
      }
      // Smile arc
      const smile: DrawPoint[] = [];
      for (let i = 0; i <= 16; i++) {
        const a = Math.PI * 0.15 + (i / 16) * Math.PI * 0.7;
        smile.push({ x: center.x + Math.cos(a) * s * 0.6, y: center.y + Math.sin(a) * s * 0.6 });
      }
      return [face, smile];
    },
  },
  {
    id: "stamp-crown",
    name: "Vương Miện Kem",
    icon: "👑",
    generateStrokes: (center, s = 0.16) => {
      const crown: DrawPoint[] = [
        { x: center.x - s * 0.8, y: center.y + s * 0.4 },
        { x: center.x - s * 0.8, y: center.y - s * 0.2 },
        { x: center.x - s * 0.4, y: center.y + s * 0.1 },
        { x: center.x, y: center.y - s * 0.5 },
        { x: center.x + s * 0.4, y: center.y + s * 0.1 },
        { x: center.x + s * 0.8, y: center.y - s * 0.2 },
        { x: center.x + s * 0.8, y: center.y + s * 0.4 },
        { x: center.x - s * 0.8, y: center.y + s * 0.4 },
      ];
      return [crown];
    },
  },
  {
    id: "stamp-wish",
    name: 'Chữ "Wish" Calligraphy',
    icon: "✍️",
    generateStrokes: (center, s = 0.18) => {
      // Smooth signature cursive stroke
      const wishStroke: DrawPoint[] = [
        { x: center.x - s * 0.9, y: center.y - s * 0.3 },
        { x: center.x - s * 0.7, y: center.y + s * 0.4 },
        { x: center.x - s * 0.5, y: center.y - s * 0.2 },
        { x: center.x - s * 0.3, y: center.y + s * 0.35 },
        { x: center.x - s * 0.1, y: center.y - s * 0.1 },
        { x: center.x + s * 0.1, y: center.y + s * 0.3 },
        { x: center.x + s * 0.4, y: center.y - s * 0.4 },
        { x: center.x + s * 0.6, y: center.y + s * 0.2 },
        { x: center.x + s * 0.9, y: center.y - s * 0.1 },
      ];
      return [catmullRomResample(wishStroke, 36)];
    },
  },
  {
    id: "stamp-lace-border",
    name: "Khung Viền Ren Baroque",
    icon: "🪞",
    generateStrokes: (center, s = 0.2) => {
      const lace: DrawPoint[] = [];
      const scallops = 12;
      for (let i = 0; i <= scallops * 6; i++) {
        const a = (i / (scallops * 6)) * Math.PI * 2;
        const r = s * (0.85 + 0.15 * Math.abs(Math.sin(scallops * a * 0.5)));
        lace.push({
          x: center.x + Math.cos(a) * r,
          y: center.y + Math.sin(a) * r,
        });
      }
      return [lace];
    },
  },
];

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
 * to be used as a dynamic Three.js CanvasTexture with 3D Embossed Relief!
 */
export function renderPipingToCanvas(
  canvas: HTMLCanvasElement,
  strokes: DrawStroke[],
  text: string,
  textColor: string = "#4A2E1B",
  includeStrokes: boolean = true,
  typography?: TypographyState
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

      // Single-point tap: Draw rounded cream pearl
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

  // 2. Render Full Typography Engine (Multi-line, 6 Fonts, Arc/Plaque, Embossed 3D Relief)
  const displayText = typography?.text || text;
  if (displayText && displayText.trim() !== "") {
    ctx.save();

    const fontConfig = FONT_OPTIONS.find((f) => f.id === typography?.font) || FONT_OPTIONS[0];
    const fontSize = typography?.fontSize || 28;
    const lineHeightRatio = typography?.lineHeight || 1.3;
    const textAlign = typography?.align || "center";
    const textCurve = typography?.curve || "straight";
    const activeTextColor = typography?.color || textColor;
    const offsetX = ((typography?.offsetX || 0) / 100) * (width * 0.4);
    const offsetY = ((typography?.offsetY || 0) / 100) * (height * 0.4);

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    ctx.font = `bold ${fontSize}px ${fontConfig.fontFam}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";

    const lines = displayText.split("\n");
    const totalLineHeight = fontSize * lineHeightRatio;

    // A. Render White Chocolate Plaque if curve is "plaque"
    if (textCurve === "plaque") {
      const maxLineWidth = lines.reduce(
        (max, line) => Math.max(max, ctx.measureText(line).width),
        0
      );
      const plaqueW = Math.max(160, maxLineWidth + 44);
      const plaqueH = Math.max(64, lines.length * totalLineHeight + 28);
      const px = centerX - plaqueW / 2;
      const py = centerY - plaqueH / 2;
      const pr = 14;

      // Drop shadow of plaque
      ctx.fillStyle = "rgba(45, 25, 15, 0.28)";
      ctx.beginPath();
      ctx.roundRect(px + 3, py + 4, plaqueW, plaqueH, pr);
      ctx.fill();

      // White chocolate body with subtle golden cream gradient
      const grad = ctx.createLinearGradient(px, py, px + plaqueW, py + plaqueH);
      grad.addColorStop(0, "#FFFFFF");
      grad.addColorStop(0.5, "#FFFDF5");
      grad.addColorStop(1, "#FFF7E6");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(px, py, plaqueW, plaqueH, pr);
      ctx.fill();

      // Gold rim border
      ctx.strokeStyle = "#DAA520";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(px + 2, py + 2, plaqueW - 4, plaqueH - 4, pr - 2);
      ctx.stroke();

      // Corner scallop dots
      ctx.fillStyle = "#DAA520";
      const dotR = 2.5;
      ctx.beginPath();
      ctx.arc(px + 8, py + 8, dotR, 0, Math.PI * 2);
      ctx.arc(px + plaqueW - 8, py + 8, dotR, 0, Math.PI * 2);
      ctx.arc(px + 8, py + plaqueH - 8, dotR, 0, Math.PI * 2);
      ctx.arc(px + plaqueW - 8, py + plaqueH - 8, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Draw Curved or Straight Multi-line Text
    lines.forEach((line, lineIdx) => {
      const lineYOffset = (lineIdx - (lines.length - 1) / 2) * totalLineHeight;
      const currentY = centerY + lineYOffset;

      if (textCurve === "arc-top" || textCurve === "arc-bottom") {
        // Render characters along circular arc
        const arcRadius = 140;
        const isBottom = textCurve === "arc-bottom";
        const totalChars = line.length;
        const totalAngle = Math.min(Math.PI * 0.9, totalChars * 0.16);
        const startAngle = (isBottom ? Math.PI / 2 : -Math.PI / 2) - totalAngle / 2;

        for (let i = 0; i < totalChars; i++) {
          const char = line[i];
          const charAngle = startAngle + (i / Math.max(1, totalChars - 1)) * totalAngle;
          const charX = centerX + Math.cos(charAngle) * arcRadius;
          const charY = centerY + (isBottom ? -arcRadius * 0.6 : arcRadius * 0.6) + Math.sin(charAngle) * arcRadius;

          ctx.save();
          ctx.translate(charX, charY);
          ctx.rotate(charAngle + (isBottom ? -Math.PI / 2 : Math.PI / 2));

          // 3D Embossed Relief Multi-Pass
          // Pass 1: Drop Shadow
          ctx.fillStyle = "rgba(74, 46, 27, 0.28)";
          ctx.fillText(char, 1.5, 2.5);

          // Pass 2: Base Text
          ctx.fillStyle = activeTextColor;
          ctx.fillText(char, 0, 0);

          // Pass 3: Top Cream Specular Glint
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.fillText(char, -0.8, -0.8);

          ctx.restore();
        }
      } else {
        // Straight / Plaque multi-pass 3D Embossed text
        // Pass 1: Drop Shadow
        ctx.fillStyle = "rgba(74, 46, 27, 0.28)";
        ctx.fillText(line, centerX + 1.8, currentY + 2.5);

        // Pass 2: Base Cream Lettering
        ctx.fillStyle = activeTextColor;
        ctx.fillText(line, centerX, currentY);

        // Pass 3: Specular High Relief Highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText(line, centerX - 0.8, currentY - 0.8);
      }
    });

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
    const rInner = rOuter * (1 - 0.22);

    for (let j = 0; j < numVerticesPerRing; j++) {
      const angle = (j / numVerticesPerRing) * Math.PI * 2;
      const r = j % 2 === 0 ? rOuter : rInner;
      const cx = Math.cos(angle) * r;
      const cy = Math.sin(angle) * r;

      const vx = point.x + normal.x * cx + binormal.x * cy;
      const vy = point.y + normal.y * cx + binormal.y * cy;
      const vz = point.z + normal.z * cx + binormal.z * cy;

      positions.push(vx, vy, vz);
      uvs.push(j / numVerticesPerRing, t);
    }
  }

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
    const swirl = t * 0.45;

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
