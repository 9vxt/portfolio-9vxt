import { useEffect, useRef, useState } from 'react'

export default function useOnScreen(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}
