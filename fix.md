# Project Codebase Audit & Fix List

## Executive Summary

The codebase is a React 19 + Three.js portfolio with 34 source files. It uses Vite + Tailwind v4 + Framer Motion + GSAP + R3F. Overall code quality is high — well-structured components with consistent cyberpunk/terminal aesthetic. The audit identified **3 critical bugs**, **7 performance/logic issues**, **9 UI/UX quirks**, and **12 cleanup items**. The most impactful issues are: `handleEnter` cleanup leak in SplashScreen, `playBoot()` bypassing the mute guard, and ScrollToTop + SoundToggle position overlap.

---

## 🚨 Critical Bugs & Layout Breakers

### [src/components/SplashScreen.jsx:140-146] — `handleEnter` returns cleanup from `useCallback` (dead code + potential timeout leak)
- **Code**: `const handleEnter = useCallback(() => { enableSound(); playBoot(); setFading(true); const t = setTimeout(onFinish, 700); return () => clearTimeout(t) }, [onFinish])`. The `return () => clearTimeout(t)` inside `useCallback` is never invoked — `useCallback` ignores the return value of the callback function. The timeout `t` is never cleaned up if `handleEnter` fires multiple times.
- **Impact**: The timeout `t` can fire `onFinish` after the component unmounts (stale setState), or after the user has already started interacting. Not crash-level, but wastes cycles and triggers setState on unmounted component.
- **Suggested Fix**: Remove the `return` statement: `clearTimeout(t)` instead of `return () => clearTimeout(t)`.

### [src/components/SoundEngine.jsx:115-145] — `playBoot()` lacks `_enabled` guard
- **Code**: `export function playBoot() { try { const c = getCtx() ... } catch {} }` — unlike `playBlip`, `playCommand`, and `playShutdown`, there is no `if (!_enabled) return` at the top of `playBoot()`.
- **Impact**: If sound is toggled OFF and the user triggers a boot sequence (shutdown → restart, or resuming session), `playBoot()` plays through `masterGain` even when sound is disabled.
- **Suggested Fix**: Add `if (!_enabled) return` as the first line of `playBoot()`.

### [src/components/ScrollToTop.jsx:22 + src/components/SoundEngine.jsx:196] — ScrollToTop and SoundToggle occupy the same fixed position (`bottom-3 right-3 z-[999]`)
- Both components render at `bottom-3 right-3 z-[999]`. When ScrollToTop is visible (scrolled past 400px), it renders directly on top of SoundToggle, making the sound button inaccessible.
- **Suggested Fix**: Shift ScrollToTop to `bottom-14 right-3` (above SoundToggle), or shift SoundToggle to `left-3` and keep ScrollToTop on the right.

---

## ⚠️ Performance & Logic Improvements

### [src/components/Hero.jsx:5-40] — `MatrixRain` canvas resize listener lacks debouncing
- The raw `resize` handler (line 35) fires on every resize event with no debounce, recreating canvas dimensions on every frame of a window drag. Combined with `requestAnimationFrame`, this floods the GPU with canvas resets.
- **Suggested Fix**: Wrap the resize handler with `clearTimeout`/`setTimeout` debounce (200ms), similar to the pattern used in SplashScreen's `ParticleBg`.

### [src/components/WasmTerrain.jsx:62-80] — `useEffect` dependency `[ready]` creates misleading dependency pattern
- The effect sets `ready` inside its own body (line 77: `if (!ready) setReady(true)`). The `[ready]` dep array means the effect re-runs when `ready` becomes true (second run — a no-op due to `!ready` guard and worker.onmessage re-assignment). This is technically safe but confusing and violates the principle that effects shouldn't write to their own deps.
- **Suggested Fix**: Remove `ready` from the dependency array (`[]`) and rely on the `mounted` flag and the `onmessage` callback. Or use a ref-based ready flag.

### [src/components/GlobalGlitch.jsx:46-65] — Cache is never refreshed after initial mount
- `refreshCache()` queries the DOM once on mount. If new elements are added dynamically (e.g., after splash screen dismissal, WASM section expansion, source code toggle), they are never considered for glitching until the component re-mounts.
- **Suggested Fix**: Add a `MutationObserver` that calls `refreshCache()` when new nodes are added, or periodically refresh the cache every 30 seconds.

### [src/components/Scene3D.jsx:348-352] — `_mouseX`/`_mouseY` window globals accumulate listeners on Strict Mode double-mount
- In React Strict Mode (dev), the `useEffect` runs → cleanup → runs again. The first cleanup calls `removeEventListener` (ok). But two `raf` loops may be active if the cleanup's `cancelAnimationFrame` doesn't cancel the correct one — the closure captures the second `raf` ID but the first `raf` is never cancelled. On HMR, this can accumulate.
- **Suggested Fix**: Use a single ref for the raf ID, and cancel it in both the cleanup and before a new assignment: `cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(...)`.

### [src/components/ShutdownScreen.jsx:33] — `doneRef.current = true` is set redundantly
- Line 33 sets `doneRef.current = true` in the timeout callback, but the cleanup also sets `doneRef.current = true` when the effect re-runs. This is harmless but redundant — the ref starts at `false` and the only guard is `if (doneRef.current) return` in the animation loop. One assignment suffices.
- **Suggested Fix**: Remove the redundant `doneRef.current = true` from the cleanup or from the timeout callback.

### [src/components/SplashScreen.jsx:158] — `handleEnter` event listeners don't exclude the auto-timeout from double-firing
- Line 155: `const fb = setTimeout(handleEnter, 8000)` — when this fires, `handleEnter` plays boot sound and starts fade. But the `keydown`/`click` listeners (registered with `{ once: true }`) may still fire (user clicks/keypresses within the 8s window), causing `handleEnter` to execute again, re-playing boot audio and re-triggering the fade. The `{ once: true }` mitigates this, but the timeout itself is not guarded against double-invocation.
- **Suggested Fix**: Use a ref guard (`enteredRef.current`) that `handleEnter` checks and sets at its top, with the timeout also respecting it.

---

## 🎨 UI/UX & CSS Quirks

### [src/components/ShowcaseWall.jsx:61-74] — Flip card backface is not properly bounded
- The `.eng-card` parent has `overflow: hidden` (from `index.css:38`). When the card flips to show the backface (containing full description text), `overflow: hidden` clips the content that extends beyond the card bounds. The backface is positioned `absolute; inset: 0` but text can overflow.
- **Suggested Fix**: Set `overflow: visible` on the card when flipped, or use a fixed height/scroll for the backface pane.

### [src/components/Toast.jsx] — Toast at `bottom-16 left-3` may overlap with SoundToggle/GlitchToggle on mobile
- Toast sits at `bottom-16 left-3`, SoundToggle at `bottom-3 right-3`, GlitchToggle at `bottom-3 right-[104px]`. On viewports below 320px, the gap narrows and left/right overlap is possible. Also on landscape mobile, bottom-16 + bottom-3 elements may visually stack.
- **Suggested Fix**: Make Toast dismissible on click, or move it to the top-right area.

### [src/index.css:143-146] — Sections start at `opacity: 0` — visible FOIC (Flash of Invisible Content) on slow connections
- `section[id] { opacity: 0; transform: translateY(20px); }` relies on `SectionReveal` JS to add `.section-revealed`. If React hydration is delayed (slow WASM download, blocked main thread), the user sees a blank page for longer than necessary.
- **Suggested Fix**: Keep `opacity: 1` as default and use an `animate` class to trigger the fade-in after JS loads, or reduce the initial transform/opacity severity.

### [src/index.css:114-121] — `.scanlines::after` sits above most content but below overlays
- Currently `z-index: 50` (after fix). The navbar is `z-50`. The scanline overlay and navbar compete for the same z-index layer. On browsers that don't handle z-index stacking contexts well, the scanlines may obscure navbar text.
- **Suggested Fix**: Lower scanlines to `z-40` or ensure navbar is in a higher stacking context via `isolation: isolate`.

### [src/components/Navbar.jsx:89-91] — "G" logo link targets `#hero` but hero is not tracked by `IntersectionObserver`
- The `<a href="#hero">` navigates to the hero section, but the `sectionIds` array (derived from `links`) does not include `'hero'`. The `IntersectionObserver` never observes the hero section, so the nav never displays "active" for the hero/top-of-page state.
- **Impact**: When scrolled to the top (hero section), no nav link is highlighted. The "active" state is empty/default.
- **Suggested Fix**: Add `{ label: '_hero', href: '#hero', section: 'hero' }` to the `links` array (and optionally hide it in the desktop nav).

### [src/index.css] — `font-family` declared on both `@theme --font-mono` and `body` without using the theme variable on body
- `--font-mono` is the theme-level variable, but `body` hardcodes `font-family: 'JetBrains Mono', 'Fira Code', monospace`. The theme token isn't used.
- **Suggested Fix**: Add `font-family: var(--font-mono)` or set it via the `@theme` directive.

### [src/components/Hero.jsx:12] — MatrixRain canvas ignores devicePixelRatio
- `canvas.width = window.innerWidth` sets canvas size in CSS pixels, not physical pixels. On Retina/HiDPI displays, the canvas renders at lower resolution, appearing blurry.
- **Suggested Fix**: Multiply by `window.devicePixelRatio`: `canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; ctx.scale(dpr, dpr)`.

### [src/components/Contact.jsx:16-28] — `SocialIcon` uses a switch with inline SVGs
- Adding a new social link requires both modifying the `socials` array and adding a `case` to the switch. This is brittle and repetitive.
- **Suggested Fix**: Either store the SVG path data in the socials array, or use a Map/object lookup, or extract SVGs to separate icon components.

### [src/components/WebGPUDemo.jsx] — WebGPU fallback not user-visible
- If WebGPU is unavailable (older browsers, unsupported GPUs), the demo silently fails with only a console error (`console.error('WebGPU not available')`). The canvas remains blank with no user-facing message.
- **Suggested Fix**: Show a fallback message or badge directly in the component UI.

---

## 🧹 Refactoring & Clean Code

### [src/components/GlitchText.jsx] — Entire component is dead code (never imported)
- `src/components/GlitchText.jsx` exports a `GlitchText` component but it is never imported anywhere in the codebase. The `Hero.jsx` component defines its own local `GlitchText` function, which is the one actually used.
- **Suggested Fix**: Delete `src/components/GlitchText.jsx`.

### [src/index.css:109-112] — `.random-glitch` CSS class is never used in any JSX
- The `random-glitch` class and its `@keyframes randomGlitch` animation are defined but never applied to any element in JSX. Dead code.
- **Suggested Fix**: Remove the `.random-glitch` class and `@keyframes randomGlitch` block, or add it to a component if the effect is desired.

### [src/index.css:98] — `.glitch:hover` class is never used in JSX
- The `glitch` class is defined with `:hover` animation but never applied to any element. Dead code.
- **Suggested Fix**: Remove or add to intended components.

### [src/components/SplashScreen.jsx] — `Clock` component duplicated in Navbar.jsx
- Both `SplashScreen.jsx:160-165` and `Navbar.jsx:15-27` define their own `Clock` components with identical logic. The SplashScreen version is simpler (no date), but the pattern is duplicated.
- **Suggested Fix**: Extract to a shared `src/components/Clock.jsx` or inline the simpler version.

### [src/lib/shutdown.js:1] — Imports from `../components/SoundEngine` inverts dependency direction
- `shutdown.js` is in `lib/` but imports from `components/`. Standard convention has `lib/` as a leaf dependency layer with no imports from `components/`. This circular-looking pattern could cause issues with barrel exports or testing.
- **Suggested Fix**: Move the `disableSound` call to the effect handler in `App.jsx` or extract sound state management into a hook in `hooks/`.

### [src/main.jsx:12-18] — Module-level event listeners can accumulate with HMR
- `document.addEventListener('click', ...)` at module scope. With hot module replacement, each HMR cycle registers a new listener without removing the old one (the module is re-executed but no cleanup code runs). Over 10+ HMR cycles, listeners accumulate and the `scroll`/`click` handlers fire multiple times.
- **Suggested Fix**: Use a single effect in App that manages the smooth-scroll class, or add `{ once: true }` to the click handler.

### [src/components/WasmDemo.jsx:21-27] — `load()` module-level WASM cache races against concurrent calls
- `let wasm = null` at module scope. If `load()` is called concurrently (e.g., when `run()` and the initial `useEffect` both call `load()`), both see `wasm == null` and both initiate `fetch()`. The second fetch resolves and overwrites the module, but the first fetch's instantiation is wasted.
- **Suggested Fix**: Use a promise-based cache: `let wasmPromise = null; function load() { if (!wasmPromise) wasmPromise = fetch(...).then(...); return wasmPromise }`.

### [src/components/Terminal.jsx] — `cmdHistory` array grows unbounded
- Every command entered appends to `cmdHistory` with no limit. A user entering hundreds of commands leaks memory.
- **Suggested Fix**: Cap history at 100 entries: `setCmdHistory(prev => [...prev.slice(-99), trimmed])`.

### [src/components/SoundEngine.jsx:5-8] — Module-level mutable state (`_enabled`, `droneNodes`, etc.) is fragile in concurrent React
- Module-level variables (`_enabled`, `ctx`, `droneNodes`, `melodyInterval`) are shared across all component instances and don't participate in React's lifecycle. In concurrent mode or with suspense boundaries, these can become stale or out of sync with the actual state.
- **Suggested Fix**: Use a store (Zustand/context) or at minimum use ref-based singletons with proper cleanup. The `SoundToggle` component's `on` state can also drift from `_enabled` if other code calls `enableSound()`/`disableSound()` directly.

### [src/components/ErrorBoundary.jsx:10-12] — `getDerivedStateFromError` captures only `error.toString()` — stack might be lost
- `getDerivedStateFromError` receives the error object but only stores `error.toString()` in state. The original error object's stack and additional properties are not preserved. The `componentDidCatch` also logs but doesn't store the full error info.
- **Suggested Fix**: Store the error object directly and access `.message` and `.stack` in render.

### [src/components/SectionReveal.jsx] — No deps on `useEffect` — may miss dynamically added sections
- The effect runs once on mount, querying all `section[id]` elements at that time. If sections are added dynamically (conditional rendering, lazy loading), they are never observed.
- **Suggested Fix**: Use a `MutationObserver` on the container element, or re-run the effect when layout changes (difficult without a trigger).
