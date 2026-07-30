import { useCallback, useRef, useState } from 'react'

export default function useOnScreen(threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef()

  const ref = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold }
    )
    obs.observe(node)
    observerRef.current = obs
  }, [threshold])

  return [ref, visible]
}
