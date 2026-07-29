import { useRef, useEffect, useState } from 'react'
import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const TRAIL_LEN = 40

let wasm = null
async function loadWasm() {
  if (wasm) return wasm
  const res = await fetch('./solarsystem.wasm')
  const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {})
  wasm = instance.exports
  wasm.init_solar()
  return wasm
}

// WGSL: 48-byte PlanetData (12 floats stride) matches C++ PlanetGPUData
const planetWGSL = `
struct PlanetData { pos: vec2f, _vel: vec2f, mass: f32, radius: f32, _pad: vec2f, color: vec3f, _pad2: f32 }
struct SimParams { scale: f32, aspect: f32, time: f32, _pad: f32 }

@group(0) @binding(0) var<storage, read> planets: array<PlanetData>;
@group(0) @binding(1) var<uniform> sim: SimParams;

struct VOut { @builtin(position) pos: vec4f, @location(0) col: vec3f, @location(1) uv: vec2f, @location(2) @interpolate(flat) ii: u32 }

@vertex
fn vertMain(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  let corners = array<vec2f, 4>(vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1), vec2f(1,1));
  let p = planets[ii];
  let corner = corners[vi];
  let world = p.pos * sim.scale;
  let rad = p.radius * sim.scale;
  var out: VOut;
  out.pos = vec4f(world.x + corner.x * rad, world.y + corner.y * rad * sim.aspect, 0.0, 1.0);
  out.col = p.color;
  out.uv = corner;
  out.ii = ii;
  return out;
}

@fragment
fn fragMain(@location(0) col: vec3f, @location(1) uv: vec2f, @location(2) @interpolate(flat) ii: u32) -> @location(0) vec4f {
  let d = length(uv);
  let a = 1.0 - smoothstep(0.85, 1.0, d);
  if (d > 1.0) { discard; }
  if (ii == 0u) {
    let glow = exp(-d * d * 3.0) * 0.6;
    return vec4f(col * (1.0 + glow), a * 0.8 + glow * 0.5);
  }
  return vec4f(col, a * 0.8);
}
`

const trailWGSL = `
struct SimParams { scale: f32, aspect: f32, time: f32, _pad: f32 }
struct TrailPoint { pos: vec2f, age: f32, _pad: f32, col: vec3f, _pad2: f32 }

@group(0) @binding(0) var<storage, read> trail: array<TrailPoint>;
@group(0) @binding(1) var<uniform> sim: SimParams;

struct TOut { @builtin(position) pos: vec4f, @location(0) col: vec4f }

const TRAIL_LEN = ${TRAIL_LEN}u;

@vertex
fn trailVert(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> TOut {
  let tp = trail[ii * TRAIL_LEN + vi];
  let world = tp.pos * sim.scale;
  var out: TOut;
  out.pos = vec4f(world.x, world.y * sim.aspect, 0.0, 1.0);
  out.col = vec4f(tp.col * tp.age, tp.age * 0.5);
  return out;
}

@fragment
fn trailFrag(@location(0) col: vec4f) -> @location(0) vec4f {
  return col;
}
`

const bgWGSL = `
@group(0) @binding(0) var<uniform> time: f32;

struct BgOut { @builtin(position) pos: vec4f, @location(0) uv: vec2f }

@vertex
fn bgVert(@builtin(vertex_index) vi: u32) -> BgOut {
  let pos = vec2f(f32(vi & 1u) * 4.0 - 1.0, f32(vi >> 1u) * 4.0 - 1.0);
  var out: BgOut;
  out.pos = vec4f(pos, 0.0, 1.0);
  out.uv = pos * 0.5 + 0.5;
  return out;
}

@fragment
fn bgFrag(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = vec2u(uv * vec2f(512.0, 320.0));
  let h = (p.x * 1973u + p.y * 9277u) ^ 12345u;
  let star = f32(h % 10000u) / 10000.0;
  let twinkle = sin(f32(h) * 0.7 + time * 1.5) * 0.5 + 0.5;
  let starBright = smoothstep(0.997, 1.0, star) * (0.15 + 0.85 * twinkle);
  let nebula = sin(uv.x * 3.0 + time * 0.05) * 0.012 + cos(uv.y * 4.0 + time * 0.03) * 0.012 + sin((uv.x + uv.y) * 5.0 + time * 0.04) * 0.008;
  let center = length(uv - 0.5);
  let sunGlow = exp(-center * center * 8.0) * 0.04;
  let col = vec3f(0.004 + nebula + sunGlow) + vec3f(starBright);
  return vec4f(col, 1.0);
}
`

async function initSolarGPU(canvas, maxPlanets) {
  if (!navigator.gpu) {
    console.error('WebGPU not available')
    throw new Error('no WebGPU')
  }
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.error('No WebGPU adapter found')
    throw new Error('no adapter')
  }
  const device = await adapter.requestDevice()
  const ctx = canvas.getContext('webgpu')
  ctx.configure({ device, format: 'bgra8unorm', alphaMode: 'premultiplied' })
  console.log('WebGPU initialized')

  const scale = 1.0 / 4.0
  const aspect = canvas.width / canvas.height

  // --- Planet buffer (maxPlanets * 48 = maxPlanets * 12 floats * 4) ---
  const planetBuf = device.createBuffer({
    size: maxPlanets * 12 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  // --- Shared SimParams uniform (scale, aspect, time, pad = 16 bytes) ---
  const simBuf = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // --- Background time uniform ---
  const bgTimeBuf = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // --- Trail buffer (maxPlanets * TRAIL_LEN * 32 bytes each) ---
  const trailStage = new Float32Array(maxPlanets * TRAIL_LEN * 8)
  const trailBuf = device.createBuffer({
    size: maxPlanets * TRAIL_LEN * 8 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  // --- Shader modules ---
  const planetMod = device.createShaderModule({ code: planetWGSL })
  const trailMod = device.createShaderModule({ code: trailWGSL })
  const bgMod = device.createShaderModule({ code: bgWGSL })

  // --- Background pipeline ---
  const bgLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
    ]
  })
  const bgPipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bgLayout] }),
    vertex: { module: bgMod, entryPoint: 'bgVert' },
    fragment: { module: bgMod, entryPoint: 'bgFrag', targets: [{ format: 'bgra8unorm' }] },
    primitive: { topology: 'triangle-list' },
  })
  const bgBG = device.createBindGroup({
    layout: bgLayout,
    entries: [{ binding: 0, resource: { buffer: bgTimeBuf } }],
  })

  // --- Trail pipeline ---
  const trailLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
    ]
  })
  const trailPipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [trailLayout] }),
    vertex: { module: trailMod, entryPoint: 'trailVert' },
    fragment: { module: trailMod, entryPoint: 'trailFrag', targets: [{ format: 'bgra8unorm', blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }] },
    primitive: { topology: 'line-strip' },
  })
  const trailBG = device.createBindGroup({
    layout: trailLayout,
    entries: [
      { binding: 0, resource: { buffer: trailBuf } },
      { binding: 1, resource: { buffer: simBuf } },
    ],
  })

  // --- Planet pipeline ---
  const planetLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
    ]
  })
  const planetPipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [planetLayout] }),
    vertex: { module: planetMod, entryPoint: 'vertMain' },
    fragment: { module: planetMod, entryPoint: 'fragMain', targets: [{ format: 'bgra8unorm', blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }] },
    primitive: { topology: 'triangle-strip' },
  })
  const planetBG = device.createBindGroup({
    layout: planetLayout,
    entries: [
      { binding: 0, resource: { buffer: planetBuf } },
      { binding: 1, resource: { buffer: simBuf } },
    ],
  })

  // --- Trail ring buffer (JS-managed) ---
  const trailXY = new Float32Array(maxPlanets * TRAIL_LEN * 2)
  const trailHEAD = new Uint32Array(maxPlanets)
  const trailCNT = new Uint32Array(maxPlanets)

  let running = true
  let elapsed = 0
  const w = await loadWasm()
  let last = performance.now()

  const frame = () => {
    if (!running) return
    const now = performance.now()
    const dt = Math.min((now - last) * 0.001, 0.02)
    last = now
    elapsed += dt

    w.step_solar(dt)
    const cnt = w.planet_count()

    // --- Direct WASM memory → GPU buffer copy (48-byte stride) ---
    const ptr = w.get_planets_ptr()
    const src = new Float32Array(w.memory.buffer, ptr, cnt * 12)
    device.queue.writeBuffer(planetBuf, 0, src)

    // --- Update trail ring buffers ---
    for (let i = 0; i < cnt; i++) {
      const base = i * TRAIL_LEN * 2
      const head = trailHEAD[i]
      trailXY[base + head * 2] = src[i * 12]
      trailXY[base + head * 2 + 1] = src[i * 12 + 1]
      trailHEAD[i] = (head + 1) % TRAIL_LEN
      trailCNT[i] = Math.min(trailCNT[i] + 1, TRAIL_LEN)
    }

    // --- Linearize trail data ---
    trailStage.fill(0)
    for (let i = 0; i < cnt; i++) {
      const hd = trailHEAD[i]
      const cc = trailCNT[i]
      for (let j = 0; j < TRAIL_LEN; j++) {
        let srcIdx, age
        if (j < cc) {
          srcIdx = (hd + 1 + j) % TRAIL_LEN
          age = cc > 1 ? j / (cc - 1) : 1.0
        } else {
          srcIdx = hd
          age = 0
        }
        const dst = (i * TRAIL_LEN + j) * 8
        const sx = i * TRAIL_LEN * 2 + srcIdx * 2
        trailStage[dst] = trailXY[sx]
        trailStage[dst + 1] = trailXY[sx + 1]
        trailStage[dst + 2] = age
        trailStage[dst + 4] = src[i * 12 + 8]
        trailStage[dst + 5] = src[i * 12 + 9]
        trailStage[dst + 6] = src[i * 12 + 10]
      }
    }
    device.queue.writeBuffer(trailBuf, 0, trailStage)

    // --- Write uniforms ---
    const simStage = new Float32Array([scale, aspect, elapsed, 0])
    device.queue.writeBuffer(simBuf, 0, simStage)
    device.queue.writeBuffer(bgTimeBuf, 0, new Float32Array([elapsed]))

    // --- Render passes ---
    const enc = device.createCommandEncoder()
    const tex = ctx.getCurrentTexture()

    // Pass 1: Background (full-screen triangle → starfield + nebula)
    const bp = enc.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), loadOp: 'clear', clearValue: { r: 0, g: 0, b: 0, a: 1 }, storeOp: 'store' }],
    })
    bp.setPipeline(bgPipe)
    bp.setBindGroup(0, bgBG)
    bp.draw(3, 1, 0, 0)
    bp.end()

    // Pass 2: Trails (one line-strip draw per planet)
    const tp = enc.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), loadOp: 'load', storeOp: 'store' }],
    })
    tp.setPipeline(trailPipe)
    tp.setBindGroup(0, trailBG)
    for (let i = 0; i < cnt; i++) {
      tp.draw(TRAIL_LEN, 1, 0, i)
    }
    tp.end()

    // Pass 3: Planets (triangle-strip quads, SDF circle, sun bloom)
    const pp = enc.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), loadOp: 'load', storeOp: 'store' }],
    })
    pp.setPipeline(planetPipe)
    pp.setBindGroup(0, planetBG)
    pp.draw(4, cnt, 0, 0)
    pp.end()

    device.queue.submit([enc.finish()])
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
  return () => { running = false; device.destroy() }
}

export default function WebGPUDemo() {
  const [ref, visible] = useOnScreen(0.1)
  const canvasRef = useRef()
  const [supported, setSupported] = useState(null)
  const [error, setError] = useState('')
  const [wasmReady, setWasmReady] = useState(false)
  const cleanupRef = useRef()

  useEffect(() => { loadWasm().then(() => setWasmReady(true)).catch(e => console.error('WASM load fail:', e)) }, [])

  useEffect(() => {
    const gpuAvail = !!navigator.gpu
    setSupported(gpuAvail)
    const canvas = canvasRef.current
    if (!canvas) return
    if (gpuAvail) {
      initSolarGPU(canvas, 9)
        .then((c) => { cleanupRef.current = c; setError('') })
        .catch((e) => { console.error('WebGPU init fail:', e.message); setError(e.message); setSupported(false) })
    } else {
      console.warn('WebGPU not available, using Canvas2D fallback')
    }
    return () => { if (cleanupRef.current) cleanupRef.current() }
  }, [])

  useEffect(() => {
    if (supported !== false) return
    const canvas = canvasRef.current
    if (!canvas) return
    let running = true
    const ctx = canvas.getContext('2d')
    let last = performance.now()

    const draw = async () => {
      if (!running) return
      const w = await loadWasm()
      const now = performance.now()
      w.step_solar(Math.min((now - last) * 0.001, 0.02))
      last = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#080c14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const cnt = w.planet_count()
      const ptr = w.get_planets_ptr()
      const data = new Float32Array(w.memory.buffer, ptr, cnt * 12)
      const sx = data[0] * canvas.width / 8 + canvas.width / 2
      const sy = data[1] * canvas.height / 8 + canvas.height / 2
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 60)
      grad.addColorStop(0, 'rgba(255,200,50,0.12)')
      grad.addColorStop(1, 'rgba(255,200,50,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < cnt; i++) {
        const px = data[i * 12] * canvas.width / 8 + canvas.width / 2
        const py = data[i * 12 + 1] * canvas.height / 8 + canvas.height / 2
        const rad = Math.max(2, data[i * 12 + 5] * canvas.width / 8)
        ctx.beginPath()
        ctx.arc(px, py, rad, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${data[i*12+8]*255|0},${data[i*12+9]*255|0},${data[i*12+10]*255|0})`
        ctx.fill()
        if (i === 0) {
          ctx.beginPath()
          ctx.arc(px, py, rad + 6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,50,0.15)'
          ctx.fill()
        }
      }
      requestAnimationFrame(draw)
    }
    if (supported === false) draw()
    return () => { running = false }
  }, [supported])

  return (
    <section id="gpu" className="py-24 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest"><span className="text-[#22d3ee]">//</span> gpu_wasm</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-3 font-mono">solar<span className="text-[#22d3ee]">_</span>system</h2>
          <p className="text-xs font-mono text-[#64748b]">C++ OOP N-body gravity — compiled to WASM, rendered via WebGPU</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.1 }} className="eng-card p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#475569] font-mono ml-2">{supported === null ? 'checking...' : supported ? 'solarsystem@wasm+webgpu' : 'unavailable'}</span>
            <span className="ml-auto text-[10px] text-[#475569] font-mono">
              {supported ? <span className="text-[#34d399]">● GPU active</span> : <span className="text-[#f59e0b]">● no GPU</span>}
              {!wasmReady && <span className="text-[#f59e0b] ml-2">● WASM loading...</span>}
            </span>
          </div>
          {!supported && (
            <div className="p-6 text-center">
              <p className="text-xs font-mono text-[#64748b] mb-2">{error ? `Error: ${error}` : 'WebGPU unavailable'}</p>
              <p className="text-[10px] font-mono text-[#475569]">Rendering with Canvas2D fallback (WASM physics still active)</p>
            </div>
          )}
          <canvas ref={canvasRef} width={512} height={320} className="w-full h-auto rounded bg-black" style={{ aspectRatio: '512/320' }} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Render: </span><span className="text-[#22d3ee]">WebGPU</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Physics: </span><span className="text-[#34d399]">WASM (C++)</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Bodies: </span><span className="text-[#f1f5f9]">9 (Sun + 8 planets)</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">OOP: </span><span className="text-[#f59e0b]">Vec2+PlanetGPUData+SolarSystem</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
