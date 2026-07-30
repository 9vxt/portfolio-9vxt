# Project Codebase Audit & Fix List

## Executive Summary

The codebase is a feature-rich React portfolio with 34 source files, heavy use of Three.js/WebGL, WebAudio, and canvas-based visual effects. Overall architecture is reasonable for a portfolio, but there are **2 critical runtime bugs**, **7 high-severity issues**, **16 medium-severity issues**, and **20+ low-severity concerns**.

The most dangerous issues are: (1) `ConfettiBurst.jsx` references an undeclared variable that throws a `ReferenceError` on mount, (2) `SoundEngine.jsx` has module-level side effects that auto-enable sound and register global click handlers on import, (3) `ErrorBoundary.jsx` silently swallows errors with no `componentDidCatch`, (4) `WebGPUDemo.jsx` leaks GPU devices on init failure, (5) Three dead component files that clutter the project.

---

## 🚨 Critical Bugs & Layout Breakers

### [src/components/ConfettiBurst.jsx:33] — Undeclared variable `frame` causes ReferenceError
- **Code**: `frame++` on line 33 references a variable never declared in this module.
- **Impact**: The component crashes at runtime on the first animation frame. The entire effect (canvas creation, confetti animation) never executes.
- **Suggested Fix**: Delete the unused `frame++` statement (the variable is never read), or declare `let frame = 0` inside the effect.

### [src/components/SoundEngine.jsx:183-186] — Module-level side effects on import
- **Code**:
  ```js
  if (typeof window !== 'undefined') {
    window.addEventListener('click', () => { if (_enabled) playClick() }, { passive: true })
    setTimeout(() => { if (!_enabled) enableSound() }, 5000)
  }
  ```
- **Impact**: Importing ANY export from SoundEngine.jsx registers a global click handler and auto-enables sound after 5 seconds. Users hear unexpected sounds. There is no opt-out. The 5-second auto-enable overrides any prior `disableSound()` call.
- **Suggested Fix**: Remove module-level side effects. Move the global click handler into the `SoundToggle` component's `useEffect`. Remove the auto-enable timeout or gate it behind explicit user interaction.

### [src/components/ErrorBoundary.jsx:1-40] — Missing `componentDidCatch` — errors silently swallowed
- **Code**: Only implements `getDerivedStateFromError` but never `componentDidCatch`.
- **Impact**: In production, caught errors display the fallback UI but are never logged to console or any error reporting service. Developers have zero visibility into what error occurred.
- **Suggested Fix**: Add `componentDidCatch(error, errorInfo) { console.error('[ErrorBoundary]', error, errorInfo) }`.

### [src/App.jsx:61] — `window.close()` silently fails
- **Code**: `onClose={() => { window.open('', '_self'); window.close() }}`
- **Impact**: `window.close()` only works for script-opened windows. In a main browser tab, it's ignored. The user sees the shutdown animation, then navigates to `about:blank` and gets stuck on a blank page.
- **Suggested Fix**: Replace with a "click to restart" button that reloads the page, or leave the shutdown screen as the final visual state.

### [src/components/Scene3D.jsx:170-201] — `Rings` uses `LineSegments` with continuous ring data
- **Code**: 81 vertices in a closed loop rendered with `<lineSegments>` (which treats vertices as disconnected pairs).
- **Impact**: The three orbital rings appear as broken dashed arcs instead of smooth circles.
- **Suggested Fix**: Replace with `<line>` + `LineLoop` material, or restructure the buffer as proper segment pairs (even vertex count).

### [src/components/WebGPUDemo.jsx:386-388] — GPU device leak on init failure
- **Code**: If WebGPU init fails after `device` is created, `.catch()` sets `supported = false` but never calls `device.destroy()`.
- **Impact**: Leaked GPU device wastes GPU memory. Repeated failures could exhaust browser device limits.
- **Suggested Fix**: Wrap `initSolarGPU` to always return a destroy function, or call `device.destroy()` in the catch block.

### [src/components/WebGPUDemo.jsx:377-439] — WebGPU and Canvas2D fallback can run simultaneously
- **Code**: Two render loops may overlap when WebGPU init fails mid-way.
- **Impact**: Two concurrent render loops waste CPU/GPU. Compounds the GPU device leak.
- **Suggested Fix**: Use a ref-based state machine to ensure only one render path is active at a time.

---

## ⚠️ Performance & Logic Improvements

### [src/components/SoundEngine.jsx:4-8] — Module-level mutable state unsafe for SSR/testing
- All audio state (`ctx`, `masterGain`, `_enabled`, `droneNodes`, etc.) lives at module scope. Persists across HMR reloads and between test cases. `AudioContext` creation will throw in SSR.
- **Fix**: Move state into a React context or a singleton class with proper lifecycle.

### [src/components/SoundEngine.jsx:24-40,188-212] — Drone oscillators never stopped on unmount
- `SoundToggle` has no `useEffect` cleanup to call `disableSound()`. Oscillators keep playing if the component unmounts.
- **Fix**: Add a cleanup effect in `SoundToggle` that calls `disableSound()`.

### [src/lib/shutdown.js:3-5] — Single-handler slot overwrites previous registrations
- `onShutdown(fn)` stores only one handler. If multiple components register, only the last one runs.
- **Fix**: Use a `Set` of handlers and return an unsubscribe function.

### [src/components/Scene3D.jsx:6] — Module-level `let frame = 0` creates tight coupling
- `IcosahedronShader` owns a module-level frame counter that 7 other sub-components read for frame skipping. If `IcosahedronShader` is ever removed, all animation pacing breaks.
- **Fix**: Each component should track its own frame counter via `useRef`.

### [src/components/Scene3D.jsx:56,100,117,154,182,245,290,323] — 8 separate `useFrame` hooks
- Every sub-component registers its own `useFrame` callback. 8 function calls per frame for scene updates.
- **Fix**: Consolidate into 1–2 `useFrame` hooks in the parent component using refs.

### [src/components/WasmTerrain.jsx:6-9] — Module-level singleton prevents multiple instances
- `worker`, `reqId`, `pendingId`, `cache` are module-level singletons. If the component remounts, the old `onmessage` handler persists.
- **Fix**: Move worker references into `useRef` inside the component.

### [src/components/WasmTerrain.jsx:102] — `computeVertexNormals()` every other frame
- Recomputes all 4800 vertex normals at ~30fps. CPU-intensive.
- **Fix**: Reduce frequency to every 4th frame, or only recompute when heights change.

### [src/components/WasmDemo.jsx:105-113] — State updates inside tight loop
- `setLog` called with functional updater inside a `for` loop (4 iterations, 3 calls per iteration).
- **Fix**: Accumulate log messages in a local string and set state once.

### [src/components/WasmDemo.jsx:101-111] — No error handling for WASM calls
- `w[t.wasmFn](t.arg)` called without try-catch. If WASM module lacks the export, unhandled rejection.
- **Fix**: Wrap each WASM call in try-catch.

### [src/components/ClickParticles.jsx:33] — Particle removal timeouts never cleared on unmount
- Every particle queues `setTimeout(() => p.remove(), 900)`. On unmount, pending timeouts still fire and reference orphaned DOM nodes.
- **Fix**: Store all timeout IDs and clear on unmount.

### [src/components/GlobalGlitch.jsx:36-53] — Stale `enabled` closure in recursive scheduling
- Captures `enabled` from closure at schedule time. When toggled off, one extra cycle (~5s) may still run.
- **Fix**: Use `enabledRef` to track live value.

### [src/components/GlobalGlitch.jsx:48-49] — Unmanaged glitch-removal timeouts
- Each `classList.remove` timeout is never stored/cleared.
- **Fix**: Store timeout IDs in a ref Set and clear in effect cleanup.

### [src/components/CursorGlow.jsx:11-14,27] — RAF conflicts with CSS transition
- RAF sets `left`/`top` every frame while CSS `transition: left 0.05s, top 0.05s` tries to smooth over 50ms. The glow always trails behind the cursor.
- **Fix**: Remove the CSS transition (RAF handles smoothness naturally).

### [src/components/ShutdownScreen.jsx:24] — Line-printing timeouts never cleaned up
- 9 `setTimeout` handles created but never stored. On unmount, they continue firing.
- **Fix**: Collect timeout IDs and clear in effect cleanup.

### [src/components/SplashScreen.jsx:133-145] — Unprotected timer chain on unmount
- Boot-message progression uses recursive `setTimeout` chain with no cleanup. If component unmounts mid-sequence, `setLineIdx`/`setProgress` fire on unmounted component.
- **Fix**: Store timeout IDs and clear in cleanup, or use a `mountedRef` guard.

### [src/components/SplashScreen.jsx:37-42] — No resize debounce on particle canvas
- Window resize fires 30+ times per second during drag, recalculating canvas and reinitializing particles.
- **Fix**: Debounce resize handler (e.g. 100ms).

### [src/components/Hero.jsx:44-50] — `GlitchText` inner `setTimeout` not tracked
- `setInterval` fires, creates a `setTimeout` for glitch reset. On unmount during that window, `setGlitching(false)` runs on unmounted component.
- **Fix**: Store inner timeout ID and clear in cleanup.

### [src/components/Hero.jsx:124-134] — Subtitle typewriter second interval never cleaned up
- `id2` (backspace interval) inside a `setTimeout` is never captured for cleanup. If component unmounts while backspacing, interval runs forever.
- **Fix**: Use a single interval with direction logic, or capture `id2` in a ref.

### [src/components/Navbar.jsx:33-39] — StatusTicker inner `setTimeout` not tracked
- Same pattern as GlitchText — the 300ms fade timeout is never stored for cleanup.
- **Fix**: Capture inner timeout ID.

### [src/components/App.jsx:39-44] — `setTimeout` in shutdown handler not cleaned up
- If `shutdown()` is called twice or component unmounts, pending timeout still fires.
- **Fix**: Capture timer and clear in effect cleanup.

### [src/components/App.jsx:46-56] — `cancelAnimationFrame` not called in scroll-effect cleanup
- Cleans up the scroll listener but leaves a pending RAF that calls `setScrollP` on unmounted component.
- **Fix**: Add `if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)` to cleanup.

### [src/main.jsx:8-10] — Hash-stripping breaks deep links
- `history.replaceState(null, '', window.location.pathname)` strips URL hashes on load. Bookmarks to `#about`, `#projects` etc. silently fail.
- **Fix**: Remove hash stripping, or implement proper hash-based scroll on mount.

### [src/main.jsx:12-18] — Smooth-scroll class never removed after first manual scroll
- `{ once: true }` on the scroll listener means after the first scroll, `smooth` class is never removed on subsequent manual scrolls.
- **Fix**: Remove `{ once: true }` or re-register the listener each time `smooth` is added.

### [src/hooks/useOnScreen.js:7-16] — Observer not re-attached if ref target changes
- Effect deps only include `[threshold]`. If `ref.current` changes to a different element, old element stays observed.
- **Fix**: Use a callback ref pattern instead of `useRef`.

### [src/components/TypeWriter.jsx:5-26] — Stale `delay`/`text` prop handling
- `useState(delay === 0)` captures initial value only. Changing `delay` prop after mount doesn't work correctly.
- **Fix**: Make the effect handle both direction changes for `delay` and reset `display` when `text` changes.

### [src/components/FpsMonitor.tsx:10-19] — Inflated FPS after tab backgrounding
- If `requestAnimationFrame` pauses (tab backgrounded), the counter accumulates over multiple seconds and reports artificially high FPS.
- **Fix**: Reset counter if more than 1500ms has elapsed since last update.

---

## 🎨 UI/UX & CSS Quirks

### [src/components/Skills.jsx:70-76] — Skill progress bar resets to 0 on every scroll
- Each scroll into view triggers `setW(0)` then `setTimeout(() => setW(level))`, causing a flickering re-animation.
- **Fix**: Use a `useRef` to track if already animated.

### [src/components/Learning.jsx:24-31] — Same progress-bar flicker issue
- **Fix**: Same as Skills — use a ref to track first animation.

### [src/components/Projects.jsx:70,73] — `href="#"` scrolls to top
- "source" and "demo" links use `href="#"`, causing unexpected scroll-to-top on click.
- **Fix**: Remove `href="#"` (use `<button>` or `<span>`), or add real project URLs.

### [src/components/ScrollToTop.jsx:7-10] — Button hidden on initial mid-page load
- No initial scroll-position check. If page loads at `scrollY > 400` (e.g., from hash link), button doesn't appear until next scroll.
- **Fix**: Check initial position inside the effect.

### [src/components/CursorGlow.jsx:12-13] — Glow starts at top-left corner
- No initial position. Glow sits at `(0, 0)` until first mouse move.
- **Fix**: Initialize to `-9999px` or center, or fade in on first move.

### [src/components/ShowcaseWall.jsx:48,60] — Flip-card absolute positioning depends on external CSS
- Back face uses `position: 'absolute', inset: 0`, relying on `.eng-card` having `position: relative` (from index.css). If that CSS is ever changed, flip breaks silently.
- **Fix**: Add `position: 'relative'` inline on the card `motion.div`.

### [src/components/ShowcaseWall.jsx:51] — Framer Motion + manual CSS transforms may conflict
- Manual `transform: rotateY(...)` inline style with Framer Motion managing its own transforms. They currently target different properties, but it's fragile.
- **Fix**: Use Framer Motion's `animate={{ rotateY: flip ? 180 : 0 }}`.

### [src/components/SplashScreen.jsx:128-131] — Cursor blink interval runs before needed
- Cursor `setInterval` starts on mount, but cursor element only renders when `done === true`.
- **Fix**: Move interval into the `done` effect.

### [src/index.css:140-148] — Section-reveal animation flash on first appearance
- `section[id]` has `opacity: 1`. When `.section-revealed` is added, `fadeInUp` starts from `opacity: 0` (from keyframe), causing a visible flash before animating in.
- **Fix**: Change base to `section[id] { opacity: 0; transform: translateY(20px); }` to match animation start state.

### [src/index.css:40-55] — Gradient border `mask-composite` has poor cross-browser support
- `mask-composite: exclude` not supported in Firefox. On unsupported browsers, the gradient pseudo-element renders as a solid overlay covering the card.
- **Fix**: Use a more robust gradient-border technique (background-clip + padding-box approach), or include a `@supports` fallback.

### [src/components/Navbar.jsx:128-142] — Mobile menu `height: 'auto'` animation jank
- Framer Motion doesn't animate to `auto` smoothly.
- **Fix**: Use `max-height` approach or explicit pixel values.

### [src/components/Toast.jsx:23-31] — Hidden component still renders DOM content
- After all timers fire, the toast `<div>` remains in DOM with `opacity-0`.
- **Fix**: Render `null` when fully done, or let parent remove it.

---

## 🧹 Refactoring & Clean Code

### Dead/unused files
- **`src/components/GsapReveal.jsx`** — never imported anywhere. Dead code.
- **`src/components/TypeWriter.jsx`** — never imported anywhere. Dead code.
- **`src/components/ConfettiBurst.jsx`** — never imported anywhere. Dead code.
- **`src/components/WasmTerrain.jsx`** — never imported anywhere. Likely intended for `Scene3D.jsx` but not wired.

### Dead dependencies
- **`package.json`**: `"react-intersection-observer": "^10.1.0"` — never imported in any source file. The app uses the custom `useOnScreen` hook instead.

### Unused variables / dead code
- **`src/components/SplashScreen.jsx:26`**: `let uid = 0` — declared at module scope, never read.
- **`src/components/DynamicTitle.jsx:13`**: `let dir = 1` — declared but never read.
- **`src/components/GlitchText.jsx:7,11`**: `frameRef` — incremented but never read.
- **`src/components/Learning.jsx:33-35`**: `'next'` branch in `statusColor` — no course data uses this status.

### Import/export issues
- **`src/components/SoundEngine.jsx`**: Exports `SoundToggle` as default but file is named `SoundEngine.jsx`. Confusing naming — a reader expects "engine" not "UI toggle".
- **`src/components/Skills.jsx:92`**: `import { useEffect, useState }` placed after component definitions (lines 68-90). ES module hoisting makes it work at runtime, but violates the standard convention of imports at file top.

### Architectural concerns
- **`src/lib/shutdown.js:1`**: Imports `{ disableSound }` from `'../components/SoundEngine'` — a `lib/` module importing from `components/`, inverting the dependency direction.
- **`src/components/Navbar.jsx:10-11`**: Navbar references `#wasm` and `#gpu` section IDs that exist in separate files (`WasmDemo.jsx`, `WebGPUDemo.jsx`). No shared config — renaming sections silently breaks nav.
- **`src/main.jsx:5-18`**: Global side effects (scroll restoration, hash stripping, click/scroll listeners) at module scope with no cleanup and no SSR guard.

### Data design
- **`src/components/Projects.jsx:10,19,28`**: `star: '★'` hardcoded per project. Could be derived from a boolean `featured` field.
- **`src/components/Contact.jsx:12-21`**: `SocialIcon` uses a `switch` statement with inline SVG paths. Adding a social link requires modifying the switch.
- **`src/components/Terminal.jsx:153-154`**: Command history grows unbounded. Cap to `prev.slice(-100)`.

### GSAP scroll trigger edge cases
- **`src/components/ScrollProgress.tsx:17-22`**: No short-content guard. If body height ≤ viewport, ScrollTrigger may behave erratically.
- **`src/components/GsapReveal.jsx:23`**: `toggleActions: 'play none none reverse'` can cause premature reverse if user scrolls past quickly.
- **`src/components/GsapReveal.jsx:13-25`**: Missing `ScrollTrigger.refresh()` call if content loads asynchronously.
