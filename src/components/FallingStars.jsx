import { useEffect, useRef } from 'react'
import { getSeasonPalette } from '../lib/seasons'

// Pioggia di stelle lenta, in loop continuo dall'alto verso il basso.
// Diversa dallo StarCanvas della home (che è statico/pulsante): qui il
// movimento è il punto — pensato per lo sfondo del timer su schermi stretti.
export default function FallingStars({ running = true, style = {} }) {
  const canvasRef = useRef(null)
  const starsRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dustRGB = getSeasonPalette().dustRGB

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    if (starsRef.current.length === 0) {
      starsRef.current = Array.from({ length: 90 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.00035 + 0.00015, // frazione di altezza al frame — molto lento
        o: Math.random() * 0.5 + 0.3,
      }))
    }

    let animating = true
    function draw() {
      if (!animating) return
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      starsRef.current.forEach(s => {
        if (running) {
          s.y += s.speed
          if (s.y > 1) s.y -= 1
        }
        const x = s.x * w
        const y = s.y * h
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dustRGB},${s.o})`
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      animating = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [running])

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', ...style }} />
  )
}