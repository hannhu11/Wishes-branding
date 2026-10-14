---
name: threejs-surrealism
description: >-
  Three.js, WebGL, and React Three Fiber skills for high-end 3D surrealism,
  procedural confectionery configurators, pastel studio lighting, GLSL liquid shaders,
  and dreamy post-processing (UnrealBloom, ChromaticAberration).
---

# Three.js & 3D Surrealism for Creative Portfolios

A production-ready WebGL skill guide for building interactive 3D dreamscapes and procedural customizers in Three.js and React Three Fiber (`@react-three/fiber`, `@react-three/drei`).

## Core Visual Palette & Lighting
- **Key Light:** Warm morning sunlight (`#FFF5EA`, intensity 1.5)
- **Fill Light:** Soft baby-blue ambient fill (`#BDE0FE`, intensity 0.8)
- **Rim Lights:** Dual pastel rim lights (`#FFAEC9` cotton candy pink and `#A0C4FF` sky blue)
- **Materials:** Subsurface scattering emulation for cake fondant, glossy clearcoat for cherries and glaze (`clearcoat: 1.0`, `roughness: 0.1`).

## Setup & Dependencies
```bash
npm install three @types/three @react-three/fiber @react-three/drei @react-three/postprocessing
```

## Key Patterns
- **Full-Viewport Persistent 3D Spine:** Persistent canvas with scroll-interpolated camera vectors.
- **3D Cake Customizer Lab:** Procedural heart/round extrusions, real-time 360° orbit controls, and topping placements.
- **Custom GLSL Ripple Shader:** Wave displacement on hover mimicking soft jelly / liquid icing.
- **Instanced Sprinkles Cloud:** 200+ floating confectionary particles scattered in 3D depth.
