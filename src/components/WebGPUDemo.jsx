import { useRef, useEffect, useState } from 'react'
import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const wgslModule = `
struct Particle { pos: vec2<f32>, vel: vec2<f32> }

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> time: f32;

@compute @workgroup_size(64)
fn compMain(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  let n = arrayLength(&particles);
  if (i >= n) { return; }
  var p = particles[i];
  p.vel.x += (sin(p.pos.y * 0.5 + time) - p.pos.x * 0.08) * 0.003;
  p.vel.y += (cos(p.pos.x * 0.5 + time * 0.7) - p.pos.y * 0.08) * 0.003;
  p.pos += p.vel;
  if (p.pos.x > 1.3) { p.pos.x = -1.3; }
  if (p.pos.x < -1.3) { p.pos.x = 1.3; }
  if (p.pos.y > 1.0) { p.pos.y = -1.0; }
  if (p.pos.y < -1.0) { p.pos.y = 1.0; }
  particles[i] = p;
}

struct VOut { @builtin(position) pos: vec4<f32>, @location(0) col: vec3<f32> }

@vertex
fn vertMain(@builtin(vertex_index) vi: u32) -> VOut {
  let i = vi / 4u;
  let vert = vi % 4u;
  let cols = 64u;
  let rows = 48u;
  let px = f32(i % cols) / f32(cols) * 2.6 - 1.3;
  let py = f32(i / cols) / f32(rows) * 2.0 - 1.0;
  let sz = 0.012;
  var out: VOut;
  if (vert == 0u) { out.pos = vec4(px - sz, py - sz, 0.0, 1.0); }
  else if (vert == 1u) { out.pos = vec4(px + sz, py - sz, 0.0, 1.0); }
  else if (vert == 2u) { out.pos = vec4(px + sz, py + sz, 0.0, 1.0); }
  else { out.pos = vec4(px - sz, py + sz, 0.0, 1.0); }
  out.col = vec3(0.23, 0.51, 0.96);
  return out;
}

@fragment
fn fragMain(@location(0) col: vec3<f32>) -> @location(0) vec4<f32> {
  return vec4(col, 0.5);
}
`

async function initWebGPU(canvas, particleCount) {
  if (!navigator.gpu) throw new Error('WebGPU not supported')
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error('No GPU adapter')
  const device = await adapter.requestDevice()
  const ctx = canvas.getContext('webgpu')
  ctx.configure({ device, format: 'bgra8unorm', alphaMode: 'premultiplied' })

  const particles = new Float32Array(particleCount * 4)
  for (let i = 0; i < particleCount; i++) {
    particles[i * 4] = (Math.random() - 0.5) * 2.4
    particles[i * 4 + 1] = (Math.random() - 0.5) * 1.8
    particles[i * 4 + 2] = (Math.random() - 0.5) * 0.01
    particles[i * 4 + 3] = (Math.random() - 0.5) * 0.01
  }
  const buf = device.createBuffer({ size: particles.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, mappedAtCreation: true })
  new Float32Array(buf.getMappedRange()).set(particles); buf.unmap()
  const timeBuf = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })

  const mod = device.createShaderModule({ code: wgslModule })

  const compBind = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    ]
  })
  const compPipe = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [compBind] }),
    compute: { module: mod, entryPoint: 'compMain' },
  })
  const compBG = device.createBindGroup({
    layout: compBind,
    entries: [
      { binding: 0, resource: { buffer: buf } },
      { binding: 1, resource: { buffer: timeBuf } },
    ],
  })

  const renderPipe = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: mod, entryPoint: 'vertMain' },
    fragment: { module: mod, entryPoint: 'fragMain', targets: [{ format: 'bgra8unorm', blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }] },
    primitive: { topology: 'triangle-list' },
  })

  const timeData = new Float32Array([0])
  let running = true
  let last = performance.now()

  const frame = () => {
    if (!running) return
    const now = performance.now()
    timeData[0] += (now - last) * 0.001; last = now
    device.queue.writeBuffer(timeBuf, 0, timeData)

    const encoder = device.createCommandEncoder()
    const cpass = encoder.beginComputePass()
    cpass.setPipeline(compPipe)
    cpass.setBindGroup(0, compBG)
    cpass.dispatchWorkgroups(Math.ceil(particleCount / 64))
    cpass.end()

    const tex = ctx.getCurrentTexture()
    const rpass = encoder.beginRenderPass({
      colorAttachments: [{
        view: tex.createView(),
        loadOp: 'clear', clearValue: { r: 0, g: 0, b: 0, a: 0 },
        storeOp: 'store',
      }],
    })
    rpass.setPipeline(renderPipe)
    rpass.draw(particleCount * 4, 1, 0, 0)
    rpass.end()

    device.queue.submit([encoder.finish()])
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
  const cleanupRef = useRef()

  useEffect(() => {
    setSupported(!!navigator.gpu)
    if (!navigator.gpu) return
    const canvas = canvasRef.current
    if (!canvas) return
    initWebGPU(canvas, 3072).then((cleanup) => {
      cleanupRef.current = cleanup
      setError('')
    }).catch((e) => {
      setError(e.message)
      setSupported(false)
    })
    return () => { if (cleanupRef.current) cleanupRef.current() }
  }, [])

  return (
    <section id="gpu" className="py-24 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest"><span className="text-[#22d3ee]">//</span> gpu_compute</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-3 font-mono">webgpu<span className="text-[#22d3ee]">_</span>compute</h2>
          <p className="text-xs font-mono text-[#64748b]">GPU compute shader particle simulation — 3,072 particles on device memory</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="eng-card p-5"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#475569] font-mono ml-2">
              {supported === null ? 'checking...' : supported ? 'wgpu compute@particles' : 'webgpu unavailable'}
            </span>
            <span className="ml-auto text-[10px] text-[#475569] font-mono">
              {supported ? <span className="text-[#34d399]">● running on GPU</span> : <span className="text-[#f59e0b]">● falling back</span>}
            </span>
          </div>
          {!supported && (
            <div className="p-6 text-center">
              <p className="text-xs font-mono text-[#64748b] mb-2">
                {error ? `Error: ${error}` : 'WebGPU is not available in this browser.'}
              </p>
              <p className="text-[10px] font-mono text-[#475569]">
                Try Chrome 113+, Edge 113+, or enable <span className="text-[#3b82f6]">#enable-unsafe-webgpu</span> in about://flags
              </p>
            </div>
          )}
          <canvas ref={canvasRef} width={512} height={320} className="w-full h-auto rounded bg-black" style={{ aspectRatio: '512/320' }} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded">
              <span className="text-[#475569]">API: </span><span className="text-[#22d3ee]">WebGPU</span>
            </div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded">
              <span className="text-[#475569]">Shader: </span><span className="text-[#34d399]">WGSL</span>
            </div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded">
              <span className="text-[#475569]">Particles: </span><span className="text-[#f1f5f9]">3,072</span>
            </div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded">
              <span className="text-[#475569]">Workgroups: </span><span className="text-[#f1f5f9]">48</span>
            </div>
          </div>
          <details className="mt-3">
            <summary className="text-[10px] font-mono text-[#475569] cursor-pointer hover:text-[#64748b]">view compute shader (WGSL)</summary>
            <pre className="text-[10px] font-mono text-[#94a3b8] whitespace-pre-wrap mt-2 p-3 bg-[#0a0e17] border border-[#1e293b] rounded" style={{ maxHeight: 200, overflow: 'auto' }}>
{wgslModule.trim()}
            </pre>
          </details>
        </motion.div>
      </div>
    </section>
  )
}
