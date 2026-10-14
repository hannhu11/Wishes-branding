---
name: motion-design-gsap
description: >-
  Advanced motion design skills using GSAP 3, ScrollTrigger, Lenis smooth scroll,
  SplitText character reveals, magnetic buttons, and GSAP Flip layout transitions.
  Use for award-winning portfolio animations, micro-interactions, and 60fps responsive choreography.
---

# Advanced Motion Design & GSAP 3 for Creative Showcase

A production-grade motion design skill calibrated for Awwwards / FWA standard portfolio experiences.

## Core Motion Principles
- **Bouncy & Tactile:** Like whipped cream and soft marshmallow (`ease: "back.out(1.8)"`).
- **Inertia Smooth Scroll:** Lenis smooth scrolling synchronized with ScrollTrigger ticker.
- **Scroll-driven Storytelling:** Viewport pinning (`pin: true`) with horizontal timeline progression.
- **Micro-Interactions:** Magnetic cursor physics and hover deformations.

## Setup & Dependencies
```bash
npm install gsap @studio-freight/lenis
```

## Key Recipes

### 1. Lenis & ScrollTrigger Integration
```typescript
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothScroll() {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
```

### 2. SplitText Staggered Bouncy Reveal
```typescript
import { gsap } from "gsap";

export function revealSplitText(elements: HTMLElement[]) {
  return gsap.fromTo(
    elements,
    { y: 50, opacity: 0, scale: 0.6, filter: "blur(8px)" },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.0,
      ease: "back.out(1.8)",
      stagger: 0.04,
    }
  );
}
```

### 3. Magnetic Interaction
```typescript
import { gsap } from "gsap";

export function attachMagnetic(element: HTMLElement, power = 0.35) {
  element.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * power;
    const y = (e.clientY - top - height / 2) * power;
    gsap.to(element, { x, y, duration: 0.3, ease: "power2.out" });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1.2, 0.4)" });
  });
}
```
