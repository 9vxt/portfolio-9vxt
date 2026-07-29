import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

let wasm = null

async function getWasm() {
  if (wasm) return wasm
  const res = await fetch('./portfolio.wasm')
  const bytes = await res.arrayBuffer()
  const { instance } = await WebAssembly.instantiate(bytes, {})
  wasm = instance.exports
  return wasm
}

getWasm()

const W = 128
const H = 96

export default function WasmTerrain() {
  const meshRef = useRef()
  const wireRef = useRef()
  const timeRef = useRef(0)

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(8, 6, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const updateTerrain = useCallback(async (t) => {
    const w = await getWasm()
    if (!w) return
    w.gen_terrain(W, H, t, 3.0)

    const mem = w.memory.buffer
    const ptr = w.get_heightmap()
    const heights = new Float32Array(mem, ptr, W * H)

    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = Math.floor(i % W)
      const y = Math.floor(i / W)
      const h = heights[y * W + x] * 0.6
      pos.setZ(i, h)
      pos.setY(i, h)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()

    if (wireRef.current) {
      const wpos = wireRef.current.geometry.attributes.position
      for (let i = 0; i < wpos.count; i++) {
        const x = Math.floor(i % W)
        const y = Math.floor(i / W)
        const h = heights[y * W + x] * 0.6
        wpos.setZ(i, h)
        wpos.setY(i, h)
      }
      wpos.needsUpdate = true
    }
  }, [geo])

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime * 0.3
    updateTerrain(timeRef.current)
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.2 + state.clock.elapsedTime * 0.03
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = meshRef.current.rotation.y
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      <mesh ref={meshRef} geometry={geo} scale={1}>
        <meshPhysicalMaterial
          color="#3b82f6"
          metalness={0.4}
          roughness={0.6}
          transparent
          opacity={0.25}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={wireRef} geometry={geo} scale={1}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  )
}
