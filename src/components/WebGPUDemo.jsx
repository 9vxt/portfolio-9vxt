import { useRef, useEffect, useState } from 'react'
import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

let wasm = null
async function loadWasm() {
  if (wasm) return wasm
  const res = await fetch('./solarsystem.wasm')
  const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {})
  wasm = instance.exports
  wasm.init_solar()
  return wasm
}

const wgsl = `
struct PlanetData { pos: vec2<f32>, radius: f32, _pad: f32, color: vec3<f32>, _pad2: f32 }
struct SimParams { scale: f32, aspect: f32, _pad: vec2<f32> }

@group(0) @binding(0) var<storage, read> planets: array<PlanetData>;
@group(0) @binding(1) var<uniform> sim: SimParams;

struct VOut { @builtin(position) pos: vec4<f32>, @location(0) col: vec3<f32> }

@vertex
fn vertMain(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  let p = planets[ii];
  let corner = vec2<f32>(
    select(-1.0, 1.0, vi == 1u || vi == 2u),
    select(-1.0, 1.0, vi == 2u || vi == 3u),
  );
  let world = p.pos * sim.scale;
  let rad = p.radius * sim.scale;
  var out: VOut;
  out.pos = vec4(world.x + corner.x * rad, world.y + corner.y * rad * sim.aspect, 0.0, 1.0);
  out.col = p.color;
  return out;
}

@fragment
fn fragMain(@location(0) col: vec3<f32>) -> @location(0) vec4<f32> {
  return vec4(col, 0.8);
}
`

async function initSolarGPU(canvas, maxPlanets) {
  if (!navigator.gpu) throw new Error('no WebGPU')
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error('no adapter')
  const device = await adapter.requestDevice()
  const ctx = canvas.getContext('webgpu')
  ctx.configure({ device, format: 'bgra8unorm', alphaMode: 'premultiplied' })

  const floatsPerPlanet = 8
  const buf = device.createBuffer({
    size: maxPlanets * floatsPerPlanet * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  const uniformBuf = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const mod = device.createShaderModule({ code: wgsl })

  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
    ]
  })
  const pipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
    vertex: { module: mod, entryPoint: 'vertMain' },
    fragment: {
      module: mod, entryPoint: 'fragMain',
      targets: [{ format: 'bgra8unorm', blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }],
    },
    primitive: { topology: 'triangle-strip' },
  })
  const bg = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: buf } },
      { binding: 1, resource: { buffer: uniformBuf } },
    ],
  })

  const stageData = new Float32Array(maxPlanets * floatsPerPlanet)
  const uniformData = new Float32Array(4)
  uniformData[0] = 1.0 / 4.0
  uniformData[1] = canvas.width / canvas.height
  device.queue.writeBuffer(uniformBuf, 0, uniformData)

  let running = true

  const w = await loadWasm()
  let last = performance.now()

  const frame = () => {
    if (!running) return
    const now = performance.now()
    const dt = Math.min((now - last) * 0.001, 0.02)
    last = now

    w.step_solar(dt)

    const cnt = w.planet_count()
    stageData.fill(0)
    for (let i = 0; i < cnt && i < maxPlanets; i++) {
      stageData[i * 8] = w.planet_x(i)
      stageData[i * 8 + 1] = w.planet_y(i)
      stageData[i * 8 + 2] = w.planet_radius(i)
      stageData[i * 8 + 4] = w.planet_r(i)
      stageData[i * 8 + 5] = w.planet_g(i)
      stageData[i * 8 + 6] = w.planet_b(i)
    }
    device.queue.writeBuffer(buf, 0, stageData)

    const enc = device.createCommandEncoder()
    const tex = ctx.getCurrentTexture()
    const rp = enc.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), loadOp: 'clear', clearValue: { r: 0, g: 0, b: 0, a: 0 }, storeOp: 'store' }],
    })
    rp.setPipeline(pipe)
    rp.setBindGroup(0, bg)
    rp.draw(4, maxPlanets, 0, 0)
    rp.end()
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

  useEffect(() => { loadWasm().then(() => setWasmReady(true)) }, [])

  useEffect(() => {
    setSupported(!!navigator.gpu)
    const canvas = canvasRef.current
    if (!canvas) return
    if (navigator.gpu) {
      initSolarGPU(canvas, 9)
        .then((c) => { cleanupRef.current = c; setError('') })
        .catch((e) => { setError(e.message); setSupported(false) })
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
      const cnt = w.planet_count()
      for (let i = 0; i < cnt; i++) {
        const px = w.planet_x(i) * canvas.width / 8 + canvas.width / 2
        const py = w.planet_y(i) * canvas.height / 8 + canvas.height / 2
        const rad = Math.max(2, w.planet_radius(i) * canvas.width / 8)
        ctx.beginPath()
        ctx.arc(px, py, rad, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${w.planet_r(i)*255|0},${w.planet_g(i)*255|0},${w.planet_b(i)*255|0})`
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
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">OOP: </span><span className="text-[#f59e0b]">Vec2+Planet+SolarSystem</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
