import { useState, useEffect } from 'react'
import { C } from '../lib/theme'
import { SPACE_COLLECTIONS } from '../lib/spaces'
import { useApp } from '../lib/AppContext'

const AFFIRMATIONS = [
  "You've already gotten through harder things than this.",
  "An exam doesn't define your worth.",
  "Breathe. You're more prepared than you think.",
  "Every star in your sky is a test you passed.",
  "The mind settles. The body settles. You're ready.",
  "You don't have to be perfect. You have to be present.",
]

const KIND_WORDS = [
  "You are doing better than you think.",
  "This moment is temporary.",
  "You've survived every hard day so far.",
  "It's okay to rest.",
  "You are allowed to take up space.",
  "Small steps still count as progress.",
]

const READ_CONTENT = {
  itsok: {
    title: "It's ok not to be ok",
    body: "Some days feel heavier than others, and that's completely human. You don't need to perform, fix, or explain anything right now. Just let yourself be exactly as you are — this feeling will pass, and you don't have to face it alone.",
  },
  stretch: {
    title: 'Body stretch',
    body: "Roll your shoulders back slowly, three times. Stretch your arms above your head and hold for five seconds. Gently tilt your neck side to side. Your body carries tension you don't always notice — give it thirty seconds to let go.",
  },
  reachout: {
    title: 'Reach out',
    body: "You don't have to carry this by yourself. Think of one person — a friend, a family member, a classmate — you could message right now. It doesn't need to be about the exam. Just reconnecting can help.",
  },
  memory: {
    title: 'Happy memory',
    body: 'Think of a moment you felt proud, calm, or truly happy. Picture it in detail — where you were, who was there, how it felt in your body. Let that feeling sit with you for a few breaths.',
  },
}

const QUICK_TOOLS = [
  { id: 'breathe', icon: '🫁', label: 'Breathe 1 min', sub: 'Now' },
  { id: 'itsok', icon: '💜', label: "It's ok not to be ok", sub: 'Read' },
  { id: 'grounding', icon: '🌿', label: 'Quick grounding', sub: '2 min' },
  { id: 'music', icon: '🎵', label: 'Calming music', sub: 'Listen' },
  { id: 'kindwords', icon: '⭐', label: 'Kind words', sub: 'Read' },
  { id: 'stretch', icon: '🧘', label: 'Body stretch', sub: '1 min' },
  { id: 'reachout', icon: '📞', label: 'Reach out', sub: 'Read' },
  { id: 'memory', icon: '🌟', label: 'Happy memory', sub: 'Reflect' },
]

const MOODS = [
  { id: 'verylow', emoji: '😣', label: 'Very low' },
  { id: 'low', emoji: '🙁', label: 'Low' },
  { id: 'soso', emoji: '😐', label: 'So-so' },
  { id: 'better', emoji: '🙂', label: 'Better' },
  { id: 'good', emoji: '😊', label: 'Good' },
]

function BackButton({ onBack }) {
  return (
    <button onClick={onBack} style={{ alignSelf: 'flex-start', color: C.textSecondary, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
      ← Back
    </button>
  )
}

function BreathingOrb({ phase }) {
  const scaleMap = { inhale: 1.35, hold: 1.35, exhale: 0.82 }
  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
        border: `1px solid rgba(${C.accentRGB},0.2)`,
        transform: `scale(${scaleMap[phase]})`,
        transition: `transform ${phase === 'inhale' ? 4 : phase === 'hold' ? 0.1 : 8}s cubic-bezier(0.45,0,0.55,1)`,
      }} />
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #bcdcff 0%, #4f7cc4 50%, #0e1a3a 100%)',
        boxShadow: `0 0 40px rgba(${C.accentRGB},0.4), 0 0 80px rgba(${C.accentRGB},0.2)`,
        transform: `scale(${scaleMap[phase]})`,
        transition: `transform ${phase === 'inhale' ? 4 : phase === 'hold' ? 0.1 : 8}s cubic-bezier(0.45,0,0.55,1)`,
      }} />
    </div>
  )
}

function Breathing({ onBack }) {
  const [phase, setPhase] = useState('inhale')
  const [label, setLabel] = useState('Inhale')
  const [counter, setCounter] = useState(4)

  useEffect(() => {
    const sequence = [
      { phase: 'inhale', label: 'Inhale', secs: 4 },
      { phase: 'hold', label: 'Hold', secs: 7 },
      { phase: 'exhale', label: 'Exhale', secs: 8 },
    ]
    let idx = 0
    let countdown = sequence[0].secs
    setPhase(sequence[0].phase)
    setLabel(sequence[0].label)
    setCounter(sequence[0].secs)

    const interval = setInterval(() => {
      countdown--
      setCounter(countdown)
      if (countdown <= 0) {
        idx = (idx + 1) % 3
        const next = sequence[idx]
        setPhase(next.phase)
        setLabel(next.label)
        countdown = next.secs
        setCounter(next.secs)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, paddingTop: 12 }}>
      <BackButton onBack={onBack} />
      <div style={{ fontSize: 11, color: `rgba(${C.accentRGB},0.7)`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>4-7-8 technique</div>
      <BreathingOrb phase={phase} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: '0.04em', color: C.accentLight, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: `rgba(${C.accentRGB},0.6)`, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{counter}</div>
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
        Inhale 4s · Hold 7s · Exhale 8s<br />Repeat until you feel better.
      </div>
    </div>
  )
}

function Journal({ onBack }) {
  const [text, setText] = useState('')
  const [cleared, setCleared] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BackButton onBack={onBack} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Vent it out</div>
        <div style={{ fontSize: 14, color: C.textSecondary }}>Write freely. Nothing is saved anywhere.</div>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind right now? Write without filters..."
        style={{
          width: '100%', minHeight: 220, padding: 16,
          background: `rgba(${C.accentRGB},0.05)`,
          border: `1px solid rgba(${C.accentRGB},0.15)`,
          borderRadius: 16, color: C.textPrimary, fontSize: 15,
          lineHeight: 1.65, resize: 'none',
        }}
      />
      <button onClick={() => { setText(''); setCleared(true); setTimeout(() => setCleared(false), 2500) }} style={{
        padding: '13px', borderRadius: 16,
        background: `rgba(${C.accentRGB},0.1)`, border: `1px solid rgba(${C.accentRGB},0.25)`,
        color: C.accentLight, fontSize: 14, fontWeight: 500, transition: 'all 0.3s',
      }}>
        {cleared ? '✓ Cleared — breathe' : 'Clear and let go'}
      </button>
    </div>
  )
}

function PreExam({ onBack }) {
  const [done, setDone] = useState([])
  const steps = [
    { icon: '🫁', text: 'Take 3 deep breaths. Slowly.' },
    { icon: '🧠', text: "Remember: you've studied. The work is done." },
    { icon: '💬', text: "You don't need to know everything. Show what you know." },
    { icon: '👁', text: 'Walk in calmly. Read every question all the way through.' },
    { icon: '✦', text: 'Start with what you know best. Build momentum.' },
  ]
  const toggle = (i) => setDone(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])
  const allDone = done.length === steps.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <BackButton onBack={onBack} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Pre-exam routine</div>
        <div style={{ fontSize: 14, color: C.textSecondary }}>5 minutes to get into the flow.</div>
      </div>
      {steps.map((s, i) => (
        <button key={i} onClick={() => toggle(i)} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 16px', borderRadius: 16, textAlign: 'left',
          background: done.includes(i) ? 'rgba(176,110,247,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${done.includes(i) ? 'rgba(176,110,247,0.25)' : C.border}`,
          transition: 'all 0.2s',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: done.includes(i) ? 'rgba(176,110,247,0.3)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${done.includes(i) ? '#b06ef7' : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>
            {done.includes(i) ? '✓' : s.icon}
          </div>
          <span style={{ fontSize: 14, color: done.includes(i) ? 'rgba(176,110,247,0.8)' : C.textSecondary, lineHeight: 1.5, paddingTop: 4 }}>
            {s.text}
          </span>
        </button>
      ))}
      {allDone && (
        <div style={{
          padding: '16px', borderRadius: 16, textAlign: 'center',
          background: 'rgba(176,110,247,0.12)', border: '1px solid rgba(176,110,247,0.3)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>✦</div>
          <div style={{ fontSize: 14, color: '#c4a0ff', fontWeight: 500 }}>You're ready. Go shine.</div>
        </div>
      )}
    </div>
  )
}

function Grounding({ onBack }) {
  const [done, setDone] = useState([])
  const steps = [
    { icon: '👀', title: '5 things you can see', text: 'Look around and name five things you can see right now.' },
    { icon: '✋', title: '4 things you can feel', text: 'Notice four things you can physically feel — the ground, your clothes, the air.' },
    { icon: '👂', title: '3 things you can hear', text: 'Listen for three distinct sounds around you.' },
    { icon: '👃', title: '2 things you can smell', text: 'Notice two smells, even faint ones.' },
    { icon: '👅', title: '1 thing you can taste', text: "Notice one taste in your mouth, even if it's just... nothing." },
  ]
  const toggle = (i) => setDone(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])
  const allDone = done.length === steps.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <BackButton onBack={onBack} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Quick grounding</div>
        <div style={{ fontSize: 14, color: C.textSecondary }}>The 5-4-3-2-1 technique — 2 minutes to come back to the present.</div>
      </div>
      {steps.map((s, i) => (
        <button key={i} onClick={() => toggle(i)} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 16px', borderRadius: 16, textAlign: 'left',
          background: done.includes(i) ? 'rgba(79,209,165,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${done.includes(i) ? 'rgba(79,209,165,0.3)' : C.border}`,
          transition: 'all 0.2s',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: done.includes(i) ? 'rgba(79,209,165,0.3)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${done.includes(i) ? '#4fd1a5' : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>
            {done.includes(i) ? '✓' : s.icon}
          </div>
          <div style={{ paddingTop: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: done.includes(i) ? '#4fd1a5' : C.textPrimary }}>{s.title}</div>
            <div style={{ fontSize: 12.5, color: C.textSecondary, marginTop: 3, lineHeight: 1.5 }}>{s.text}</div>
          </div>
        </button>
      ))}
      {allDone && (
        <div style={{
          padding: '16px', borderRadius: 16, textAlign: 'center',
          background: 'rgba(79,209,165,0.12)', border: '1px solid rgba(79,209,165,0.3)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🌿</div>
          <div style={{ fontSize: 14, color: '#4fd1a5', fontWeight: 500 }}>You're here. You're grounded.</div>
        </div>
      )}
    </div>
  )
}

function ReadCard({ kind, onBack }) {
  const content = READ_CONTENT[kind]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 12 }}>
      <BackButton onBack={onBack} />
      <div style={{
        padding: '28px 22px', borderRadius: 20,
        background: 'rgba(176,110,247,0.06)', border: '1px solid rgba(176,110,247,0.16)',
      }}>
        <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>{content.title}</div>
        <div style={{ fontSize: 15, lineHeight: 1.75, color: C.textSecondary }}>{content.body}</div>
      </div>
    </div>
  )
}

function KindWords({ onBack }) {
  const [index, setIndex] = useState(0)
  const next = () => setIndex(i => (i + 1) % KIND_WORDS.length)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, paddingTop: 12 }}>
      <BackButton onBack={onBack} />
      <div style={{ fontSize: 30 }}>⭐</div>
      <div style={{
        fontSize: 19, lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic',
        color: C.textPrimary, minHeight: 90, display: 'flex', alignItems: 'center', maxWidth: 280,
      }}>
        "{KIND_WORDS[index]}"
      </div>
      <button onClick={next} style={{
        padding: '12px 28px', borderRadius: 100,
        background: 'rgba(176,110,247,0.12)', border: '1px solid rgba(176,110,247,0.3)',
        color: '#c4a0ff', fontSize: 14, fontWeight: 600,
      }}>Next ✦</button>
    </div>
  )
}

function CalmingMusic({ onBack }) {
  const [playing, setPlaying] = useState(false)
  const videoId = SPACE_COLLECTIONS.find(c => c.id === 'rain')?.videos[0]?.videoId || 'b-cI-vK2Dzo'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, paddingTop: 12 }}>
      <BackButton onBack={onBack} />
      <div style={{ fontSize: 18, fontWeight: 700 }}>Calming music</div>
      <div style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
        Soft rain sounds to help you settle.
      </div>
      <button onClick={() => setPlaying(p => !p)} style={{
        width: 92, height: 92, borderRadius: '50%',
        background: playing ? C.accent : 'rgba(176,110,247,0.15)',
        border: `1px solid ${playing ? C.accent : 'rgba(176,110,247,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
        boxShadow: playing ? `0 0 30px rgba(${C.accentRGB},0.4)` : 'none',
        transition: 'all 0.25s',
      }}>
        {playing ? '⏸' : '▶'}
      </button>
      <div style={{ fontSize: 12, color: C.textMuted }}>{playing ? 'Playing...' : 'Tap to play'}</div>
      {playing && (
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0`}
          allow="autoplay; encrypted-media"
          title="calming audio"
          style={{ width: 0, height: 0, border: 'none', position: 'absolute', opacity: 0 }}
        />
      )}
    </div>
  )
}

const FEATURE_CARDS = [
  { icon: '🫁', title: 'Guided breathing', sub: '4-7-8 technique to calm down in 5 minutes', mode: 'breathe', pillLabel: '5 min', pillBg: 'rgba(240,100,130,0.14)', pillColor: '#ff8fa8' },
  { icon: '✍️', title: 'Vent it out', sub: 'Write freely — nothing is saved', mode: 'journal', pillLabel: '3 min', pillBg: 'rgba(230,160,60,0.14)', pillColor: '#f0a84a' },
  { icon: '🎯', title: 'Pre-exam routine', sub: '5 steps to get into the flow', mode: 'preexam', pillLabel: '10 min', pillBg: 'rgba(79,209,165,0.14)', pillColor: '#4fd1a5' },
]

export default function PanicRoom() {
  const { lastMood, setMoodToday, gratitudeEntries, addGratitude } = useApp()
  const [mode, setMode] = useState('home')
  const [gratitudeInput, setGratitudeInput] = useState('')
  const affirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length]

  const isToday = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString()
  const moodToday = lastMood && isToday(lastMood.date) ? lastMood : null
  const todaysGratitude = gratitudeEntries.filter(g => isToday(g.createdAt))

  const submitGratitude = () => {
    if (!gratitudeInput.trim()) return
    addGratitude(gratitudeInput)
    setGratitudeInput('')
  }

  const nextStep = () => {
    const all = ['breathe', 'journal', 'preexam', 'grounding', 'kindwords']
    setMode(all[Math.floor(Math.random() * all.length)])
  }

  return (
    <div style={{ padding: '56px 20px 110px' }}>
      {mode === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Panic Room</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>A space just for you.</div>
          </div>

          {/* Featured card — nel linguaggio visivo di Alia (gradiente/stelle)
              invece dell'illustrazione fotografica del mockup originale. */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '26px 22px', borderRadius: 20,
            background: `radial-gradient(ellipse at 30% 20%, rgba(${C.accentRGB},0.18) 0%, rgba(10,8,20,0.4) 70%), linear-gradient(160deg, #14203a 0%, #0a0d1c 100%)`,
            border: `1px solid rgba(${C.accentRGB},0.18)`,
            textAlign: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
              backgroundImage: 'radial-gradient(1px 1px at 12% 20%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 82% 15%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 65% 75%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 25% 80%, rgba(255,255,255,0.4), transparent)',
            }} />
            <div style={{ fontSize: 30, marginBottom: 12, filter: 'drop-shadow(0 0 12px rgba(245,200,66,0.5))' }}>🌙</div>
            <div style={{ fontSize: 17, lineHeight: 1.6, color: C.textPrimary, fontStyle: 'italic', position: 'relative' }}>
              "{affirmation}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '14px 0' }}>
              <div style={{ width: 30, height: 1, background: `rgba(${C.accentRGB},0.3)` }} />
              <span style={{ fontSize: 12 }}>✦</span>
              <div style={{ width: 30, height: 1, background: `rgba(${C.accentRGB},0.3)` }} />
            </div>
            <div style={{ fontSize: 13, color: C.accentLight, fontWeight: 500, position: 'relative' }}>Breathe. You're safe.</div>
          </div>

          {/* Quick tools — sempre tutte visibili, centrate */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What do you need right now?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              {QUICK_TOOLS.map(t => (
                <button key={t.id} onClick={() => setMode(t.id)} style={{
                  width: 76, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>{t.icon}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, textAlign: 'center', lineHeight: 1.3 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main features */}
          {FEATURE_CARDS.map(item => (
            <button key={item.mode} onClick={() => setMode(item.mode)} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 20px', borderRadius: 20,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 26 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.sub}</div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: item.pillBg, color: item.pillColor, whiteSpace: 'nowrap',
              }}>{item.pillLabel}</span>
              <span style={{ color: C.textMuted, fontSize: 20 }}>›</span>
            </button>
          ))}

          {/* Mood check-in */}
          <div style={{
            padding: '18px 20px', borderRadius: 20,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>How are you feeling right now?</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3, marginBottom: 16 }}>It's normal not to always be okay.</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMoodToday(m.id, m.label)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  opacity: moodToday && moodToday.id !== m.id ? 0.4 : 1, transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', fontSize: 22,
                    background: moodToday?.id === m.id ? 'rgba(176,110,247,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${moodToday?.id === m.id ? '#b06ef7' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{m.emoji}</div>
                  <div style={{ fontSize: 9.5, color: C.textMuted }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cose belle di oggi — piccolo diario di gratitudine */}
          <div style={{
            padding: '18px 20px', borderRadius: 20,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Good things today</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3, marginBottom: 14 }}>
              {todaysGratitude.length === 0 ? 'Even small things count.' : `${todaysGratitude.length} added today`}
            </div>
            {todaysGratitude.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {todaysGratitude.map(g => (
                  <div key={g.id} style={{ fontSize: 13, color: C.textSecondary, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#ff8fa8' }}>♡</span> {g.text}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={gratitudeInput}
                onChange={e => setGratitudeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitGratitude()}
                placeholder="Something good that happened..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '10px 14px', color: C.textPrimary, fontSize: 13,
                }}
              />
              <button onClick={submitGratitude} style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'rgba(176,110,247,0.15)', border: '1px solid rgba(176,110,247,0.3)',
                color: '#c4a0ff', fontSize: 18,
              }}>+</button>
            </div>
          </div>

          {/* Bottom nudge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 18px', borderRadius: 20,
            background: 'rgba(176,110,247,0.08)', border: '1px solid rgba(176,110,247,0.2)',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
            <div style={{ flex: 1, fontSize: 12.5, color: C.textSecondary, lineHeight: 1.5 }}>
              You don't have to fix everything today. Just take the next step.
            </div>
          </div>
          <button onClick={nextStep} style={{
            padding: '13px', borderRadius: 16,
            background: C.accent, color: '#fff', fontSize: 14, fontWeight: 600,
          }}>Tell me the next step</button>
        </div>
      )}

      {mode === 'breathe' && <Breathing onBack={() => setMode('home')} />}
      {mode === 'journal' && <Journal onBack={() => setMode('home')} />}
      {mode === 'preexam' && <PreExam onBack={() => setMode('home')} />}
      {mode === 'grounding' && <Grounding onBack={() => setMode('home')} />}
      {mode === 'kindwords' && <KindWords onBack={() => setMode('home')} />}
      {mode === 'music' && <CalmingMusic onBack={() => setMode('home')} />}
      {(mode === 'itsok' || mode === 'stretch' || mode === 'reachout' || mode === 'memory') && (
        <ReadCard kind={mode} onBack={() => setMode('home')} />
      )}
    </div>
  )
}