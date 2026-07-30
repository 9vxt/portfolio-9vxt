import { useState, useEffect } from 'react'

const mq = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)') : null

export default function useIsMobile() {
  const [mobile, setMobile] = useState(() => mq ? mq.matches : false)

  useEffect(() => {
    if (!mq) return
    const handler = () => setMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return mobile
}
