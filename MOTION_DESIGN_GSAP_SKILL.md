# 🎬 SKILL: ADVANCED MOTION DESIGN & GSAP 3 FOR CREATIVE SHOWCASE

## PURPOSE & DOMAIN
This skill provides production-grade animation patterns, timing curves, and integration recipes using **GSAP 3** (GreenSock) and modern motion design principles, calibrated for award-winning creative portfolio websites (Awwwards / FWA / CSS Design Awards) in the Digital Art & Design discipline.

---

## 1. CORE MOTION PHILOSOPHY: ORGANIC & PLAYFUL WHIMSY
For the **Wishes** capstone project, motion should feel:
- **Bouncy & Tactile:** Like soft whipped cream and bouncy marshmallow textures. Use overshoot easing curves such as `back.out(1.7)` and elastic spring dynamics.
- **Fluid & Continuous:** Zero jarring transitions. All page sections flow into each other via Lenis smooth inertia.
- **Reactive to User Touch:** Magnetic button attraction, cursor squashing/stretching, and physics-driven particle displacement.

---

## 2. TOOLSET & DEPENDENCIES
```json
{
  "dependencies": {
    "gsap": "^3.12.5",
    "@studio-freight/lenis": "^1.0.42"
  }
}
```

---

## 3. RECIPES & PATTERNS

### Pattern 1: Lenis + GSAP ScrollTrigger Synchronization
Ensure the virtual scroll engine updates the GSAP ticker seamlessly:
```typescript
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothMotion() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  // Sync Lenis scroll with ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}
```

---

### Pattern 2: Bouncy SplitText Character Stagger Reveal
Used for the primary hero title *"WISHES"* and tagline *"MAKE A WISH. TAKE A BITE"*:
```typescript
import { gsap } from "gsap";

export function animateSplitText(containerSelector: string) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const text = container.textContent || "";
  container.innerHTML = "";

  // Wrap each character in span
  const chars = text.split("").map((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.willChange = "transform, opacity, filter";
    container.appendChild(span);
    return span;
  });

  gsap.fromTo(
    chars,
    {
      y: 60,
      opacity: 0,
      scale: 0.5,
      filter: "blur(10px)",
      rotationZ: () => (Math.random() - 0.5) * 30, // playful wonky rotation
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      rotationZ: 0,
      duration: 1.1,
      ease: "back.out(1.8)",
      stagger: 0.035,
      delay: 0.2,
    }
  );
}
```

---

### Pattern 3: Horizontal Storytelling Pinning Sequence
Pins the viewport and drives a horizontal carousel using vertical scroll:
```typescript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initHorizontalStory(sectionRef: HTMLElement, trackRef: HTMLElement) {
  const trackWidth = trackRef.scrollWidth;
  const viewportWidth = window.innerWidth;
  const distance = trackWidth - viewportWidth;

  gsap.to(trackRef, {
    x: -distance,
    ease: "none",
    scrollTrigger: {
      trigger: sectionRef,
      start: "top top",
      end: () => `+=${distance}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}
```

---

### Pattern 4: Magnetic Button Interaction
Attracts the button toward the cursor when hovering nearby:
```typescript
export function initMagneticButton(button: HTMLElement) {
  const strength = 0.35;

  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;

    gsap.to(button, {
      x,
      y,
      duration: 0.4,
      ease: "power2.out",
    });
  });

  button.addEventListener("mouseleave", () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1.2, 0.4)",
    });
  });
}
```

---

### Pattern 5: Fullscreen Modal Expansion via GSAP Flip
Provides seamless layout transitions when opening artwork details:
```typescript
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export function expandCardToModal(cardElement: HTMLElement, modalContainer: HTMLElement) {
  const state = Flip.getState(cardElement);

  modalContainer.appendChild(cardElement);
  cardElement.classList.add("is-expanded");

  Flip.from(state, {
    duration: 0.7,
    ease: "power3.inOut",
    absolute: true,
    onComplete: () => {
      // reveal additional detail content
    },
  });
}
```
