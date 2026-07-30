# Project Codebase Audit & Fix List

## Executive Summary

The codebase is a React 19 + Three.js portfolio with 34 source files. The previous audit cycle fixed 2 critical bugs (ConfettiBurst ReferenceError, SoundEngine module-level side effects) and addressed 20+ medium issues. This fresh audit identifies **2 new critical bugs** (shutdown effect cascade and SplashScreen Strict Mode breakage), **7 medium-severity issues**, and **15+ low-severity/cleanup concerns**. The most impactful fixes needed are memoizing `onClose` to un-break the shutdown flow and removing the `started` ref guard in SplashScreen.

---

## 🚨 Critical Bugs & Layout Breakers

### [src/App.jsx:63 + src/components/ShutdownScreen.jsx:22-27] — Inline `onClose` prop causes shutdown effect to restart on every scroll
- **Code**: App renders `<ShutdownScreen onClose={() => { setClosing(false); setShutdown(false); setBooted(false) }} />`. The inline arrow is recreated on every render. `ShutdownScreen`'s `useEffect` depends on `[onClose]`. Every scroll (which updates `scrollP` state) triggers App re-render → new `onClose` → effect cleanup (clears all timers, stops animation) → effect re-run (calls `playShutdown()` again, reschedules all line-printing timeouts from scratch).
- **Impact**: The shutdown sequence **never completes** — timers keep resetting, overlapping audio plays, `onClose` is never called. User is trapped on the shutdown screen.
- **Suggested Fix**: Wrap `onClose` in `useCallback` with empty deps, or remove `onClose` from `ShutdownScreen`'s `useEffect` dependency array. Alternatively, pass `onClose` via a ref or a stable context.

### [src/components/SplashScreen.jsx:124-140] — `started` ref breaks boot sequence in React Strict Mode
- **Code**: `const started = useRef(false)` guards the boot-timer effect. In React Strict Mode (dev only), effects mount → cleanup → mount again. Run 1: `started.current = false` → proceeds, starts boot, sets `started.current = true`. Cleanup: `clearTimeout(bootTimer)` — **cancels the boot sequence**. Run 2: `started.current = true` → returns early (no cleanup returned). Result: boot sequence is permanently dead, splash never progresses.
- **Impact**: In dev mode (Strict Mode enabled), the splash screen freezes on the first boot message indefinitely. User never reaches the portfolio.
- **Suggested Fix**: Remove the `started` ref entirely. A `mountedRef` or the effect's own cleanup is sufficient and correct.

### [src/components/SplashScreen.jsx:37-41] — `ParticleBg` resize listener leaked
- **Code**: Line 41 adds `window.addEventListener('resize', resize)` but the cleanup (line 82-83) only removes the debounced version `debouncedResize`. The raw `resize` handler persists.
- **Impact**: Each mount of `ParticleBg` leaks one `resize` listener + one `resize` closure. Accumulates with HMR.
- **Suggested Fix**: Remove the raw `resize` listener (line 41); the debounced version at line 82 handles resizes adequately.

### [src/components/SoundEngine.jsx:115-177] — `playBoot` and `playShutdown` bypass mute
- **Code**: Both functions connect audio directly to `c.destination` instead of `masterGain`. `playShutdown` has no `_enabled` check.
- **Impact**: Boot and shutdown sounds play even when the user has explicitly toggled sound OFF. The shutdown sound plays during every effect re-run (see above), creating overlapping noise.
- **Suggested Fix**: Route through `masterGain` and add `if (!_enabled) return` to `playShutdown`.

---

## ⚠️ Performance & Logic Improvements

### [src/App.jsx:36] — `scrollP` state update re-renders entire tree on every scroll
- Every scroll frame updates `scrollP`, causing all children to re-render. Most children (Navbar, Hero, About, etc.) don't use `scrollP` at all.
- **Suggested Fix**: Move `scrollP` to a `useRef` or a fine-grained state solution. Only pass it to `Scene3D`.

### [src/App.jsx:66-69] — 3D Canvas renders during SplashScreen (wasted GPU)
- `<Canvas>` with `Scene3D` renders continuously behind the fully opaque splash screen. All 3D work is discarded.
- **Suggested Fix**: Conditionally render `<Canvas>` only when `booted` is true, or wrap in `<Suspense>` with a lazy import.

### [src/components/Navbar.jsx:62] — `offsetTop`/`offsetHeight` forces layout reflow on every scroll
- `el.offsetTop` and `el.offsetHeight` force synchronous layout recalculation on every scroll event. On low-end devices this causes visible jank.
- **Suggested Fix**: Use `getBoundingClientRect()` or switch to `IntersectionObserver` for section-tracking.

### [src/components/Scene3D.jsx:6] — Module-level `frameObj` is shared across all instances
- `const frameObj = { current: 0 }` at module scope. If React mounts two `Scene3D` instances (Strict Mode double-mount, portal, concurrent mode), they share and corrupt the frame counter.
- **Suggested Fix**: Move `frameObj` into a `useRef` inside the `Scene3D` parent component and pass it down via a context or callback.

### [src/components/SoundEngine.jsx:34-38] — LFO overmodulation causes audio distortion
- `lfoG.gain.value = 2` modulates a gain param starting at `0.02` by ±2, producing effective range `[-1.98, 2.02]`. Values above 1 clip, values below 0 are silent.
- **Suggested Fix**: Reduce LFO amplitude to `0.02`–`0.05` for a subtle tremolo effect.

### [src/components/Hero.jsx:45-49] — `GlitchText` interval uses fixed random, not per-cycle random
- `Math.random()` is called once when the effect mounts, producing a constant interval (e.g., always 4217ms). The glitch timing is deterministic after mount.
- **Suggested Fix**: Use recursive `setTimeout` for true random-variable timing, or accept the fixed interval.

### [src/components/GlobalGlitch.jsx:9-25] — Full-DOM `querySelectorAll` on every glitch burst
- `pickElements` calls `document.querySelectorAll(tag)` for each of 9 tags (h1-h6,p,span,a,button) every 3–5 seconds, then walks DOM for each candidate. On pages with hundreds of elements, this is unnecessary DOM work.
- **Suggested Fix**: Cache the query results and refresh only periodically (e.g., every 30 seconds), or use a `MutationObserver` to update the cache.

### [src/components/WasmTerrain.jsx:6-9] — `_worker` is shared across all instances (module-level)
- If the component is mounted twice, the worker is shared. Concurrent `postMessage` calls could interleave responses.
- **Suggested Fix**: Move `_worker` into a `useRef` inside the component.

### [src/components/Scene3D.jsx:299] — `linewidth` ignored by WebGL
- `<lineBasicMaterial linewidth={2} />` — WebGL implementations universally ignore `linewidth > 1`. Renders at width 1 on all major GPUs.
- **Impact**: Visual — the line renders thinner than intended.
- **Suggested Fix**: Use a TubeGeometry-based approach or accept the limitation.

### [src/components/WasmDemo.jsx:108] — WASM call result not typed
- `wsR = w[t.wasmFn](t.arg)` — the return type is unvalidated. If the WASM export returns a non-number or throws, the downstream `spd = jsT / wsT` produces `NaN` or `Infinity`.
- **Suggested Fix**: Coerce result to number and guard against division by zero.

---

## 🎨 UI/UX & CSS Quirks

### [src/index.css:143-146] — `section[id]` opacity: 0 kills all sections if SectionReveal fails
- All sections start at `opacity: 0; transform: translateY(20px)`. If `SectionReveal.js` fails to load or execute, every section is forever invisible.
- **Suggested Fix**: Add a fallback: `section[id] { opacity: 1; }` as a base and rely on JS to add a class that triggers the animation. Or use `@supports` with `animation` detection.

### [src/index.css:40-56] — `.eng-card::before` gradient border renders differently across browsers
- `-webkit-mask-composite: xor` and `mask-composite: exclude` are not equivalent. The order gives one precedence. On Firefox, `mask-composite: exclude` is unsupported, so the gradient pseudo-element may render as a solid overlay.
- **Note**: A `@supports not (mask-composite: exclude)` fallback was added, but it disables the glow entirely on Firefox.

### [src/index.css:114-121] — `.scanlines::after` sits at z-index 9998, blocking overlays
- The scanline overlay covers the full viewport at `z-index: 9998`. Any overlay/modal/tooltip needs `z-index > 9998` to appear above it.
- **Suggested Fix**: Document or reduce to `z-index: 50`.

### [src/index.css] — No `prefers-reduced-motion` queries
- All animations (glitch, float, gradSpin, blink, ggFlicker) run unconditionally. Users with vestibular disorders get no respite.
- **Suggested Fix**: Wrap animations in `@media (prefers-reduced-motion: no-preference)`.

### [src/components/Scene3D.jsx:74-77] — "Ghost" icosahedron at `opacity: 0.02` is practically invisible
- `<meshBasicMaterial color="#3b82f6" transparent opacity={0.02} />` — effectively invisible on most displays.
- **Suggested Fix**: Remove or raise to `0.08`–`0.12` if intended as a subtle halo.

### [src/components/Navbar.jsx:135-139] — Mobile menu items lack active background highlight
- Desktop nav gets `bg-[#1e293b]/70` when active; mobile links only change text color. Visual inconsistency.
- **Suggested Fix**: Apply the same background style to mobile active links.

### [src/components/Hero.jsx:39] — MatrixRain may be invisible on dim screens
- CSS `opacity-10` (0.1) combined with canvas `globalAlpha: 0.2` and `fillStyle: 'rgba(8,12,20,0.05)'` makes the rain extremely faint.
- **Suggested Fix**: Raise to `opacity-20` or increase `globalAlpha`.

### [src/components/SplashScreen.jsx:188] — Banner text at 3px unreadable on standard-density screens
- `<pre className="text-[3px] ...">` — ASCII art renders as a tiny blue blur on non-retina displays.
- **Suggested Fix**: Use a minimum of `6px` or render as a pre-styled image.

### [src/components/SplashScreen.jsx:194] — `h-0` CSS transition doesn't animate
- CSS cannot transition `height` between `0` and `auto`. `transition-all` only applies to opacity; the height toggle is instantaneous.
- **Suggested Fix**: Remove `transition-all` and rely on opacit-only transition, or use a max-height approach.

### [src/components/SoundEngine.jsx:197-212] — SoundToggle and GlitchToggle may overlap on narrow viewports
- SoundToggle: `left-3` (≈12px). GlitchToggle: `left-[108px]`. Content-dependent widths can cause overlap below 320px.
- **Suggested Fix**: Use a responsive layout or `right` positioning.

---

## 🧹 Refactoring & Clean Code

### Dead/unused exports
- **`src/components/SoundEngine.jsx:179-181`**: `playClick()` is exported but never imported anywhere in the codebase.

### Unused variables
- **`src/components/Hero.jsx:71`**: `cursor` is created with `useState` and updated via `setInterval` but only used for the blinking underscore. Could be simplified with a CSS animation.
- **`src/lib/shutdown.js:17`**: Import order — `disableSound` imported from `'../components/SoundEngine'` inverts the usual `components/ → lib/` dependency direction.

### Import convention issues
- **`src/main.jsx:12-18`**: Module-level event listeners (`click`, `scroll`) are registered with no cleanup. In an SPA this is acceptable, but with HMR they accumulate.
- **`src/components/WasmTerrain.jsx:11-13`**: `let _worker = null` at module level is shared state. Should be a component-level ref.

### Redundant code
- **`src/components/Hero.jsx:130`**: `clearTimeout(id); clearInterval(id)` called on every timer ID. In browsers these functions accept any timer type, so one call suffices.
- **`src/components/ShutdownScreen.jsx:27`**: `doneRef.current = true` set in both the timeout callback and the effect cleanup. One is redundant.
- **`src/components/SplashScreen.jsx:126`**: `started` ref is unnecessary — the effect's own cleanup correctly handles re-mounts.

### Code organization
- **`src/components/SoundEngine.jsx`**: Named `SoundEngine.jsx` but the default export is `SoundToggle` (a UI button). The file mixes utility exports (`playBlip`, `playBoot`, etc.) with a UI component. Consider splitting.
- **`src/components/GlobalGlitch.jsx`**: Exports both `GlobalGlitch` (default) and `GlitchToggle` (named). Two UI components in one file.

### Data design
- **`src/components/Terminal.jsx`**: `cmdHistory` array grows unbounded. A user typing hundreds of commands leaks memory.
- **`src/components/Contact.jsx`**: `SocialIcon` uses a `switch` statement with inline SVG paths. Adding a social link requires modifying the switch.

### CSS cleanup
- **`src/index.css`**: `.pulse-slow`, `.random-glitch`, `.glitch-active`, `.glitch` — verify these classes are still referenced in JSX or remove.
- **`src/index.css`**: `font-family` declared on both `@theme --font-mono` and `body` — duplication.

### GSAP-specific
- **`src/components/ScrollProgress.tsx:22`**: `ctx.revert()` may not fully kill `ScrollTrigger` instances in older GSAP. Prefer `ctx.kill()` for safety.

---

## Summary of Priority Fix Order

| Priority | File | Issue |
|----------|------|-------|
| 🔴 P0 | App.jsx + ShutdownScreen | Inline `onClose` causes infinite shutdown reset loop |
| 🔴 P0 | SplashScreen.jsx | `started` ref breaks boot in Strict Mode |
| 🔴 P0 | SplashScreen.jsx | Leaked resize listener in ParticleBg |
| 🟡 P1 | SoundEngine.jsx | `playShutdown`/`playBoot` bypass mute |
| 🟡 P1 | SoundEngine.jsx | LFO overmodulation causes audio clipping |
| 🟡 P1 | App.jsx | `scrollP` causes full tree re-render |
| 🟡 P1 | App.jsx | 3D Canvas renders behind SplashScreen (wasted GPU) |
| 🟡 P1 | Navbar.jsx | `offsetTop`/`offsetHeight` layout thrashing on scroll |
| 🟢 P2 | Scene3D.jsx | Module-level `frameObj` shared across instances |
| 🟢 P2 | GlobalGlitch.jsx | Full-DOM query on every burst |
| 🟢 P2 | Hero.jsx | `GlitchText` interval not per-cycle random |
| 🟢 P2 | Scene3D.jsx | `linewidth` ignored by WebGL |
