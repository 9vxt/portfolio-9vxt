import { useState, useEffect } from 'react'

const emojis = ['⚡', '🔧', '🚀', '⚙️', '🔬', '💻', '🧠', '🔮', '⚛️', '🌐', '🎯', '🔥', '💎', '🌀']

export default function FooterRandom() {
  const [emoji, setEmoji] = useState('⚡')
  useEffect(() => {
    const id = setInterval(() => setEmoji(emojis[Math.floor(Math.random() * emojis.length)]), 4000)
    return () => clearInterval(id)
  }, [])
  return <span className="inline-block ml-1 transition-none">{emoji}</span>
}
