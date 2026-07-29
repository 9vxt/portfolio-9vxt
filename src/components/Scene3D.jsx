import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import WasmTerrain from './WasmTerrain'

const COLORS = ['#3b82f6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b']

function FloatGeo({ geom, pos, color, speed = 1, mouseFactor = 1, wire = true }) {
  const ref = useRef()
  const off = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0
    const my = window._mouseY || 0
    if (!ref.current) return
    const m = mouseFactor
    ref.current.position.x = pos.x + mx * 0.35 * m + Math.sin(t * 0.3 * speed + off) * 0.4
    ref.current.position.y = pos.y + my * 0.35 * m + Math.cos(t * 0.4 * speed + off) * 0.4
    ref.current.position.z = pos.z + Math.sin(t * 0.2 * speed + off * 1.5) * 0.3
    ref.current.rotation.x += 0.006 * speed
    ref.current.rotation.y += 0.009 * speed
  })
  return (
    <mesh ref={ref}>
      <primitive object={geom} />
      {wire ? (
        <meshPhysicalMaterial color={color} wireframe transparent opacity={0.3} metalness={0.3} roughness={0.6} />
      ) : (
        <meshPhysicalMaterial color={color} transparent opacity={0.06} metalness={0.6} roughness={0.2} />
      )}
    </mesh>
  )
}

function CenterPiece() {
  const g = useRef(); const w = useRef(); const i = useRef()
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    ;[g, w, i].forEach(r => { if (r.current) { r.current.position.x = mx * 0.12; r.current.position.y = my * 0.12 } })
    if (w.current) { w.current.rotation.x += 0.006; w.current.rotation.y += 0.01; w.current.rotation.z = Math.sin(t * 0.25) * 0.08 }
    if (i.current) { i.current.rotation.x = w.current?.rotation.x || 0; i.current.rotation.y = w.current?.rotation.y || 0 }
    if (g.current) { g.current.rotation.x += 0.006; g.current.rotation.y += 0.01 }
  })
  return (
    <group position={[0, 0.5, 0]}>
      <mesh ref={g} scale={1.5}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.04} />
      </mesh>
      <mesh ref={w}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.8} roughness={0.2} transparent opacity={0.25} wireframe emissive="#3b82f6" emissiveIntensity={0.08} />
      </mesh>
      <mesh ref={i}>
        <icosahedronGeometry args={[0.96, 0]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.9} roughness={0.1} transparent opacity={0.1} emissive="#3b82f6" emissiveIntensity={0.03} />
      </mesh>
    </group>
  )
}

function Rings() {
  const gr = useRef()
  const seg = 72
  const data = useMemo(() => [
    { r: 1.8, rx: 0, ry: 0, c: '#3b82f6', o: 0.18 },
    { r: 2.2, rx: Math.PI / 3.5, ry: Math.PI / 5, c: '#22d3ee', o: 0.13 },
    { r: 2.7, rx: Math.PI / 2.2, ry: Math.PI / 3, c: '#8b5cf6', o: 0.1 },
  ].map(c => { const pts = new Float32Array((seg + 1) * 3); for (let j = 0; j <= seg; j++) { const th = (j / seg) * Math.PI * 2; pts[j * 3] = Math.cos(th) * c.r; pts[j * 3 + 1] = Math.sin(th) * c.r; pts[j * 3 + 2] = 0 } return { ...c, pts } }), [])
  useFrame((st) => {
    const t = st.clock.elapsedTime; const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!gr.current) return
    gr.current.rotation.x += 0.004 + mx * 0.0015; gr.current.rotation.y += 0.006 + my * 0.0015; gr.current.rotation.z = Math.sin(t * 0.12) * 0.04
  })
  return (
    <group ref={gr} position={[0, 0.5, 0]}>
      {data.map((d, i) => (
        <group key={i} rotation={[d.rx, d.ry, 0]}>
          <lineSegments>
            <bufferGeometry><bufferAttribute attach="attributes-position" count={seg + 1} array={d.pts} itemSize={3} /></bufferGeometry>
            <lineBasicMaterial color={d.c} transparent opacity={d.o} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function Particles() {
  const count = 800; const ref = useRef()
  const { pts, cols } = useMemo(() => {
    const p = new Float32Array(count * 3); const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      p[i * 3] = r * Math.sin(ph) * Math.cos(th); p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); p[i * 3 + 2] = r * Math.cos(ph)
      const cl = new THREE.Color().setHSL(0.58 + Math.random() * 0.12, 0.8, 0.5)
      c[i * 3] = cl.r; c[i * 3 + 1] = cl.g; c[i * 3 + 2] = cl.b
    }
    return { pts: p, cols: c }
  }, [])
  useFrame((st) => {
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.y += 0.002 + mx * 0.0008; ref.current.rotation.x += 0.001 + my * 0.0008
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pts} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={cols} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

const POS = [
  new THREE.Vector3(-2.4, 2.0, -0.5), new THREE.Vector3(2.6, -1.8, -0.8),
  new THREE.Vector3(-2.0, -2.2, -1.2), new THREE.Vector3(2.2, 1.6, -1.0),
  new THREE.Vector3(-2.8, 0.8, -1.5), new THREE.Vector3(3.0, 0.5, -1.8),
  new THREE.Vector3(-1.4, 2.6, -1.3),
]
const GEOMS = [
  new THREE.TorusKnotGeometry(0.35, 0.12, 32, 8), new THREE.OctahedronGeometry(0.4),
  new THREE.DodecahedronGeometry(0.35), new THREE.TorusGeometry(0.4, 0.14, 12, 24),
  new THREE.TetrahedronGeometry(0.4), new THREE.ConeGeometry(0.35, 0.55, 6),
  new THREE.BoxGeometry(0.4, 0.4, 0.4),
]
const SOLID_POS = [new THREE.Vector3(1.8, 2.4, -0.8), new THREE.Vector3(-2.6, -1.0, -1.6), new THREE.Vector3(1.0, -2.6, -1.0)]
const SOLID_GEOMS = [new THREE.IcosahedronGeometry(0.3), new THREE.OctahedronGeometry(0.25), new THREE.DodecahedronGeometry(0.25)]

export default function Scene3D() {
  useEffect(() => {
    window._mouseX = 0; window._mouseY = 0
    const onMove = (e) => { window._mouseX = (e.clientX / window.innerWidth) * 2 - 1; window._mouseY = -(e.clientY / window.innerHeight) * 2 + 1 }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <directionalLight position={[-5, -5, -5]} intensity={0.2} color="#3b82f6" />

      <Particles />
      <CenterPiece />
      <Rings />

      <WasmTerrain />

      {GEOMS.map((g, i) => (
        <FloatGeo key={i} geom={g} pos={POS[i]} color={COLORS[i % COLORS.length]} speed={0.7 + i * 0.1} mouseFactor={0.4 + i * 0.07} />
      ))}
      {SOLID_GEOMS.map((g, i) => (
        <FloatGeo key={`s${i}`} geom={g} pos={SOLID_POS[i]} color={COLORS[i + 1]} speed={0.5 + i * 0.1} mouseFactor={0.3} wire={false} />
      ))}

      <group position={[0, 2.5, -4]}>
        <mesh>
          <planeGeometry args={[10, 2]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  )
}
