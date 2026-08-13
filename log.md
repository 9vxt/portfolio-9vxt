# 9vxt Portfolio — Project Log

## File Map

### Root
| File | Purpose |
|------|---------|
| `index.html` | Vite entry point, mounts `<div id="root">` |
| `vite.config.js` | Vite config with React plugin + Tailwind v4 |
| `package.json` | Dependencies: React 19, Three.js (R3F), Framer Motion, Tailwind 4, Vite 8 |
| `tsconfig.json` | TypeScript config (mixed .tsx/.jsx project) |
| `.oxlintrc.json` | Lint config |
| `.gitignore` | Ignores `node_modules`, `dist`; tracks `public/` |
| `public/_headers` | Cloudflare Pages: COOP/COEP headers for WASM/WebGPU/SharedArrayBuffer |
| `log.md` | This file |
| `fix.md` | Earlier codebase audit |

### `src/`
| File | Purpose |
|------|---------|
| `main.jsx` | ReactDOM.createRoot — renders `<App />` |
| `App.jsx` | Root: splash gate → login gate → main layout, 3D canvas background, overlay components, shutdown handler, `useIsMobile` gating |
| `index.css` | Global styles: Tailwind, `.eng-card` gradient border, `.scanlines`, glitch keyframes, theme vars, section reveal |

### `src/components/`
| File | Purpose |
|------|---------|
| `SplashScreen.jsx` | **Bootup screen**: particle canvas bg, ASCII banner, 11-line boot log, fake metrics, progress bar, press-any-key → login |
| `LoginScreen.jsx` | 9vxt login gate: ASCII "9vxt" banner, password typing animation, Enter key or `_login` button (mobile) → main app |
| `ShutdownScreen.jsx` | 9-line shutdown log, matrix-rain canvas, HALT sequence, auto window.close() |
| `Scene3D.jsx` | R3F scene: shader icosahedron, rings, torus spiral, particles, WASM terrain, orbiting shapes. Delta-time animation + GPU disposal. Reduced on mobile |
| `WasmTerrain.jsx` | R3F terrain plane deformed by C++ WASM worker heightmaps; wireframe + normals skipped on mobile |
| `WebGPUDemo.jsx` | Solar system: C++ WASM physics + 3-pass WebGPU render (starfield bg, orbital trails, SDF planets), Canvas2D fallback |
| `WasmDemo.jsx` | C++→WASM benchmark suite (fib, factorial, is_prime, count_primes) vs JS |
| `Terminal.jsx` | CLI terminal: help, whoami, about, skills, projects, cat, echo, scroll, clock, uptime, solar, exit, easter eggs; history + tab-completion |
| `Navbar.jsx` | Fixed nav with active-section tracking (IObserver), clock, status ticker, GitHub link, mobile hamburger |
| `Hero.jsx` | Hero with GlitchText, animated name cycling, subtitle typewriter, Terminal embed, scroll indicator |
| `About.jsx` | Bio section with highlight cards |
| `Skills.jsx` | Progress-bar skill list with floating tags |
| `Learning.jsx` | "Currently Learning" cards |
| `Projects.jsx` | Featured project cards (ESP32 calc, Rucyd OS, DSP guitar) |
| `ShowcaseWall.jsx` | Tech-stack flip cards (multi-flip Set) + featured project mini-cards |
| `Contact.jsx` | Social links (GitHub, Instagram, LinkedIn, Email, Spotify, LINE) |
| `Footer.jsx` | Copyright + credits |
| `StatsCounter.jsx` | Animated stats counter |
| `SectionReveal.jsx` | IObserver-driven section reveal (unobserves after first reveal) |
| `SectionBreadcrumb.jsx` | Right-edge dot navigation with active-section tracking (IObserver) |
| `SectionCounter.jsx` | Fixed "01 / 09" section counter (IObserver) |
| `ScrollProgress.jsx` | Thin top progress bar (native scroll + rAF) |
| `CursorGlow.jsx` | Mouse-follow radial glow (hidden on mobile) |
| `ClickParticles.jsx` | Click burst particles, capped at 100 (hidden on mobile) |
| `GlobalGlitch.jsx` | CSS-only text glitch on random DOM elements + `GlitchToggle` (hidden on mobile) |
| `FpsMonitor.tsx` | FPS counter badge (hidden on mobile) |
| `SoundEngine.jsx` | Web Audio: ambient drone, melody, boot/shutdown jingles, click blips, SoundToggle, suspend-on-hide |
| `ThemeSwitcher.jsx` | cyber / matrix / synthwave themes via CSS vars, synchronous apply |
| `KeyboardShortcuts.jsx` | `?` menu + g+key navigation (hidden on mobile) |
| `ConsoleArt.jsx` | ASCII art printed to devtools console |
| `DynamicTitle.jsx` | Rotating document title |
| `Toast.jsx` | Toast notifications |
| `ScrollToTop.jsx` | Scroll-to-top button |
| `PingIndicator.jsx` | Cycling status pings (navbar) |
| `ErrorBoundary.jsx` | React error boundary with fallback UI |

### `src/hooks/`
| File | Purpose |
|------|---------|
| `useOnScreen.js` | IntersectionObserver scroll-visibility hook |
| `useIsMobile.js` | Touch detection via `matchMedia('(pointer: coarse)')` |

### `src/lib/`
| File | Purpose |
|------|---------|
| `shutdown.js` | Module-level shutdown event system (onShutdown/shutdown) |

### `public/`
| File | Purpose |
|------|---------|
| `wasm/portfolio.wasm` | Compiled WASM: terrain gen, fib, factorial, prime benchmarks |
| `wasm/solarsystem.wasm` | Compiled WASM: C++ OOP solar system |
| `terrain.worker.js` | Web Worker loading portfolio.wasm off main thread |
| `_headers` | Cloudflare COOP/COEP headers (`same-origin` / `require-corp`) |
| `icons.svg` | SVG icons sprite |

### `wasm/`
| File | Purpose |
|------|---------|
| `portfolio.cpp` | Source: terrain FBM, fib, factorial, is_prime, count_primes |
| `solarsystem.cpp` | Source: Vec2, Planet, SolarSystem N-body classes |

---

## Boot Sequence

```
SplashScreen (boot log, 8s fallback)
    ↓ press any key / click
LoginScreen (types ••••••••, Enter or _login button)
    ↓ onLogin
Main app (Scene3D + sections + overlays)
```

- **Bootup screen file**: `src/components/SplashScreen.jsx`

---

## Bugs Found & Fixed

### WebGPU Solar System (`WebGPUDemo.jsx`)
1. **Bind group index mismatch** — WGSL `@group(1)` vs JS bind group 0 → changed to `@group(0)`.
2. **Triangle topology** — `triangle-list` misrendered quads → switched to `triangle-strip`.
3. **Aspect ratio** — aspect applied to center instead of quad offset → applied only to corner offset.
4. **Per-planet colors** — color baked into `PlanetData` struct and passed via vertex shader.
5. **C++ compile error** — `cb(cb)` wrong member name in `solarsystem.cpp` → `b(cb)`.
6. **NaN physics explosion** — `G=10, M_sun=5000` produced infall→NaN → `G=1, M_sun=10`, correct orbital velocities `v=√(GM/r)`, dt clamped to 0.02s, softening + collision guard.
7. **Clip-space off-screen** — Neptune x=3.6 exceeded NDC → `SimParams` uniform with `scale=0.25`.
8. **Cross-instance triangles** — `draw(n*4,1)` created strips across planets → instanced rendering `draw(4, n)`.
9. **Pac-Man wedge** — wrong quad corner order left a quadrant unrendered → explicit corner array `[(-1,-1),(1,-1),(-1,1),(1,1)]`.

### UI / Terminal
10. **Tab completion exact match** — `find` matched current input → added `&& c !== input.toLowerCase()`.
11. **Sound on first click** — `_enabled` started false → splash calls `enableSound()` before `playBoot()`.
12. **Splash boot timing** — 300ms→200ms intervals, last line at ~2400ms, dismiss at 6-8s.
13. **Login screen** — types password `••••••••`, shows 9vxt instantly, solid bg (no backdrop-blur), minimal 3D scene during login for 60fps.
14. **Login mobile support** — added clickable `_login` button for devices without Enter key.

### Perf / Stability
15. **Delta-based animation** — removed all modulo frame-skipping in `Scene3D` sub-components; all `useFrame` now use `(state, delta)` for constant speed at any refresh rate.
16. **GPU memory leaks** — all geometries/materials created in `useMemo` and `.dispose()`d on unmount.
17. **Layout thrashing** — `SectionBreadcrumb`/`SectionCounter` moved from `getBoundingClientRect`+rAF scroll to `IntersectionObserver`.
18. **WASM memory invalidation** — WebGPU demo reads WASM memory via `.slice()` copy instead of live `Float32Array` views.
19. **WasmDemo load failure** — `load()` now caches the error and fails fast instead of hanging.
20. **ClickParticles cap** — capped at 100 active DOM particles.
21. **Canvas dpr** — clamped to `min(devicePixelRatio, 2)` on the 3D Canvas and WebGPU demo canvas.
22. **Login flash / dead UI** — theme applied synchronously in state initializer; disabled project buttons recolored to visible `#475569`.

---

## Features

### Boot & Login
- Boot splash with particle-field canvas, fake MEM/CPU/PROCS metrics, live clock, animated progress bar, press-any-key dismiss (8s fallback)
- Login gate: "Rucyd Os login" ASCII banner, typed password, Enter key or `_login` button (mobile-friendly), minimal 3D terrain during login

### 3D Background
- Persistent R3F canvas behind all content
- Custom-shader icosahedron (scroll deformation, color shift, fresnel)
- Ring system, torus spiral, floating solids, orbiting shapes, vertex-colored helix & stars
- 600-point particle field (150 on mobile)
- WASM worker-generated terrain plane (deforms with scroll)
- Adaptive dpr, delta-time animation, full GPU resource disposal

### WASM Benchmark Suite
- 4 benchmarks compare JS vs C++→WASM: fib(45), factorial(20), is_prime(1e7), count_primes(50000)
- Real-time speedup ratio with stacked bar chart, source viewer toggle

### Solar System Simulation (C++ OOP + WASM)
- 9-body N-body gravity (G=1, M_sun=10, correct circular orbital velocities)
- 3-pass WebGPU pipeline: procedural starfield/nebula bg, instanced line-strip orbital trails with age fade, instanced SDF planet quads with sun bloom
- Canvas2D fallback when WebGPU unavailable

### CLI Terminal
- Commands: help, whoami, about, skills, projects, contact, ls, cat, echo, date, clock, scroll, uptime, pwd, banner, neofetch, sudo, 42, mit, wasm, solar, clear, exit
- Up/down history, tab auto-completion, copy-output button, sound effects

### Sound Engine (Web Audio API)
- Ambient drone (4 oscillators + LFO), looping melody, boot/shutdown jingles
- Click blips, command beeps, sound toggle button
- AudioContext suspends on page hide (visibilitychange)

### Other Visual Effects
- Cursor glow, click burst particles, global CSS text glitch
- Theme switcher (cyber / matrix / synthwave), keyboard shortcuts menu
- Scroll progress bar, section reveal, breadcrumb dots, section counter
- Console ASCII art, dynamic page title, toast, scroll-to-top, ping indicator

---

## Deployment (Cloudflare Pages)

- WASM files organized into `public/wasm/` so Vite copies them to `dist/wasm/`
- `public/_headers` serves `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (enables SharedArrayBuffer / cross-origin isolation)
- Fetch paths updated: `/wasm/portfolio.wasm`, `/wasm/solarsystem.wasm`

## Mobile Optimizations

- `useIsMobile` hook detects touch via `matchMedia('(pointer: coarse)')`
- Scene3D: 600→150 particles, skips orbiting shapes / helix / stars / floating solids on mobile
- WasmTerrain: terrain updates every 8 frames instead of 4, wireframe + normals + colors skipped
- Desktop-only overlays hidden: CursorGlow, ClickParticles, GlobalGlitch, KeyboardShortcuts, FpsMonitor
- WebGPU demo canvas dpr clamped to 2
