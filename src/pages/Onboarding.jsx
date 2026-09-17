import { useState } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Button, Input } from '../components/UI'

const STEPS = ['welcome', 'profile', 'exams', 'tour']

const FEATURES = [
  { icon: '🎯', title: 'Punteggio giornaliero', text: 'Ogni minuto di studio e ogni quest completata alzano il tuo punteggio del giorno, in home.' },
  { icon: '📚', title: 'Quest per materia', text: 'Le tue attività giornaliere e i goal settimanali si collegano a un esame, per tenere traccia di dove studi di più.' },
  { icon: '⏱️', title: 'Timer libero o pomodoro', text: 'Studia con un timer libero o pomodoro 25/5 e 50/10 — su schermi grandi puoi anche scegliere uno sfondo ambiente.' },
  { icon: '🌙', title: 'Panic Room', text: 'Uno spazio separato per calmarti prima di un esame: respiro guidato, scrittura libera, nessun punteggio.' },
]

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

export default function Onboarding() {
  const { setOnboarded, setProfile, setExams, setExploreIntroSeen } = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [course, setCourse] = useState('')
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [examList, setExamList] = useState([
    { id: 1, name: '', cfu: '', grade: '' },
    { id: 2, name: '', cfu: '', grade: '' },
    { id: 3, name: '', cfu: '', grade: '' },
  ])

  const addRow = () => setExamList(l => [...l, { id: Date.now(), name: '', cfu: '', grade: '' }])
  const removeRow = (id) => setExamList(l => l.filter(r => r.id !== id))
  const updateRow = (id, field, val) => setExamList(l => l.map(r => r.id === id ? { ...r, [field]: val } : r))

  const willHaveStars = examList.some(r => {
    const g = parseInt(r.grade)
    return r.name.trim() && r.cfu && g >= 18 && g <= 31
  })

  const finish = () => {
    setProfile({ name, university, course, startYear })
    const valid = examList.filter(r => r.name.trim() && r.cfu)
    const newExams = valid.map(r => {
      const grade = parseInt(r.grade)
      const passed = grade >= 18 && grade <= 31
      return {
        id: crypto.randomUUID(),
        name: r.name.trim(),
        cfu: parseInt(r.cfu),
        passed,
        grade: passed ? grade : null,
        // Approssimato a oggi — potrai correggere la data precisa dal
        // profilo in qualsiasi momento.
        passedAt: passed ? new Date().toISOString() : null,
      }
    })
    if (newExams.length) setExams(prev => [...prev, ...newExams])
    setExploreIntroSeen(true) // il tour ha già spiegato Explore your sky
    setOnboarded(true)
  }

  const canContinueProfile = name.trim().length > 0
  const canContinueExams = examList.some(r => r.name.trim() && r.cfu)

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Ambient glow top */}
      <div style={{
        position: 'fixed', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 300,
        background: `radial-gradient(ellipse, rgba(${C.accentRGB},0.18) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto', width: '100%', padding: '0 24px 48px' }}>

        {/* Progress dots */}
        {step > 0 && step < 4 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 56, paddingBottom: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 100,
                background: i === step ? C.accent : C.border,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, textAlign: 'center', paddingTop: 80 }}>
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              {/* Star cluster */}
              <div style={{ fontSize: 64, marginBottom: 8, filter: `drop-shadow(0 0 24px rgba(${C.accentRGB},0.6))` }}>✦</div>
              <div style={{
                fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #f0f0ff, ${C.accentLight})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Alia</div>
            </div>

            <div style={{ animation: 'fadeUp 0.7s 0.1s ease both', opacity: 0 }}>
              <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.65, maxWidth: 300 }}>
                La tua triennale, raccontata come storia.
                Ogni esame diventa una stella nel tuo cielo.
              </p>
            </div>

            <div style={{ width: '100%', animation: 'fadeUp 0.7s 0.2s ease both', opacity: 0 }}>
              <Button onClick={() => setStep(1)}>Inizia il tuo percorso →</Button>
            </div>
          </div>
        )}

        {/* STEP 1 — Profile */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 32, animation: 'fadeUp 0.4s ease both' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Ciao! 👋</div>
              <div style={{ fontSize: 15, color: C.textSecondary }}>Raccontami di te per personalizzare il tuo cielo.</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Come ti chiami?</div>
                <Input placeholder="Il tuo nome" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Università</div>
                <Input placeholder="es. Politecnico di Milano" value={university} onChange={e => setUniversity(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Corso di laurea</div>
                <Input placeholder="es. Ingegneria Informatica" value={course} onChange={e => setCourse(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Anno di inizio</div>
                <Input placeholder="es. 2022" value={startYear} onChange={e => setStartYear(e.target.value)} type="number" />
              </div>
            </div>

            <Button onClick={() => setStep(2)} disabled={!canContinueProfile}>Continua →</Button>
            <button onClick={() => setStep(2)} style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>Salta per ora</button>
          </div>
        )}

        {/* STEP 2 — Exams */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 32, animation: 'fadeUp 0.4s ease both' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Piano di studi</div>
              <div style={{ fontSize: 15, color: C.textSecondary }}>
                Inserisci gli esami del tuo corso. Se ne hai già superati alcuni, aggiungi anche il voto: nasceranno subito come stelle nel tuo cielo.
              </div>
            </div>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 28px', gap: 6, paddingLeft: 4 }}>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Esame</div>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>CFU</div>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Voto</div>
              <div />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {examList.map((row) => (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 28px', gap: 6, alignItems: 'center' }}>
                  <Input
                    placeholder="Nome esame"
                    value={row.name}
                    onChange={e => updateRow(row.id, 'name', e.target.value)}
                    style={{ fontSize: 14 }}
                  />
                  <Input
                    placeholder="CFU"
                    value={row.cfu}
                    type="number"
                    onChange={e => updateRow(row.id, 'cfu', e.target.value)}
                    style={{ fontSize: 14, textAlign: 'center', padding: '13px 6px' }}
                  />
                  <Input
                    placeholder="—"
                    value={row.grade}
                    type="number"
                    onChange={e => updateRow(row.id, 'grade', e.target.value)}
                    style={{ fontSize: 14, textAlign: 'center', padding: '13px 6px' }}
                  />
                  <button onClick={() => removeRow(row.id)} style={{ color: C.textMuted, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addRow} style={{
              padding: '12px', borderRadius: 14,
              border: `1px dashed ${C.border}`,
              color: C.textMuted, fontSize: 14,
              transition: 'all 0.2s',
            }}>+ Aggiungi esame</button>

            <Button onClick={() => setStep(3)} disabled={!canContinueExams}>Continua →</Button>
            <button onClick={() => setStep(3)} style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
              Salta per ora
            </button>
          </div>
        )}

        {/* STEP 3 — Tour delle funzioni */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 32, animation: 'fadeUp 0.4s ease both' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Un giro veloce ✦</div>
              <div style={{ fontSize: 15, color: C.textSecondary }}>Ecco cosa puoi fare in Alia.</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{
                  display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 16,
                  background: C.surface, border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, color: C.textSecondary, marginTop: 2, lineHeight: 1.5 }}>{f.text}</div>
                  </div>
                </div>
              ))}

              {/* Explore your sky — testo diverso se ci sono già stelle o no */}
              <div style={{
                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 16,
                background: `rgba(${C.accentRGB},0.08)`, border: `1px solid ${C.accentGlow}`,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🔭</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Explore your sky</div>
                  <div style={{ fontSize: 12.5, color: C.textSecondary, marginTop: 2, lineHeight: 1.5 }}>
                    {willHaveStars
                      ? 'Le stelle che hai appena aggiunto ti aspettano: apri il cielo a schermo intero e tocca una stella per rivivere quell\'esame.'
                      : 'Quando supererai il tuo primo esame, la sua stella nascerà qui. Potrai aprire il cielo a schermo intero e toccarla per rivedere voto, CFU e data.'}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={finish}>Inizia il tuo viaggio ✦</Button>
          </div>
        )}
      </div>
    </div>
  )
}