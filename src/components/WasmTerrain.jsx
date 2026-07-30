import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const W = 80; const H = 60

export default function WasmTerrain({ scrollP = 0 }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const workerRef = useRef()
  const getWorker = () => {
    if (!workerRef.current) workerRef.current = new Worker('/terrain.worker.js')
    return workerRef.current
  }
  const [ready, setReady] = useState(false)
  const frameCountRef = useRef(0)
  const rotRef = useRef(0)
  const reqIdRef = useRef(0)
  const pendingIdRef = useRef(-1)
  const cacheRef = useRef(new Float32Array(W * H))

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 14, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    const colors = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 0.46; colors[i + 1] = 0.40; colors[i + 2] = 0.06
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [])

  const wireGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 14, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  function updateColors(pos, colors) {
    const arr = colors.array
    const cache = cacheRef.current
    for (let i = 0; i < pos.count; i++) {
      const y = Math.floor(i / W), x = i % W
      const h = cache[y * W + x] * 1.4
      const nh = (h + 2.0) / 4.0
      let r, g, b
      if (nh < 0.15) {
        r = 0.01; g = 0.02; b = 0.08
      } else if (nh < 0.25) {
        const t = (nh - 0.15) / 0.1
        r = 0.01 + t * 0.45; g = 0.02 + t * 0.38; b = 0.08 + t * (-0.02)
      } else if (nh < 0.45) {
        const t = (nh - 0.25) / 0.2
        r = 0.46 + t * 0.15; g = 0.40 + t * 0.27; b = 0.06 + t * 0.04
      } else if (nh < 0.65) {
        const t = (nh - 0.45) / 0.2
        r = 0.61 + t * (-0.14); g = 0.67 + t * (-0.16); b = 0.10 + t * 0.06
      } else if (nh < 0.8) {
        const t = (nh - 0.65) / 0.15
        r = 0.47 + t * 0.10; g = 0.51 + t * 0.08; b = 0.16 + t * 0.30
      } else {
        const t = (nh - 0.8) / 0.2
        r = 0.57 + t * 0.35; g = 0.59 + t * 0.30; b = 0.46 + t * 0.42
      }
      arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b
    }
    colors.needsUpdate = true
  }

  const readyRef = useRef(false)

  useEffect(() => {
    const w = getWorker(); let mounted = true
    w.onmessage = (e) => {
      if (!mounted) return
      const { id, heights } = e.data
      if (id !== pendingIdRef.current) return
      cacheRef.current = new Float32Array(heights)
      if (!readyRef.current) { readyRef.current = true; setReady(true) }
    }
    return () => { mounted = false; w.onmessage = null }
  }, [])

  useFrame((state) => {
    const fc = frameCountRef.current++

    if (fc % 4 === 0) {
      const t = state.clock.elapsedTime * 0.25
      const id = ++reqIdRef.current; pendingIdRef.current = id
      try { getWorker().postMessage({ id, w: W, h: H, t, s: 4.0 }) } catch {}
    }

    if (fc % 4 === 0 && ready) {
      const pos = geo.attributes.position
      const colors = geo.attributes.color
      const wpos = wireGeo.attributes.position
      const cache = cacheRef.current
      for (let i = 0; i < pos.count; i++) {
        const x = i % W; const y = Math.floor(i / W)
        const h = cache[y * W + x] * 1.4
        pos.setY(i, h)
        wpos.setY(i, h)
      }
      pos.needsUpdate = true; wpos.needsUpdate = true
      geo.computeVertexNormals()
      updateColors(pos, colors)
    }

    rotRef.current += 0.002 + scrollP * 0.003
    const yPos = -1.2 - scrollP * 1.5
    const zPos = -3.5 - scrollP * 0.5
    if (meshRef.current) {
      meshRef.current.position.y = yPos
      meshRef.current.position.z = zPos
      meshRef.current.rotation.y = rotRef.current
    }
    if (wireRef.current) {
      wireRef.current.position.y = yPos
      wireRef.current.position.z = zPos
      wireRef.current.rotation.y = rotRef.current
    }
  })

  return (
    <group>
      <mesh ref={meshRef} geometry={geo}>
        <meshPhysicalMaterial vertexColors metalness={0.05} roughness={0.85} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeo}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  )
}
