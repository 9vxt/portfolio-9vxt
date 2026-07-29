import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const POS = [
  new THREE.Vector3(-2.2, 1.8, -0.5),
  new THREE.Vector3(2.4, -1.6, -0.8),
  new THREE.Vector3(-1.8, -2.0, -1.2),
  new THREE.Vector3(2.0, 1.4, -1.0),
  new THREE.Vector3(-2.6, 0.6, -1.5),
  new THREE.Vector3(2.8, 0.4, -1.8),
  new THREE.Vector3(-1.2, 2.4, -1.3),
]

const COLORS = ['#3b82f6', '#22d3ee', '#f59e0b', '#34d399', '#8b5cf6']

const GEOMS = [
  new THREE.TorusKnotGeometry(0.3, 0.1, 32, 8),
  new THREE.OctahedronGeometry(0.35),
  new THREE.DodecahedronGeometry(0.3),
  new THREE.TorusGeometry(0.35, 0.12, 12, 24),
  new THREE.TetrahedronGeometry(0.35),
  new THREE.ConeGeometry(0.3, 0.5, 6),
  new THREE.BoxGeometry(0.35, 0.35, 0.35),
]

const SOLID_GEOMS = [
  new THREE.IcosahedronGeometry(0.25),
  new THREE.OctahedronGeometry(0.2),
  new THREE.DodecahedronGeometry(0.2),
]
const SOLID_POS = [
  new THREE.Vector3(1.6, 2.2, -0.8),
  new THREE.Vector3(-2.4, -0.8, -1.6),
  new THREE.Vector3(0.8, -2.4, -1.0),
]

function Geo({ geom, pos, color, speed, mouseFactor = 1, wire = true }) {
  const ref = useRef()
  const off = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0
    const my = window._mouseY || 0
    const m = mouseFactor
    if (!ref.current) return
    ref.current.position.x = pos.x + mx * 0.3 * m + Math.sin(t * 0.3 * speed + off) * 0.3
    ref.current.position.y = pos.y + my * 0.3 * m + Math.cos(t * 0.4 * speed + off) * 0.3
    ref.current.position.z = pos.z + Math.sin(t * 0.2 * speed + off * 1.5) * 0.2
    ref.current.rotation.x += 0.005 * speed
    ref.current.rotation.y += 0.008 * speed
  })

  return (
    <mesh ref={ref}>
      <primitive object={geom} />
      {wire ? (
        <meshPhysicalMaterial color={color} wireframe transparent opacity={0.35} metalness={0.3} roughness={0.6} />
      ) : (
        <meshPhysicalMaterial color={color} transparent opacity={0.08} metalness={0.6} roughness={0.2} />
      )}
    </mesh>
  )
}

function CenterPiece() {
  const g = useRef()
  const w = useRef()
  const i = useRef()

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0
    const my = window._mouseY || 0
    ;[g, w, i].forEach((r) => {
      if (!r.current) return
      r.current.position.x = mx * 0.15
      r.current.position.y = my * 0.15
    })
    if (w.current) { w.current.rotation.x += 0.008; w.current.rotation.y += 0.012; w.current.rotation.z = Math.sin(t * 0.3) * 0.1 }
    if (i.current) { i.current.rotation.x = w.current?.rotation.x || 0; i.current.rotation.y = w.current?.rotation.y || 0 }
    if (g.current) { g.current.rotation.x += 0.008; g.current.rotation.y += 0.012 }
  })

  return (
    <group>
      <mesh ref={g} scale={1.7}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} />
      </mesh>
      <mesh ref={w}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.8} roughness={0.2} transparent opacity={0.3} wireframe emissive="#3b82f6" emissiveIntensity={0.1} />
      </mesh>
      <mesh ref={i}>
        <icosahedronGeometry args={[0.98, 0]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.9} roughness={0.1} transparent opacity={0.15} emissive="#3b82f6" emissiveIntensity={0.05} />
      </mesh>
    </group>
  )
}

function Rings() {
  const gr = useRef()
  const segments = 72

  const data = useMemo(() => {
    const cfg = [
      { r: 2.0, rx: 0, ry: 0, c: '#3b82f6', o: 0.2 },
      { r: 2.5, rx: Math.PI / 3.5, ry: Math.PI / 5, c: '#22d3ee', o: 0.15 },
      { r: 3.0, rx: Math.PI / 2.2, ry: Math.PI / 3, c: '#8b5cf6', o: 0.12 },
    ]
    return cfg.map((c) => {
      const pts = new Float32Array((segments + 1) * 3)
      for (let j = 0; j <= segments; j++) {
        const th = (j / segments) * Math.PI * 2
        pts[j * 3] = Math.cos(th) * c.r
        pts[j * 3 + 1] = Math.sin(th) * c.r
        pts[j * 3 + 2] = 0
      }
      return { ...c, pts }
    })
  }, [])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0
    const my = window._mouseY || 0
    if (!gr.current) return
    gr.current.rotation.x += 0.005 + mx * 0.002
    gr.current.rotation.y += 0.008 + my * 0.002
    gr.current.rotation.z = Math.sin(t * 0.15) * 0.05
  })

  return (
    <group ref={gr}>
      {data.map((d, i) => (
        <group key={i} rotation={[d.rx, d.ry, 0]}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={(segments + 1)} array={d.pts} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color={d.c} transparent opacity={d.o} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function Particles() {
  const count = 600
  const ref = useRef()
  const { pts, cols } = useMemo(() => {
    const p = new Float32Array(count * 3)
    const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 6
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      p[i * 3] = r * Math.sin(ph) * Math.cos(th)
      p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      p[i * 3 + 2] = r * Math.cos(ph)
      const cl = new THREE.Color().setHSL(0.58 + Math.random() * 0.12, 0.8, 0.5)
      c[i * 3] = cl.r; c[i * 3 + 1] = cl.g; c[i * 3 + 2] = cl.b
    }
    return { pts: p, cols: c }
  }, [])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0
    const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.y += 0.003 + mx * 0.001
    ref.current.rotation.x += 0.001 + my * 0.001
    ref.current.rotation.z = Math.sin(t * 0.1) * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pts} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={cols} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function CircuitLines() {
  const lines = useMemo(() => {
    const cfg = [
      { from: [-2, -1.5, -1], to: [0, -1.5, -1], c: '#3b82f6' },
      { from: [2, 1.5, -1], to: [0, 1.5, -1], c: '#22d3ee' },
      { from: [-1.5, 2, -0.5], to: [-1.5, 0, -0.5], c: '#8b5cf6' },
      { from: [1.5, -2, -0.5], to: [1.5, 0, -0.5], c: '#34d399' },
    ]
    return cfg.map((c) => ({
      pts: new Float32Array([c.from[0], c.from[1], c.from[2], c.to[0], c.to[1], c.to[2]]),
      color: c.c,
    }))
  }, [])

  const ref = useRef()
  useFrame((st) => {
    const t = st.clock.elapsedTime
    if (!ref.current) return
    ref.current.position.x = Math.sin(t * 0.2) * 0.1
    ref.current.position.y = Math.cos(t * 0.15) * 0.1
  })

  return (
    <group ref={ref}>
      {lines.map((l, i) => (
        <lineSegments key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={2} array={l.pts} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={l.color} transparent opacity={0.15} />
        </lineSegments>
      ))}
    </group>
  )
}

export default function Scene3D() {
  useEffect(() => {
    window._mouseX = 0
    window._mouseY = 0
    const onMove = (e) => {
      window._mouseX = (e.clientX / window.innerWidth) * 2 - 1
      window._mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />

      <Particles />
      <CircuitLines />
      <CenterPiece />
      <Rings />

      {GEOMS.map((g, i) => (
        <Geo key={i} geom={g} pos={POS[i]} color={COLORS[i % COLORS.length]} speed={0.7 + i * 0.1} mouseFactor={0.4 + i * 0.07} />
      ))}
      {SOLID_GEOMS.map((g, i) => (
        <Geo key={`s${i}`} geom={g} pos={SOLID_POS[i]} color={COLORS[i + 1]} speed={0.5 + i * 0.1} mouseFactor={0.3} wire={false} />
      ))}
    </>
  )
}
