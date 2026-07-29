# Athibordee Portfolio — Project Log

## File Map

### Root
| File | Purpose |
|------|---------|
| `index.html` | Vite entry point, mounts `<div id="root">` |
| `vite.config.js` | Vite config with React plugin |
| `package.json` | Dependencies: React, Three.js (R3F), GSAP, Framer Motion, Tailwind |
| `postcss.config.js` | PostCSS config for Tailwind |
| `tailwind.config.js` | Tailwind theme extensions (fonts, colors) |

### `src/`

| File | Purpose |
|------|---------|
| `main.jsx` | ReactDOM.createRoot — renders `<App />` |
| `App.jsx` | Root component: splash gate, 3D canvas background, section layout, FPS/scroll/cursor overlays, shutdown handler |
| `index.css` | Global styles: Tailwind directives, `.eng-card` gradient border, `.blink` animation, `.glitch` hover, `circuit-bg` pattern |

### `src/components/`

| File | Purpose |
|------|---------|
| `Navbar.jsx` | Fixed top nav with active section tracking, clock, mobile hamburger, GitHub link |
| `Hero.jsx` | Hero section with GlitchText name, Terminal embed, scroll-down indicator |
| `About.jsx` | Bio section with skill highlight cards (GSAP reveal) |
| `Skills.jsx` | Progress bars with floating tags |
| `Learning.jsx` | "Currently Learning" cards (left-right reveal) |
| `Projects.jsx` | Project cards staggered with motion.div |
| `ShowcaseWall.jsx` | Tech showcase grid with flip cards + featured projects |
| `WasmDemo.jsx` | C++→WASM benchmark suite (fib, factorial, prime, count_primes) |
| `WebGPUDemo.jsx` | Solar system simulation: C++ OOP (WASM) physics + WebGPU instanced rendering via storage+uniform buffers, Canvas2D fallback |
| `WasmTerrain.jsx` | R3F component: heightmap from C++ WASM worker, deformable plane |
| `Scene3D.jsx` | R3F scene: icosahedron, torus spiral, floating geos, rings, shader particles, WASM terrain |
| `Terminal.jsx` | CLI terminal: 18 commands, up/down history, tab-completion, sound |
| `SplashScreen.jsx` | Boot sequence splash: 11-line boot log, ASCII banner, auto-dismiss after 6s |
| `ShutdownScreen.jsx` | Shutdown animation: 9-line shutdown log, matrix rain, auto-close |
| `SoundEngine.jsx` | Web Audio: ambient drone (4 oscillators), boot jingle (C-E-G-C-E), click blip, command beep, global click handler, auto-enable |
| `GlitchText.jsx` | Hacker text effect: random char substitution, configurable interval/probability |
| `TypeWriter.jsx` | Typewriter effect with cursor blink |
| `ConfettiBurst.jsx` | Particle confetti burst (canvas-based) |
| `CursorGlow.jsx` | Radial gradient that follows mouse |
| `ScrollProgress.jsx` | Thin progress bar at top of viewport |
| `FpsMonitor.jsx` | FPS counter display |
| `GsapReveal.jsx` | GSAP scroll-triggered reveal wrapper |
| `ErrorBoundary.jsx` | React error boundary with fallback UI |
| `Contact.jsx` | Contact section with social links + email |
| `Footer.jsx` | Footer with copyright and credits |

### `src/hooks/`

| File | Purpose |
|------|---------|
| `useOnScreen.js` | Intersection Observer hook for scroll visibility |

### `src/lib/`

| File | Purpose |
|------|---------|
| `shutdown.js` | Module-level shutdown event system (onShutdown/shutdown) |

### `public/`

| File | Purpose |
|------|---------|
| `portfolio.wasm` | Compiled WASM: terrain generation, fib, factorial, prime benchmarks |
| `solarsystem.wasm` | Compiled WASM: C++ OOP solar system (Vec2, Planet, SolarSystem classes) |
| `terrain.worker.js` | Web Worker that loads portfolio.wasm, runs terrain generation off main thread |
| `icons.svg` | SVG icons sprite |

### `wasm/`

| File | Purpose |
|------|---------|
| `portfolio.cpp` | Source: terrain heightmap FBM, fib, factorial, is_prime, count_primes |
| `solarsystem.cpp` | Source: Vec2, Planet class, SolarSystem class, N-body gravity |

---

## Bugs Found & Fixed

### 1. WebGPU Black Screen — Random Lines
- **File**: `src/components/WebGPUDemo.jsx`
- **Root Cause**: WGSL vertex shader used `@group(1) @binding(0)` but JS set the render bind group at index 0.
- **Fix**: Changed `@group(1)` → `@group(0)` to match the render pipeline's bind group layout.
- **Bonus**: Rewrote entire component to show a solar system (9 bodies) instead of black hole accretion disk.

### 2. WebGPU Triangle Topology — Random Lines
- **File**: `src/components/WebGPUDemo.jsx` (original WGSL vertex shader)
- **Root Cause**: Render pipeline used `primitive: { topology: 'triangle-list' }`, but vertex shader emitted 4 vertices per quad. With `triangle-list`, every 3 consecutive vertices form a triangle, causing vertices 3-5 to span across particle boundaries.
- **Fix**: Changed to `topology: 'triangle-strip'`, which correctly interprets vertices [0,1,2,3] as two triangles (0-1-2 and 1-2-3).

### 3. WebGPU Aspect Ratio — Squashed Quads
- **File**: `src/components/WebGPUDemo.jsx` (original WGSL vertex shader)
- **Root Cause**: Aspect ratio was applied to the entire y coordinate `(py - sz) * aspect` instead of just the offset `py + oy * aspect`. This shifted particle centers vertically.
- **Fix**: Applied aspect ratio only to the quad corner offset, not the center position.

### 4. WebGPU Particle Coloring
- **Original**: Color was a function of distance from center (black hole glow).
- **Fix**: Each planet now has its own RGB color stored in the WGSL struct `PlanetData` and passed through the vertex shader.

### 5. C++ WASM Compile Error
- **File**: `wasm/solarsystem.cpp`
- **Root Cause**: Constructor initializer list used `cb(cb)` but the member is named `b`, not `cb`.
- **Fix**: Changed `cb(cb)` → `b(cb)`.

### 6. Tab Completion — Exact Match Loop
- **File**: `src/components/Terminal.jsx`
- **Root Cause**: `Array.find` would match the current input exactly, causing tab completion to "select" the same string already typed.
- **Fix**: Added filter condition `&& c !== input.toLowerCase()` to skip exact matches.

### 7. Sound Not Playing on First Click
- **File**: `src/components/SoundEngine.jsx`
- **Cause**: Global click handler plays `playClick()` only when `_enabled` is true, but `_enabled` starts false.
- **Resolution**: Splash screen calls `enableSound()` before playing boot jingle. Additionally, an auto-enable timer (5s) was added to SoundEngine as a fallback.

### 9. WebGPU Black Screen — Physics Explosion (NaN from infall)
- **File**: `wasm/solarsystem.cpp`
- **Root Cause**: `G=10, M_sun=5000` with arbitrary `vy` values. Required orbital velocity at Earth (r=1.1) was `v = sqrt(50000/1.1) ≈ 213`, but code passed `vy=3.0`. Planet fell straight into the Sun, distance → 0, acceleration → infinity → NaN.
- **Fix**: `G=1.0, M_sun=10.0`. Correct orbital velocities computed as `v = sqrt(G·M_sun/r)` in `init_solar()`. dt clamped to 0.02s in `step()`. Softening term (`dist² + 0.01`) and `minDist = radii sum` collision guard prevent singularities.

### 10. WebGPU Black Screen — Clip Space Off-screen
- **File**: `src/components/WebGPUDemo.jsx`
- **Root Cause**: Planet coordinates up to x=3.6 (Neptune) far exceeded NDC [-1,1], rendering everything outside the viewport.
- **Fix**: Added `SimParams` uniform buffer with `scale = 1.0/4.0 = 0.25` mapping world [-4,4] → NDC [-1,1]. WGSL vertex shader applies `p.pos * sim.scale` and `p.radius * sim.scale`.

### 11. Stretched Triangles & Ribbon Shapes (Cross-Instance Triangles)
- **File**: `src/components/WebGPUDemo.jsx`
- **Root Cause**: `draw(maxPlanets*4, 1)` with `triangle-strip` topology. After planet N's quad (vertices 0-3), the GPU formed triangle (v2, v3, v0) connecting planet N+1's first vertex, creating enormous diagonal strips between distant planets.
- **Fix**: Switched to instanced rendering `draw(4, maxPlanets, 0, 0)`. Each planet is an independent instance with 4 vertices forming one quad via `triangle-strip`. WebGPU never creates primitives across instance boundaries. Vertex shader uses `@builtin(instance_index)` for planet lookup and `@builtin(vertex_index)` for quad corner selection.

### 12. Splash Screen Boot Order
- **File**: `src/components/SplashScreen.jsx`
- **Fix**: Boot line timings adjusted from 300ms to 200ms intervals for faster boot, last line appears at 2400ms, auto-dismiss at 6s.

---

## Features

### 3D Background
- Persistent Three.js canvas behind all content (pointer-events: none)
- Icosahedron with custom shader (scroll-responsive deformation, color shift, scale)
- 7 floating geometric solids (torus knot, octahedron, dodecahedron, etc.) with mouse parallax
- Torus spiral with mouse-reactive rotation
- Ring system (3 elliptical wireframe rings)
- 600-point starfield with scroll-responsive motion
- WASM-generated terrain plane (deforms with scroll)

### WASM Benchmark Suite
- 4 benchmarks compare JS vs C++→WASM performance
- Tests: fib(45), factorial(20), is_prime(1e7), count_primes(50000)
- Real-time speedup ratio display with stacked bar chart
- Source code viewer toggle

### Solar System Simulation (C++ OOP + WASM)
- 9-body N-body gravity simulation (G=1, M_sun=10, correct circular orbit velocities)
- C++ classes: Vec2, Planet, SolarSystem
- Compiled to WASM (6356 bytes), physics runs at ~60fps
- Rendered via WebGPU instanced rendering: `draw(4, count)` with storage buffer for per-planet data, uniform buffer for scale+aspect, `@builtin(instance_index)` for planet lookup
- Canvas2D fallback when WebGPU unavailable
- Sun has glow effect, planets have distinct colors and sizes
- Scale uniform maps world [-4,4] → NDC [-1,1]; aspect uniform corrects for non-square canvas

### CLI Terminal
- 18 commands: whoami, about, skills, projects, contact, ls, cat, echo, date, pwd, banner, neofetch, sudo, 42, mit, wasm, solar, clear, exit, help
- Up/down arrow command history
- Tab auto-completion
- Sound effects on command execution

### Sound Engine (Web Audio API)
- Ambient drone: 4 sine wave oscillators (55, 82.5, 110, 165 Hz) with LFO modulation
- Boot jingle: C-E-G-C-E arpeggio (262, 330, 392, 523, 659 Hz)
- Click sound: 1200Hz square wave blip (40ms)
- Command sound: Dual-tone triangle wave (600+900Hz)
- Global click handler — every click produces a blip
- Auto-enable after 5 seconds if no interaction
- Toggle button in bottom-left corner

### Hacker Text Effects (GlitchText)
- Periodic random character substitution (configurable interval/probability)
- Auto-reverts to original text after 60ms
- Used in Hero section for name display

### Splash Screen
- 11-line boot sequence with timestamps
- ASCII banner (THONGBOONMA figlet)
- Blinking cursor on "Press any key..."
- Auto-dismiss after 6 seconds or on any keypress/click
- Fade-out transition (600ms)

### Shutdown Screen
- 9-line shutdown log with timestamps
- Matrix rain canvas animation (katakana characters)
- Auto-closes after sequence completes

### Other Visual Effects
- Cursor glow (radial gradient following mouse)
- Scroll progress bar (top of viewport)
- FPS monitor (bottom-right)
- Confetti burst on scroll interactions
- GSAP scroll-triggered reveals for about/skills cards
- Gradient border animation on `.eng-card` hover
- Circuit-board background pattern
