let wasm = null

async function ensure() {
  if (wasm) return
  const res = await fetch('./portfolio.wasm')
  const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), { env: {} })
  wasm = instance.exports
}

self.onmessage = async (e) => {
  await ensure()
  const { w, h, t, s, id } = e.data
  wasm.gen_terrain(w, h, t, s)
  const ptr = wasm.get_heightmap()
  const src = new Float32Array(wasm.memory.buffer, ptr, w * h)
  const copy = new Float32Array(src.length)
  copy.set(src)
  self.postMessage({ id, heights: copy.buffer, w, h }, [copy.buffer])
}
