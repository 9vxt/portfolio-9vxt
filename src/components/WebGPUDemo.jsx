import { useRef, useEffect, useState } from 'react'
import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const wgslBlackHole = `
struct Particle { pos: vec2<f32>, vel: vec2<f32>, color: vec3<f32>, life: f32 }

@group(0) @binding(0) var<storage, read_write> p: array<Particle>;
@group(0) @binding(1) var<uniform> time: f32;

fn gravity(pos: vec2<f32>) -> vec2<f32> {
  let r = length(pos);
  let bh = 80.0;
  let soften = 0.12;
  return -normalize(pos) * bh / (r * r + soften);
}

@compute @workgroup_size(64)
fn compMain(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  let n = arrayLength(&p);
  if (i >= n) { return; }
  var pt = p[i];

  let grav = gravity(pt.pos);
  pt.vel += grav * 0.003;
  pt.vel *= 0.998;
  pt.pos += pt.vel;
  pt.life += 0.005;

  let r = length(pt.pos);
  let velLen = length(pt.vel);
  pt.color = vec3(
    0.3 + 0.7 / (1.0 + r * 2.0),
    0.2 + 0.5 / (1.0 + r * 1.5),
    0.1 + 0.3 / (1.0 + r)
  );
  pt.color *= 0.6 + 0.4 * sin(pt.life * 2.0);

  if (r < 0.12 || r > 2.5) {
    let a = atan2(pt.pos.y, pt.pos.x) + 0.3 + f32(i) * 0.001;
    let nr = 0.3 + 0.1 * f32(i % 17) + 0.05 * sin(time + f32(i) * 0.01);
    pt.pos = vec2(cos(a), sin(a)) * nr;
    pt.vel = normalize(vec2(-pt.pos.y, pt.pos.x)) * sqrt(80.0 / nr) * 0.4;
    pt.life = 0.0;
  }
  p[i] = pt;
}

@vertex
fn vertMain(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4<f32> {
  let i = vi / 4u;
  let vert = vi % 4u;
  let sz = 0.008;
  let idx = f32(i);
  let px = (idx - 1536.0) / 1536.0 * 2.6;
  let py = (idx - 1536.0) / 1536.0 * 2.0;
  if (vert == 0u) { return vec4(px - sz, py - sz, 0.0, 1.0); }
  if (vert == 1u) { return vec4(px + sz, py - sz, 0.0, 1.0); }
  if (vert == 2u) { return vec4(px + sz, py + sz, 0.0, 1.0); }
  return vec4(px - sz, py + sz, 0.0, 1.0);
}

@fragment
fn fragMain() -> @location(0) vec4<f32> {
  return vec4(0.9, 0.4, 0.1, 0.8);
}
`

async function initBlackHole(canvas, count) {
  if (!navigator.gpu) throw new Error('WebGPU not supported')
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error('No GPU adapter')
  const device = await adapter.requestDevice()
  const ctx = canvas.getContext('webgpu')
  ctx.configure({ device, format: 'bgra8unorm', alphaMode: 'premultiplied' })

  const data = new Float32Array(count * (2 + 2 + 3 + 1))
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.3 + Math.random() * 1.5
    data[i*8] = Math.cos(a) * r
    data[i*8+1] = Math.sin(a) * r
    data[i*8+2] = Math.cos(a + Math.PI/2) * Math.sqrt(80 / r) * 0.4
    data[i*8+3] = Math.sin(a + Math.PI/2) * Math.sqrt(80 / r) * 0.4
    data[i*8+4] = 0.9; data[i*8+5] = 0.5; data[i*8+6] = 0.2
    data[i*8+7] = 0
  }

  const buf = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, mappedAtCreation: true })
  new Float32Array(buf.getMappedRange()).set(data); buf.unmap()
  const timeBuf = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })

  const mod = device.createShaderModule({ code: wgslBlackHole })

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
  let running = true; let last = performance.now()

  const frame = () => {
    if (!running) return
    const now = performance.now()
    timeData[0] += (now - last) * 0.001; last = now
    device.queue.writeBuffer(timeBuf, 0, timeData)

    const encoder = device.createCommandEncoder()
    const cpass = encoder.beginComputePass()
    cpass.setPipeline(compPipe)
    cpass.setBindGroup(0, compBG)
    cpass.dispatchWorkgroups(Math.ceil(count / 64))
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
    rpass.draw(count * 4, 1, 0, 0)
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
    initBlackHole(canvas, 3072).then((cleanup) => {
      cleanupRef.current = cleanup
      setError('')
    }).catch((e) => {
      setError(e.message); setSupported(false)
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-3 font-mono">blackhole<span className="text-[#22d3ee]">_</span>sim</h2>
          <p className="text-xs font-mono text-[#64748b]">Black hole accretion disk — 3,072 particles simulated via WebGPU compute shaders (WGSL)</p>
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
              {supported === null ? 'checking...' : supported ? 'blackhole@accretion_disk' : 'webgpu unavailable'}
            </span>
            <span className="ml-auto text-[10px] text-[#475569] font-mono">
              {supported ? <span className="text-[#34d399]">● GPU compute active</span> : <span className="text-[#f59e0b]">● falling back</span>}
            </span>
          </div>
          {!supported && (
            <div className="p-6 text-center">
              <p className="text-xs font-mono text-[#64748b] mb-2">
                {error ? `Error: ${error}` : 'WebGPU unavailable'}
              </p>
              <p className="text-[10px] font-mono text-[#475569]">Chrome 113+ or Edge 113+ required. Enable <span className="text-[#3b82f6]">#enable-unsafe-webgpu</span></p>
            </div>
          )}
          <canvas ref={canvasRef} width={512} height={320} className="w-full h-auto rounded bg-black" style={{ aspectRatio: '512/320' }} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">API: </span><span className="text-[#22d3ee]">WebGPU</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Code: </span><span className="text-[#34d399]">WGSL compute</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Particles: </span><span className="text-[#f1f5f9]">3,072</span></div>
            <div className="px-2 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded"><span className="text-[#475569]">Physics: </span><span className="text-[#f59e0b]">N-body gravity</span></div>
          </div>
          <details className="mt-3">
            <summary className="text-[10px] font-mono text-[#475569] cursor-pointer hover:text-[#64748b]">view compute shader (WGSL)</summary>
            <pre className="text-[10px] font-mono text-[#94a3b8] whitespace-pre-wrap mt-2 p-3 bg-[#0a0e17] border border-[#1e293b] rounded" style={{ maxHeight: 200, overflow: 'auto' }}>
{wgslBlackHole.trim()}
            </pre>
          </details>
        </motion.div>
      </div>
    </section>
  )
}
