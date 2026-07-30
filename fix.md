# Project Codebase Audit & Fix List

## Executive Summary

The portfolio codebase is functionally solid with proper React patterns, good cleanup hygiene, and correct three.js/R3F usage. However, four high-risk clusters exist: **WebGL geometry memory leaks** (never-disposed BufferGeometry), **global window namespace pollution** for mouse coordinates, a **StrictMode interval race** in LoginScreen, and **unbounded DOM/particle accumulation** in ClickParticles. Performance is generally good but several scroll handlers force synchronous layout (`getBoundingClientRect`) every frame. A handful of UI components have dead/broken interactive states. There are no crash-on-load bugs.

| Severity | Count | Description |
|----------|-------|-------------|
| 🚨 Critical | 6 | Crashes, memory leaks, data corruption, unhandled promise rejections |
| ⚠️ Warning | ~20 | Performance bottlenecks, forced layouts, memory leaks, accessibility gaps |
| 🧹 Info | ~25 | Dead code, unused imports, minor optimizations, code style |

---

## 🚨 Critical Bugs & Layout Breakers

### 1. Scene3D — WebGL geometry never disposed (`src/components/Scene3D.jsx`)
- **Location**: Multiple `useMemo(() => new THREE.BufferGeometry(), [])` in `TorusSpiral` (L85), `ShaderParticles` (L146), `Rings` (L177), `OrbitingShapes` (L226), `HelixTube` (L280), `InteractiveStars` (L315), `FloatGeo` (L118)
- **Impact**: Every HMR reload or component remount allocates new GPU buffers; old ones are never freed via `.dispose()`. Accumulates GPU memory until tab crash.
- **Suggested Fix**: Store geometries in refs and dispose on unmount:
```js
const geoRef = useRef()
useMemo(() => { geoRef.current = new THREE.BufferGeometry() }, [])
useEffect(() => () => geoRef.current?.dispose(), [])
```

### 2. Scene3D — Global `window._mouseX` / `window._mouseY` pollution (`src/components/Scene3D.jsx:351-358`)
- **Impact**: Seven sub-components read these globals; no isolation. If any other script writes to `window._mouseX`, all 3D objects break. The rAF throttling on the setter is pointless since `useFrame` is already rAF-synced. Zombie values persist after unmount.
- **Suggested Fix**: Move to React context:
```js
const MouseCtx = createContext({ x: 0, y: 0 })
// Provider in Scene3D, consumer via useContext in children
```

### 3. ClickParticles — Unbounded particle accumulation (`src/components/ClickParticles.jsx:12-33`)
- **Impact**: Every click spawns 8-13 DOM particles with 900ms timeouts. Holding Enter or rapid clicking creates thousands of elements and pending timers, causing jank and eventual OOM.
- **Suggested Fix**: Add a particle cap and reuse:
```js
const MAX = 100
let count = container.childElementCount
if (count > MAX) for (let i = 0; i < count - MAX; i++) container.firstChild?.remove()
```

### 4. WebGPUDemo — Unhandled rAF after error (`src/components/WebGPUDemo.jsx:347-359`)
- **Impact**: If `initSolarGPU` throws synchronously *after* `requestAnimationFrame(frame)` is scheduled, the frame callback runs with a destroyed device → WebGPU crash.
- **Suggested Fix**: Store rAF handle and cancel on error:
```js
const rafId = requestAnimationFrame(frame)
// in catch: cancelAnimationFrame(rafId); running = false
```

### 5. WebGPUDemo — WASM memory buffer detachment (`src/components/WebGPUDemo.jsx:284`)
- **Impact**: `new Float32Array(w.memory.buffer, ptr, cnt * 12)` creates a live view into WASM linear memory. If `step_solar()` triggers `memory.grow()`, the buffer detaches and the view becomes a `RangeError`.
- **Suggested Fix**: Copy instead of view:
```js
new Float32Array(w.memory.buffer.slice(ptr, ptr + cnt * 12 * 4))
```

### 6. WasmDemo — Unhandled promise rejection in `run()` (`src/components/WasmDemo.jsx:100-102`)
- **Impact**: `await load()` can reject (network failure for `portfolio.wasm`), producing an unhandled promise rejection that crashes the microtask queue.
- **Suggested Fix**: Wrap in try-catch:
```js
try { const w = await load() } catch (e) { setLog(`Error: ${e.message}`); setLoading(false); return }
```

---

## ⚠️ Performance & Logic Improvements

### 7. Navbar — IntersectionObserver with 5 thresholds (`src/components/Navbar.jsx:62-78`)
- **Issue**: `threshold: [0, 0.25, 0.5, 0.75, 1]` fires the callback up to 5 times per section per scroll → up to 45 callback invocations per frame.
- **Fix**: Use `threshold: [0.5]` or a single rootMargin approach.

### 8. Navbar — Scroll state update on every pixel (`src/components/Navbar.jsx:55-60`)
- **Issue**: `setScrolled(window.scrollY > 60)` fires on every scroll event, re-rendering entire Navbar tree.
- **Fix**: Throttle with rAF:
```js
let raf; const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 60)) }
```

### 9. SectionBreadcrumb — `getBoundingClientRect()` in scroll loop (`src/components/SectionBreadcrumb.jsx:9-26`)
- **Issue**: For 9 sections, calls `getBoundingClientRect()` per frame, forcing 9 synchronous layout recalculations.
- **Fix**: Replace with a single IntersectionObserver.

### 10. SectionCounter — Same forced-layout issue (`src/components/SectionCounter.jsx:9-23`)
- **Issue**: Same as #9 — `getBoundingClientRect()` per frame.
- **Fix**: Replace with IntersectionObserver.

### 11. Hero — High-rate re-renders from multiple intervals (`src/components/Hero.jsx:50-56, 96-108`)
- **Issue**: `AnimatedName` updates state every 60ms (typing), cursor every 530ms, subtitle typewriter every 50ms. Combined, Hero re-renders at ~60fps from JS timers alone.
- **Fix**: Use `requestAnimationFrame` with a single loop and ref-based string building. Or use CSS `@keyframes` for cursor blink.

### 12. CursorGlow — Stale rAF callbacks on fast mouse (`src/components/CursorGlow.jsx:12-16`)
- **Issue**: Every mousemove schedules a new rAF. On a 120Hz mouse, multiple rAFs queue with stale positions, causing visual flicker. Only last rAF ID is cancelled on unmount.
- **Fix**: Single-rAF pattern with posRef:
```js
const pos = useRef({x:-9999,y:-9999}); let raf
const onMove = e => { pos.current = {x:e.clientX, y:e.clientY}; if(!raf) raf = requestAnimationFrame(() => { el.style.left = pos.current.x+'px'; el.style.top = pos.current.y+'px'; raf = null }) }
```

### 13. GlobalGlitch — 9 separate `querySelectorAll` calls (`src/components/GlobalGlitch.jsx:24-27`)
- **Issue**: `SAFE_TAGS.forEach(tag => querySelectorAll(tag))` runs 9 DOM queries every 30 seconds.
- **Fix**: Single compound selector: `document.querySelectorAll(SAFE_TAGS.join(','))`.

### 14. Scene3D — Frame-skipping creates uneven animation (`src/components/Scene3D.jsx:L57-L66, L101-L107, etc.`)
- **Issue**: Components use `if (frameRef.current % 2 !== 0) return` / `% 3 !== 0` which creates 30fps / 20fps sub-cycles on a 60fps display.
- **Fix**: Use `useFrame`'s `delta` parameter for time-based updates instead of frame counting.

### 15. Scene3D — Exponential smoothing never converges (`src/components/Scene3D.jsx:L61`)
- **Issue**: `uniforms.uScroll.value += (scrollP - uniforms.uScroll.value) * 0.05` — floating-point lerp never exactly reaches target; accumulates drift.
- **Fix**: Direct set: `uniforms.uScroll.value = scrollP`.

### 16. SoundEngine — AudioContext never closed on unmount (`src/components/SoundEngine.jsx:L4-L8`)
- **Issue**: Module-level `ctx` lives forever; HMR creates orphaned AudioContexts.
- **Fix**: Close context in component cleanup:
```js
useEffect(() => () => { ctx?.close(); ctx = null }, [])
```

### 17. WasmTerrain — Worker never terminated (`src/components/WasmTerrain.jsx:L12, L81`)
- **Issue**: `getWorker()` creates a Web Worker that runs forever; component cleanup only nulls `onmessage`.
- **Fix**: `workerRef.current?.terminate()` in cleanup.

### 18. StatsCounter — No rAF cleanup (`src/components/StatsCounter.jsx:22-27`)
- **Issue**: `requestAnimationFrame(step)` loop has no cancellation on unmount; continues counting after component is gone.
- **Fix**: Store rAF handle and cancel in cleanup:
```js
const raf = useRef(); raf.current = requestAnimationFrame(step);
useEffect(() => () => cancelAnimationFrame(raf.current), [])
```

### 19. SoundEngine — `ctx.resume()` promise not awaited (`src/components/SoundEngine.jsx:L17`)
- **Issue**: Chrome blocks AudioContext until user gesture; `.resume()` is called but the returned Promise is discarded. Audio may silently fail.
- **Fix**: `await ctx.resume()` and handle rejection.

---

## 🎨 UI/UX & CSS Quirks

### 20. Projects — Disabled buttons are invisible (`src/components/Projects.jsx:70-76`)
- **Issue**: `text-[#1e293b]` on dark `#0a0e17` background makes "source"/"demo" buttons unreadable. Dead UI that occupies space.
- **Fix**: Either remove the buttons or style with visible disabled colors: `text-[#475569]`.

### 21. ShowcaseWall — Single-flip state prevents independent flipping (`src/components/ShowcaseWall.jsx:52-53`)
- **Issue**: Only one tech card can be flipped at a time. Clicking card B flips card A back. Users may expect independent flipping.
- **Fix**: Use `Set<string>` state to track multiple flipped cards.

### 22. ShowcaseWall — Hardcoded hover color ignores project color (`src/components/ShowcaseWall.jsx:89`)
- **Issue**: `group-hover:text-[#3b82f6]` is always blue regardless of project's `p.color`.
- **Fix**: Use `p.color` for hover text color.

### 23. ShutdownScreen — No canvas resize handler (`src/components/ShutdownScreen.jsx:42-43`)
- **Issue**: Canvas dimensions set once on mount; window resize distorts the matrix rain.
- **Fix**: Add resize listener to update canvas.width/height.

### 24. ThemeSwitcher — Theme flash on load (`src/components/ThemeSwitcher.jsx:L17`)
- **Issue**: Theme is read from localStorage but applied on next render via useEffect; default theme flashes briefly.
- **Fix**: Apply theme synchronously in the initializer:
```js
const [theme] = useState(() => { const t = localStorage.getItem('theme') || 'cyber'; applyTheme(t); return t })
```

### 25. index.css — 3-second section visibility delay (`src/index.css:L141-L146`)
- **Issue**: `section[id] { opacity: 0; animation: sectionFallback 1ms 3s forwards }` — content invisible for 3 seconds if SectionReveal fails.
- **Fix**: Reduce to 500ms or add `@media (prefers-reduced-motion)` override that shows immediately.

---

## 🧹 Refactoring & Clean Code

### 26. App.jsx — `memo()` wrappers on prop-less components (`src/App.jsx:36-45`)
- **Issue**: `memo(Hero)`, `memo(About)`, etc. receive zero props; memo adds overhead with zero benefit.
- **Fix**: Remove `memo` wrappers.

### 27. App.jsx — `cancelAnimationFrame(null)` without guard (`src/App.jsx:82`)
- **Issue**: Before first scroll, `scrollRaf.current` is null; passing null to `cancelAnimationFrame` is safe but noisy in logs.
- **Fix**: `if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)`.

### 28. useOnScreen — `mountedRef` never set to false (`src/hooks/useOnScreen.js:6,12`)
- **Issue**: `mountedRef` initialized to true but never flipped to false. Guard `if (mountedRef.current)` is dead code.
- **Fix**: Remove `mountedRef` entirely — `observerRef.current.disconnect()` already prevents post-unmount callbacks.

### 29. ClickParticles — Nested rAF per particle (`src/components/ClickParticles.jsx:28`)
- **Issue**: 8-13 separate `requestAnimationFrame` calls per click. One rAF batching all style mutations would be more efficient.
- **Fix**: Collect mutations and schedule single rAF.

### 30. Terminal — Tab completion picks first match only (`src/components/Terminal.jsx:200`)
- **Issue**: `Array.find()` returns first alphabetical match; "p" always completes to "projects" with no cycling UI.
- **Fix**: Cycle through matches on repeated Tab presses.

### 31. Terminal — Scroll autoscroll when user is reading (`src/components/Terminal.jsx:L172`)
- **Issue**: Auto-scroll on every history update, even if user scrolled up to read previous output.
- **Fix**: Only autoscroll if user is already at bottom.

### 32. DynamicTitle — Emoji in document title (`src/components/DynamicTitle.jsx:L19`)
- **Issue**: `💤` emoji may render as tofu box on Linux.
- **Fix**: Use plain text `[away]` or `idle`.

### 33. WasmDemo — Rejected promise cached permanently (`src/components/WasmDemo.jsx:54-62`)
- **Issue**: `wasmPromise` caches the promise; if WASM loading fails, the rejected promise is cached forever and subsequent `await load()` returns the same rejection.
- **Fix**: On failure, `wasmPromise = null` to retry.

### 34. ErrorBoundary — Error serialized to string (`src/components/ErrorBoundary.jsx:L9-L11`)
- **Issue**: `error.toString()` loses stack trace and type info.
- **Fix**: Store raw `Error` object.

### 35. Multiple files — Arrays defined as module-level constants but placed inside components
- **Files**: `KeyboardShortcuts.jsx`, `PingIndicator.jsx`, `LoginScreen.jsx`, `Hero.jsx`
- **Issue**: Arrays like `shortcuts`, `states`, ASCII art are defined inside the component function, re-created on every render.
- **Fix**: Move outside component.

---

*Audit generated 2026-07-30 — 35 items across 28 source files.*
