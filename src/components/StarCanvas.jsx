import { useEffect, useRef } from 'react'
import { getSeasonPalette } from '../lib/seasons'
import { C } from '../lib/theme'

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export default function StarCanvas({
  passedExams = [],
  totalStudyMinutes = 0,
  onStarClick = null,
  style = {},
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dustRGB = getSeasonPalette().dustRGB

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    // Background dust — seeded so non salta a ogni re-render. La quantità
    // cresce con il tempo di studio REALE (non con il numero di sessioni),
    // con una curva a radice quadrata: crescita ben visibile nelle prime
    // ore, poi rallenta per restare leggera anche dopo mesi di utilizzo.
    const rand = seededRandom(42)
    const dustCount = Math.round(80 + Math.min(Math.sqrt(Math.max(totalStudyMinutes, 0)) * 25, 500))
    const dust = Array.from({ length: dustCount }, () => ({
      x: rand() * W(),
      y: rand() * H(),
      r: rand() * 1.1 + 0.2,
      o: rand() * 0.35 + 0.05,
      speed: rand() * 0.003 + 0.001,
      phase: rand() * Math.PI * 2,
    }))

    // Map passed exams to star positions — SPIRALE VISIBILE. L'angolo aureo
    // (137.5° a salto) funziona benissimo con centinaia di punti — un
    // girasole — ma con poche decine di stelle salta troppo da un lato
    // all'altro del cerchio e non si legge affatto come spirale (è quello
    // che si vedeva nello screenshot). Qui invece ogni stella avanza di un
    // angolo piccolo e costante, così le stelle successive restano vicine
    // lungo un braccio che si allontana gradualmente dal centro — una vera
    // spirale a colpo d'occhio, leggibile anche con solo 5-6 stelle.
    const dim = Math.min(W(), H())
    const STEP_ANGLE = (Math.PI * 2) / 6.5 // ~55° per stella: un braccio visibile, non un salto
    const maxOrbit = dim * 0.42
    const examStars = passedExams.map((e, i) => {
      const r2 = seededRandom(e.id || i + 1)
      const angle = i * STEP_ANGLE
      const orbitR = Math.min(dim * 0.07 + dim * 0.065 * i, maxOrbit)
      const cx = W() / 2
      const cy = H() * 0.56
      const baseX = cx + Math.cos(angle) * orbitR
      const baseY = cy + Math.sin(angle) * orbitR
      // Jitter minimo: la spirale è già organica di suo, non serve
      // "rompere" la forma quanto serviva con il vecchio layout ad anelli.
      const jitter = (r2() - 0.5) * dim * 0.03
      const jitter2 = (r2() - 0.5) * dim * 0.03
      return {
        x: baseX + jitter,
        y: baseY + jitter2,
        r: 1.8 + (e.cfu / 8) + Math.max(0, (e.grade - 18)) * 0.12,
        glowR: 6 + Math.max(0, (e.grade - 18)) * 0.7,
        name: e.name,
        grade: e.grade,
        isLode: e.grade === 31,
        phase: r2() * Math.PI * 2,
        speed: r2() * 0.02 + 0.015,
        examRef: e,
      }
    })

    let t = 0
    let animating = true

    function draw() {
      if (!animating) return
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)

      // Dust
      dust.forEach(d => {
        const pulse = 0.6 + 0.4 * Math.sin(t * d.speed + d.phase)
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dustRGB},${d.o * pulse})`
        ctx.fill()
      })

      // Constellation lines
      if (examStars.length >= 2) {
        ctx.save()
        for (let i = 0; i < examStars.length - 1; i++) {
          const a = examStars[i], b = examStars[i + 1]
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
          grad.addColorStop(0, `rgba(${C.accentRGB},0.22)`)
          grad.addColorStop(1, `rgba(${C.accentRGB},0.08)`)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = grad
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
        ctx.restore()
      }

      // Stars
      examStars.forEach(s => {
        const pulse = 0.88 + 0.12 * Math.sin(t * s.speed + s.phase)

        // Supernova — solo per il 30 e lode: raggi che ruotano lentamente
        // dietro alla stella, oltre al bagliore dorato già presente.
        if (s.isLode) {
          const spikes = 6
          const spin = t * 0.0025 + s.phase
          const spikeLen = s.glowR * (4.2 + 0.5 * Math.sin(t * 0.02 + s.phase))
          ctx.save()
          ctx.translate(s.x, s.y)
          ctx.rotate(spin)
          for (let i = 0; i < spikes; i++) {
            ctx.rotate((Math.PI * 2) / spikes)
            const grad = ctx.createLinearGradient(0, 0, spikeLen, 0)
            grad.addColorStop(0, 'rgba(245,200,66,0.28)')
            grad.addColorStop(1, 'rgba(245,200,66,0)')
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(spikeLen, -1.1)
            ctx.lineTo(spikeLen, 1.1)
            ctx.closePath()
            ctx.fillStyle = grad
            ctx.fill()
          }
          ctx.restore()
        }

        // Outer glow
        const outerGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowR * 3.5)
        outerGrad.addColorStop(0, `rgba(180,160,255,${0.45 * pulse})`)
        outerGrad.addColorStop(0.4, `rgba(124,110,247,${0.18 * pulse})`)
        outerGrad.addColorStop(1, 'rgba(124,110,247,0)')
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.glowR * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = outerGrad
        ctx.fill()

        // Inner glow
        const innerGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowR)
        innerGrad.addColorStop(0, `rgba(255,252,240,${0.9 * pulse})`)
        innerGrad.addColorStop(1, 'rgba(200,160,255,0)')
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.glowR, 0, Math.PI * 2)
        ctx.fillStyle = innerGrad
        ctx.fill()

        // Star core
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = s.isLode ? '#fff8c0' : '#f0ecff'
        ctx.shadowBlur = 12
        ctx.shadowColor = s.isLode ? '#f5c842' : '#a090ff'
        ctx.fill()
        ctx.shadowBlur = 0
      })

      t++
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    // Click su una stella → richiama onStarClick con l'esame originale.
    // Le coordinate del click (offsetX/Y) sono già in pixel CSS, comparabili
    // direttamente con x/y calcolate sopra usando W()/H().
    function handleClick(ev) {
      if (!onStarClick || examStars.length === 0) return
      const cx = ev.offsetX, cy = ev.offsetY
      let closest = null
      let closestDist = Infinity
      examStars.forEach(s => {
        const d = Math.hypot(s.x - cx, s.y - cy)
        const hitRadius = Math.max(s.glowR + 12, 18)
        if (d <= hitRadius && d < closestDist) {
          closest = s
          closestDist = d
        }
      })
      if (closest) onStarClick(closest.examRef)
    }
    function handleMove(ev) {
      if (!onStarClick || examStars.length === 0) return
      const cx = ev.offsetX, cy = ev.offsetY
      const hit = examStars.some(s => Math.hypot(s.x - cx, s.y - cy) <= Math.max(s.glowR + 12, 18))
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }
    if (onStarClick) {
      canvas.addEventListener('click', handleClick)
      canvas.addEventListener('mousemove', handleMove)
    }

    return () => {
      animating = false
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      if (onStarClick) {
        canvas.removeEventListener('click', handleClick)
        canvas.removeEventListener('mousemove', handleMove)
      }
    }
  }, [passedExams, totalStudyMinutes, onStarClick])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  )
}