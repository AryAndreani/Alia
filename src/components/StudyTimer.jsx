import { useState, useEffect, useRef, useCallback } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Button } from './UI'
import TimerBackground from './TimerBackground'
import { primeAudio, playWorkChime, playBreakChime } from '../lib/sound'
import useIsWide from '../lib/useIsWide'

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const TIMER_MODES = {
  freeform: { label: 'Libero', workSecs: null, breakSecs: null },
  pomodoro25: { label: 'Pomodoro 25/5', workSecs: 25 * 60, breakSecs: 5 * 60 },
  pomodoro50: { label: 'Pomodoro 50/10', workSecs: 50 * 60, breakSecs: 10 * 60 },
}

export default function StudyTimer({ onClose }) {
  const { exams, addSession } = useApp()
  const isWide = useIsWide()
  const [phase, setPhase] = useState('select') // select | running | paused | done
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [timerMode, setTimerMode] = useState('freeform')
  const [subPhase, setSubPhase] = useState('work') // 'work' | 'break' — solo per pomodoro
  const [elapsed, setElapsed] = useState(0) // secondi nel segmento corrente
  const [workSecondsTotal, setWorkSecondsTotal] = useState(0) // studio effettivo accumulato
  const [finalSeconds, setFinalSeconds] = useState(0)
  const intervalRef = useRef(null)

  // Sollevato qui (invece che dentro TimerBackground) perché lo styling
  // della card dei controlli dipende da "c'è davvero un video sotto?".
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Trascinamento della card (solo desktop/tablet) — nessun ridimensionamento,
  // solo uno spostamento libero via pointer events, con la maniglia in alto.
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 })

  const onDragStart = (e) => {
    if (!isWide) return
    dragState.current = {
      dragging: true,
      startX: e.clientX, startY: e.clientY,
      origX: dragPos.x, origY: dragPos.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e) => {
    if (!dragState.current.dragging) return
    setDragPos({
      x: dragState.current.origX + (e.clientX - dragState.current.startX),
      y: dragState.current.origY + (e.clientY - dragState.current.startY),
    })
  }
  const onDragEnd = () => { dragState.current.dragging = false }

  const unpassed = exams.filter(e => !e.passed)
  const mode = TIMER_MODES[timerMode]
  const isPomodoro = timerMode !== 'freeform'
  const target = isPomodoro ? (subPhase === 'work' ? mode.workSecs : mode.breakSecs) : null

  const start = () => {
    if (!selectedExamId) return
    primeAudio()
    setPhase('running')
    setSubPhase('work')
    setElapsed(0)
    setWorkSecondsTotal(0)
  }

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase])

  // Passaggio automatico studio ↔ pausa nella modalità pomodoro
  useEffect(() => {
    if (phase !== 'running' || !isPomodoro || target == null) return
    if (elapsed >= target) {
      if (subPhase === 'work') {
        setWorkSecondsTotal(w => w + target)
        setSubPhase('break')
        playBreakChime()
      } else {
        setSubPhase('work')
        playWorkChime()
      }
      setElapsed(0)
    }
  }, [elapsed, phase, isPomodoro, subPhase, target])

  const pause = () => setPhase('paused')
  const resume = () => setPhase('running')

  const finish = useCallback(() => {
    clearInterval(intervalRef.current)
    const studied = isPomodoro
      ? workSecondsTotal + (subPhase === 'work' ? elapsed : 0)
      : elapsed
    addSession(selectedExamId, studied)
    setFinalSeconds(studied)
    setPhase('done')
  }, [selectedExamId, elapsed, workSecondsTotal, subPhase, isPomodoro, addSession])

  const selectedExam = exams.find(e => e.id === selectedExamId)
  const progress = isPomodoro
    ? (target ? Math.min(elapsed / target, 1) : 0)
    : Math.min(elapsed / (90 * 60), 1) // 90min target di riferimento per il libero
  const circumference = 2 * Math.PI * 94
  const isBreak = isPomodoro && subPhase === 'break'
  const ringColor = isBreak ? C.gold : C.accent

  const phaseLabel = phase === 'paused'
    ? 'In pausa'
    : isPomodoro
      ? (isBreak ? 'Pausa' : 'Studio')
      : 'In corso'

  const totalStudiedSoFar = workSecondsTotal + (subPhase === 'work' ? elapsed : 0)

  // C'è davvero un video attivo sotto (non solo la pioggia di stelle)? Solo
  // in quel caso ha senso la card di vetro chiara e compatta.
  const showVideo = isWide && !!selectedVideo && (phase === 'running' || phase === 'paused')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(7,7,15,0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Sfondo adattivo — su schermo telefono: pioggia di stelle lenta.
          Su schermo largo: selettore di video ambiente in stile lifeat.
          Il video vero e proprio parte solo a timer avviato (vedi prop
          "active"): durante la selezione non c'è nulla di opaco che possa
          coprire la scelta di materia/pomodoro. */}
      <TimerBackground
        ringColor={ringColor}
        running={phase !== 'paused'}
        active={phase === 'running' || phase === 'paused'}
        selectedVideo={selectedVideo}
        onSelectVideo={setSelectedVideo}
      />

      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 56, right: 24,
        color: C.textMuted, fontSize: 22, lineHeight: 1,
      }}>✕</button>

      {phase === 'select' && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Sessione di studio</div>
            <div style={{ fontSize: 14, color: C.textSecondary }}>Per quale esame stai studiando?</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '34vh', overflowY: 'auto' }}>
            {unpassed.length === 0 && (
              <div style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', padding: 32 }}>
                Aggiungi esami nel profilo per iniziare.
              </div>
            )}
            {unpassed.map(exam => (
              <button key={exam.id} onClick={() => setSelectedExamId(exam.id)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: 16,
                background: selectedExamId === exam.id ? C.accentSoft : C.surface,
                border: `1px solid ${selectedExamId === exam.id ? C.accentGlow : C.border}`,
                textAlign: 'left', transition: 'all 0.18s',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{exam.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{exam.cfu} CFU</div>
                </div>
                {selectedExamId === exam.id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Tipo di timer
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(TIMER_MODES).map(([key, m]) => (
                <button key={key} onClick={() => setTimerMode(key)} style={{
                  flex: 1, padding: '12px 6px', borderRadius: 14,
                  background: timerMode === key ? C.accentSoft : C.surface,
                  border: `1px solid ${timerMode === key ? C.accentGlow : C.border}`,
                  color: timerMode === key ? C.accent : C.textSecondary,
                  fontSize: 12.5, fontWeight: 600, textAlign: 'center', transition: 'all 0.18s',
                }}>{m.label}</button>
              ))}
            </div>
            {isPomodoro && (
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
                {mode.workSecs / 60} min di studio, {mode.breakSecs / 60} min di pausa, a ciclo.
              </div>
            )}
          </div>

          <Button onClick={start} disabled={!selectedExamId}>Inizia sessione ✦</Button>
        </div>
      )}

      {(phase === 'running' || phase === 'paused') && (
        <div
          style={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: showVideo ? 14 : 28,
            width: '100%', maxWidth: showVideo ? 300 : 360,
            ...(showVideo ? {
              transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
              background: 'rgba(255,255,255,0.68)',
              border: '1px solid rgba(255,255,255,0.55)',
              backdropFilter: 'blur(22px) saturate(160%)',
              borderRadius: 24,
              padding: '10px 20px 18px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.32)',
            } : {}),
          }}
        >
          {showVideo && (
            <div
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              title="Trascina per spostare"
              style={{
                width: 40, height: 5, borderRadius: 100,
                background: 'rgba(20,16,35,0.25)',
                cursor: 'grab', touchAction: 'none', userSelect: 'none',
              }}
            />
          )}

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: showVideo ? 'rgba(20,16,35,0.55)' : C.textMuted,
            }}>
              {selectedExam?.name}
            </div>
            {isPomodoro && (
              <div style={{
                fontSize: 11, marginTop: 4, fontWeight: 600,
                color: isBreak ? (showVideo ? '#a8790a' : C.gold) : (showVideo ? '#1a5fb8' : C.accentLight),
              }}>
                {TIMER_MODES[timerMode].label}
              </div>
            )}
          </div>

          {/* Circular timer — grande di default; un filino più compatto
              quando siamo dentro alla card di vetro sopra a un video. */}
          <div style={{ position: 'relative', width: showVideo ? 180 : 220, height: showVideo ? 180 : 220 }}>
            <svg width={showVideo ? 180 : 220} height={showVideo ? 180 : 220} style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx={showVideo ? 90 : 110} cy={showVideo ? 90 : 110} r={showVideo ? 75 : 94}
                fill="none" stroke={showVideo ? 'rgba(20,16,35,0.12)' : 'rgba(255,255,255,0.1)'} strokeWidth="7"
              />
              <circle
                cx={showVideo ? 90 : 110} cy={showVideo ? 90 : 110} r={showVideo ? 75 : 94}
                fill="none" stroke={ringColor} strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s', filter: `drop-shadow(0 0 10px ${ringColor})` }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontSize: showVideo ? 40 : 52, fontWeight: 700, letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                color: showVideo
                  ? (phase === 'paused' ? 'rgba(20,16,35,0.5)' : '#18142a')
                  : (phase === 'paused' ? C.textSecondary : C.textPrimary),
                textShadow: showVideo ? 'none' : '0 2px 16px rgba(0,0,0,0.6)',
              }}>{fmt(elapsed)}</div>
              <div style={{
                fontSize: 12, marginTop: 4, fontWeight: 600,
                color: isBreak ? (showVideo ? '#a8790a' : C.gold) : (showVideo ? 'rgba(20,16,35,0.45)' : C.textMuted),
              }}>
                {phaseLabel}
              </div>
            </div>
          </div>

          {isPomodoro && (
            <div style={{
              fontSize: 12, textAlign: 'center', marginTop: showVideo ? -4 : -8,
              color: showVideo ? 'rgba(20,16,35,0.5)' : C.textMuted,
            }}>
              Studiato finora: <span style={{ color: showVideo ? '#18142a' : C.textSecondary, fontWeight: 600 }}>{fmt(totalStudiedSoFar)}</span>
            </div>
          )}

          {/* Su telefono o con la pioggia di stelle: pannello scuro con blur
              sotto ai controlli, per restare leggibile su qualunque sfondo.
              Con un video attivo: i controlli stanno già nella card chiara,
              qui bastano dimensioni un po' più contenute. */}
          <div style={showVideo ? { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' } : {
            display: 'flex', flexDirection: 'column', gap: 10, width: '100%',
            padding: 14, borderRadius: 20,
            background: 'rgba(10,10,20,0.55)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${C.border}`,
          }}>
            {phase === 'running'
              ? <Button onClick={pause} variant="secondary" style={showVideo ? { color: '#18142a', border: '1px solid rgba(20,16,35,0.2)', background: 'rgba(255,255,255,0.35)', padding: '11px 20px' } : {}}>Pausa</Button>
              : <Button onClick={resume} variant="ghost" style={showVideo ? { color: '#1a5fb8', border: `1px solid rgba(${C.accentRGB},0.35)`, background: `rgba(${C.accentRGB},0.14)`, padding: '11px 20px' } : {}}>Riprendi</Button>
            }
            <Button
              onClick={finish}
              variant="ghost"
              style={showVideo
                ? { color: '#8a6d1f', border: '1px solid rgba(138,109,31,0.35)', background: 'rgba(245,200,66,0.22)', padding: '11px 20px', fontSize: 14 }
                : { color: C.gold, border: `1px solid ${C.goldGlow}`, background: 'rgba(245,200,66,0.12)' }
              }
            >
              Termina sessione ✓
            </Button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>✦</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Sessione completata</div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 6 }}>
              {fmt(finalSeconds)} su {selectedExam?.name}
            </div>
          </div>
          <div style={{
            padding: '16px 28px', borderRadius: 16,
            background: C.accentSoft, border: `1px solid ${C.accentGlow}`,
          }}>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Polvere stellare aggiunta</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.accentLight }}>+{Math.floor(finalSeconds / 60)} min</div>
          </div>
          <Button onClick={onClose}>Torna al cielo</Button>
        </div>
      )}
    </div>
  )
}