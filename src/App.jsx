import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Learning from './components/Learning'
import Projects from './components/Projects'
import WasmDemo from './components/WasmDemo'
import WebGPUDemo from './components/WebGPUDemo'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FpsMonitor from './components/FpsMonitor'
import ScrollProgress from './components/ScrollProgress'
import CursorGlow from './components/CursorGlow'
import Scene3D from './components/Scene3D'
import ShowcaseWall from './components/ShowcaseWall'
import SplashScreen from './components/SplashScreen'
import ShutdownScreen from './components/ShutdownScreen'
import GlobalGlitch, { GlitchToggle } from './components/GlobalGlitch'
import ClickParticles from './components/ClickParticles'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'
import DynamicTitle from './components/DynamicTitle'
import ConsoleArt from './components/ConsoleArt'
import SectionReveal from './components/SectionReveal'
import SoundToggle from './components/SoundEngine'
import { onShutdown } from './lib/shutdown'

export default function App() {
  const [booted, setBooted] = useState(false)
  const [shutdown, setShutdown] = useState(false)
  const [closing, setClosing] = useState(false)
  const [glitchOn, setGlitchOn] = useState(true)
  const [scrollP, setScrollP] = useState(0)
  const scrollRaf = useRef(null)

  useEffect(() => {
    let shutdownTimer
    onShutdown(() => {
      setClosing(true)
      shutdownTimer = setTimeout(() => { setClosing(false); setShutdown(true) }, 1200)
    })
    return () => clearTimeout(shutdownTimer)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
      scrollRaf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setScrollP(max > 0 ? window.scrollY / max : 0)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(scrollRaf.current) }
  }, [])

  return (
    <ErrorBoundary>
      {!booted && <SplashScreen onFinish={() => setBooted(true)} />}
      {shutdown && <ShutdownScreen onClose={() => { setClosing(false); setShutdown(false); setBooted(false) }} />}
      <div className={`bg-[#080c14] text-[#f1f5f9] min-h-screen scanlines transition-all duration-[1200ms] ease-in-out ${
        closing ? 'opacity-0 scale-[0.97] pointer-events-none overflow-hidden' : ''
      }`}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
            <Scene3D scrollP={scrollP} />
          </Canvas>
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <About />
          <Skills />
          <Learning />
          <Projects />
          <ShowcaseWall />
          <WasmDemo />
          <WebGPUDemo />
          <Contact />
          <Footer />
        </div>

        <FpsMonitor />
        <ScrollProgress />
        <CursorGlow />
        <SoundToggle />
        <GlobalGlitch enabled={glitchOn} />
        <ClickParticles />
        <ScrollToTop />
        <Toast />
        <DynamicTitle />
        <ConsoleArt />
        <SectionReveal />
        <GlitchToggle enabled={glitchOn} onToggle={() => setGlitchOn(p => !p)} />
      </div>
    </ErrorBoundary>
  )
}
