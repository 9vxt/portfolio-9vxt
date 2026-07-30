import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import WasmTerrain from './WasmTerrain'

const mouseRef = { x: 0, y: 0 }

const vertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;
void main() {
  vec3 pos = position;
  float n = sin(pos.x*4.0+uTime)*cos(pos.y*4.0+uTime*0.7)*sin(pos.z*4.0+uTime*1.3);
  pos += normal * n * 0.06 * uIntensity;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vPosition = mv.xyz;
  vec3 v = normalize(-mv.xyz);
  vFresnel = 1.0 - max(abs(dot(v, normalize(normalMatrix * normal))), 0.0);
  gl_Position = projectionMatrix * mv;
}`

const fragmentShader = `
uniform float uTime;
uniform float uScroll;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;
void main() {
  vec3 c1 = mix(uColor1, vec3(0.53, 0.15, 0.96), uScroll);
  vec3 c2 = mix(uColor2, vec3(0.93, 0.51, 0.93), uScroll);
  vec3 col = mix(c1, c2, vFresnel);
  col += vec3(0.1, 0.5, 0.8) * pow(vFresnel, 2.0) * 0.6;
  float a = 0.15 + vFresnel * 0.35;
  gl_FragColor = vec4(col, a);
}`

function IcosahedronShader({ scrollP }) {
  const meshRef = useRef()
  const innerRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uScroll: { value: 0 },
    uColor1: { value: new THREE.Color('#3b82f6') },
    uColor2: { value: new THREE.Color('#22d3ee') },
  }), [])

  const { outerGeo, innerGeo } = useMemo(() => ({
    outerGeo: new THREE.IcosahedronGeometry(1, 1),
    innerGeo: new THREE.IcosahedronGeometry(1, 0),
  }), [])

  useEffect(() => () => { outerGeo.dispose(); innerGeo.dispose() }, [outerGeo, innerGeo])

  useFrame((st, delta) => {
    const t = st.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uScroll.value = scrollP
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (0.3 + scrollP * 0.4)
      meshRef.current.rotation.y += delta * (0.5 + scrollP * 0.6)
      const s = 1 + scrollP * 0.3
      meshRef.current.scale.setScalar(s)
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = meshRef.current?.rotation.x ?? 0
      innerRef.current.rotation.y = meshRef.current?.rotation.y ?? 0
    }
  })

  return (
    <group position={[mouseRef.x * 0.15, 0.4 - scrollP * 0.3 + mouseRef.y * 0.12, mouseRef.x * 0.1]}>
      <mesh ref={meshRef} geometry={outerGeo}>
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader}
          fragmentShader={fragmentShader} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={innerRef} scale={1.25} geometry={innerGeo}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.10} />
      </mesh>
    </group>
  )
}

function TorusSpiral({ scrollP }) {
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const count = 18
    const pts = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2
      const r = 2.0 + Math.sin(th * 3) * 0.3
      pts[i*3] = Math.cos(th) * r
      pts[i*3+1] = Math.sin(th * 2) * 0.4
      pts[i*3+2] = Math.sin(th) * r
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    return { geo: g, mat: new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.15 }) }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((st, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * (0.3 + mouseRef.x * 0.1 + scrollP * 0.2)
    ref.current.rotation.y += delta * (0.5 + mouseRef.y * 0.1 + scrollP * 0.3)
    mat.opacity = 0.15 + scrollP * 0.1
  })

  return <line ref={ref} geometry={geo} material={mat} position={[mouseRef.x * 0.1, 0.4 - scrollP * 0.3, mouseRef.y * 0.08]} />
}

function FloatGeo({ geom, pos, color, speed = 1, mf = 1, wire = true, scrollP = 0 }) {
  const ref = useRef()
  const off = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((st, delta) => {
    if (!ref.current) return
    const t = st.clock.elapsedTime
    const s = scrollP
    ref.current.position.x = pos.x + mouseRef.x * 0.3 * mf + Math.sin(t * 0.3 * speed + off) * 0.35
    ref.current.position.y = pos.y - s * 1.5 + mouseRef.y * 0.3 * mf + Math.cos(t * 0.4 * speed + off) * 0.35
    ref.current.position.z = pos.z - s * 0.5 + Math.sin(t * 0.2 * speed + off * 1.5) * 0.25
    ref.current.rotation.x += delta * 0.5 * speed
    ref.current.rotation.y += delta * 0.8 * speed
  })

  return (
    <mesh ref={ref} geometry={geom}>
      {wire ? (
        <meshPhysicalMaterial color={color} wireframe transparent opacity={0.2} metalness={0.3} roughness={0.6} />
      ) : (
        <meshPhysicalMaterial color={color} transparent opacity={0.04} metalness={0.6} roughness={0.2} />
      )}
    </mesh>
  )
}

function ShaderParticles({ scrollP }) {
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const count = 600
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 5; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.sin(ph) * Math.sin(th); p[i*3+2] = r * Math.cos(ph)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return { geo: g, mat: new THREE.PointsMaterial({ size: 0.02, color: '#3b82f6', transparent: true, opacity: 0.2, sizeAttenuation: true, blending: THREE.AdditiveBlending }) }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((st, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * (0.1 + mouseRef.x * 0.03 + scrollP * 0.1)
    ref.current.rotation.x += delta * (0.05 + mouseRef.y * 0.03 + scrollP * 0.05)
    mat.size = 0.02 + scrollP * 0.01
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

function Rings({ scrollP }) {
  const gr = useRef()
  const seg = 80
  const { items } = useMemo(() => {
    const raw = [
      { r: 1.6, rx: 0, ry: 0, c: '#3b82f6', o: 0.12 },
      { r: 2.0, rx: Math.PI / 3.5, ry: Math.PI / 5, c: '#22d3ee', o: 0.08 },
      { r: 2.4, rx: Math.PI / 2.2, ry: Math.PI / 3, c: '#8b5cf6', o: 0.06 },
    ]
    const mats = []
    return {
      items: raw.map(c => {
        const pts = new Float32Array((seg + 1) * 3)
        for (let j = 0; j <= seg; j++) { const th = (j / seg) * Math.PI * 2; pts[j*3] = Math.cos(th) * c.r; pts[j*3+1] = Math.sin(th) * c.r; pts[j*3+2] = 0 }
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
        const m = new THREE.LineBasicMaterial({ color: c.c, transparent: true, opacity: c.o })
        mats.push(m)
        return { ...c, geo: g, mat: m, rx: c.rx, ry: c.ry }
      }),
      materials: mats,
    }
  }, [seg])

  useEffect(() => () => { items.forEach(i => { i.geo.dispose(); i.mat.dispose() }) }, [items])

  useFrame((st, delta) => {
    if (!gr.current) return
    gr.current.rotation.x += delta * (0.2 + mouseRef.x * 0.08 + scrollP * 0.2)
    gr.current.rotation.y += delta * (0.4 + mouseRef.y * 0.08 + scrollP * 0.3)
  })

  return (
    <group ref={gr} position={[0, 0.4 - scrollP * 0.3, 0]}>
      {items.map((d, i) => (
        <group key={i} rotation={[d.rx, d.ry, 0]}>
          <line geometry={d.geo} material={d.mat} />
        </group>
      ))}
    </group>
  )
}

const COLORS = ['#3b82f6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b']

function OrbitingShapes() {
  const groupRef = useRef()
  const items = useMemo(() => {
    const constructors = [
      () => new THREE.TorusKnotGeometry(0.08, 0.03, 12, 6),
      () => new THREE.IcosahedronGeometry(0.07),
      () => new THREE.OctahedronGeometry(0.07),
      () => new THREE.TetrahedronGeometry(0.07),
      () => new THREE.DodecahedronGeometry(0.06),
      () => new THREE.TorusGeometry(0.08, 0.03, 8, 12),
    ]
    return Array.from({ length: 28 }, (_, i) => {
      const th = (i / 28) * Math.PI * 2
      const r = 2.2 + Math.sin(i * 0.7) * 0.6
      return {
        base: new THREE.Vector3(Math.cos(th) * r, Math.sin(th * 1.3 + i * 0.2) * 1.2, Math.sin(th) * r * 0.6),
        geo: constructors[i % constructors.length](),
        color: COLORS[i % COLORS.length],
        speed: 0.25 + Math.random() * 0.35,
        off: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [])

  useEffect(() => () => items.forEach(i => i.geo.dispose()), [items])

  useFrame((st, delta) => {
    if (!groupRef.current) return
    const t = st.clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const item = items[i]
      child.position.x = item.base.x + mouseRef.x * 0.6 + Math.sin(t * item.speed + item.off) * 0.15
      child.position.y = item.base.y + mouseRef.y * 0.6 + Math.cos(t * 0.7 * item.speed + item.off) * 0.15
      child.position.z = item.base.z + Math.sin(t * 0.5 * item.speed + item.phase) * 0.12
      child.rotation.x += delta * 0.8 * item.speed
      child.rotation.y += delta * 1.2 * item.speed
    })
  })

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i} geometry={item.geo}>
          <meshPhysicalMaterial color={item.color} emissive={item.color} emissiveIntensity={0.1} transparent opacity={0.2} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function HelixTube() {
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const count = 160
    const pts = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 5
      const r = 1.3 + Math.sin(t * 0.3) * 0.15
      pts[i*3] = Math.cos(t) * r
      pts[i*3+1] = (i / count - 0.5) * 3.0
      pts[i*3+2] = Math.sin(t) * r
      cols[i*3] = 0.23 + Math.sin(t) * 0.1; cols[i*3+1] = 0.5 + Math.cos(t * 0.7) * 0.15; cols[i*3+2] = 0.9 + Math.sin(t * 0.5) * 0.1
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    return { geo: g, mat: new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2 }) }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((st, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += mouseRef.y * delta * 3
    ref.current.rotation.y += delta * (0.4 + mouseRef.x * 0.2)
  })

  return <line ref={ref} geometry={geo} material={mat} position={[mouseRef.x * 0.12, 0.3, mouseRef.y * 0.1]} />
}

function InteractiveStars() {
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const count = 120
    const p = new Float32Array(count * 3); const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 3.0
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.sin(ph) * Math.sin(th); p[i*3+2] = r * Math.cos(ph)
      c[i*3] = 0.2 + Math.random() * 0.3; c[i*3+1] = 0.5 + Math.random() * 0.4; c[i*3+2] = 0.8 + Math.random() * 0.2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    return { geo: g, mat: new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.35, sizeAttenuation: true, blending: THREE.AdditiveBlending }) }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = mouseRef.x * 0.4
    ref.current.rotation.x = mouseRef.y * 0.25
    ref.current.position.y = 0.2 + mouseRef.y * 0.2
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

export default function Scene3D({ scrollP = 0, minimal = false }) {
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const floatItems = useMemo(() => {
    const pos = [
      new THREE.Vector3(-2.2, 1.8, -0.5), new THREE.Vector3(2.4, -1.6, -0.8),
      new THREE.Vector3(-1.8, -2.0, -1.2), new THREE.Vector3(2.0, 1.4, -1.0),
      new THREE.Vector3(-2.6, 0.6, -1.5), new THREE.Vector3(2.8, 0.4, -1.8),
      new THREE.Vector3(-1.2, 2.4, -1.3),
    ]
    const geoms = [
      new THREE.TorusKnotGeometry(0.3, 0.1, 20, 6), new THREE.OctahedronGeometry(0.35),
      new THREE.DodecahedronGeometry(0.3), new THREE.TorusGeometry(0.35, 0.12, 8, 16),
      new THREE.TetrahedronGeometry(0.35), new THREE.ConeGeometry(0.3, 0.5, 6),
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
    ]
    const solidPos = [new THREE.Vector3(1.6, 2.2, -0.8), new THREE.Vector3(-2.4, -0.8, -1.6), new THREE.Vector3(0.8, -2.4, -1.0)]
    const solidGeoms = [new THREE.IcosahedronGeometry(0.25), new THREE.OctahedronGeometry(0.2), new THREE.DodecahedronGeometry(0.2)]
    return { pos, geoms, solidPos, solidGeoms, geomsAll: [...geoms, ...solidGeoms] }
  }, [])

  useEffect(() => () => {
    floatItems.geomsAll.forEach(g => g.dispose())
  }, [floatItems])

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      <directionalLight position={[-5, -5, -5]} intensity={0.15} color="#3b82f6" />
      {minimal ? (
        <WasmTerrain scrollP={scrollP} />
      ) : (
        <>
          <ShaderParticles scrollP={scrollP} />
          <IcosahedronShader scrollP={scrollP} />
          <Rings scrollP={scrollP} />
          <TorusSpiral scrollP={scrollP} />
          <HelixTube />
          <OrbitingShapes />
          <InteractiveStars />
          <WasmTerrain scrollP={scrollP} />
          {floatItems.geoms.map((g, i) => (<FloatGeo key={i} geom={g} pos={floatItems.pos[i]} color={COLORS[i % COLORS.length]} speed={0.7 + i * 0.1} mf={0.4 + i * 0.07} scrollP={scrollP} />))}
          {floatItems.solidGeoms.map((g, i) => (<FloatGeo key={`s${i}`} geom={g} pos={floatItems.solidPos[i]} color={COLORS[i + 1]} speed={0.5 + i * 0.1} mf={0.3} wire={false} scrollP={scrollP} />))}
        </>
      )}
    </>
  )
}
