import { useState } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Input, Button } from '../components/UI'
import { isSameWeek } from '../lib/stats'
import ExamsManager from './ExamsManager'

// Andamento CFU cumulativi negli ultimi mesi — calcolato dalle date reali
// in cui gli esami sono stati superati, non un grafico decorativo.
function CfuTrendChart({ doneExams }) {
  const MONTHS_BACK = 7
  const now = new Date()
  const months = Array.from({ length: MONTHS_BACK }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1))

  const points = months.map(m => {
    const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
    const cfu = doneExams
      .filter(e => e.passedAt && new Date(e.passedAt) <= endOfMonth)
      .reduce((s, e) => s + (e.cfu || 0), 0)
    return { month: m, cfu }
  })

  const maxCfu = Math.max(...points.map(p => p.cfu), 1)
  const W = 280, H = 70, PAD = 8
  const stepX = (W - PAD * 2) / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: PAD + i * stepX,
    y: H - PAD - (p.cfu / maxCfu) * (H - PAD * 2),
    cfu: p.cfu,
  }))
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const last = coords[coords.length - 1]

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <path d={path} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} fill={i === coords.length - 1 ? C.accent : `rgba(${C.accentRGB},0.5)`} />
        ))}
      </svg>
      {last.cfu > 0 && (
        <div style={{
          position: 'absolute', top: Math.max(last.y / H * 100 - 22, -4) + '%', left: `${(last.x / W) * 100}%`,
          transform: 'translate(-50%, 0)',
          padding: '3px 9px', borderRadius: 100, background: C.accent, color: '#fff',
          fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
        }}>{last.cfu} CFU</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {points.map((p, i) => (
          <div key={i} style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>
            {p.month.toLocaleDateString('it-IT', { month: 'short' })}
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardSection({ title, action, children }) {
  return (
    <div style={{ padding: '18px 18px 20px', borderRadius: 20, background: C.surface, border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function StatChip({ icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: `${color}22`, border: `1px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{value}</div>
        <div style={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.3 }}>{label}</div>
      </div>
    </div>
  )
}

export default function Profile({ onNavigate }) {
  const {
    profile, setProfile, exams, totalCfu, sessions,
    user, logOut, todayQuote, weekStats, lastMood, gratitudeEntries,
  } = useApp()
  const [editingProfile, setEditingProfile] = useState(false)
  const [localProfile, setLocalProfile] = useState(profile)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [examsManagerOpen, setExamsManagerOpen] = useState(false)

  const saveProfile = () => {
    setProfile(localProfile)
    setEditingProfile(false)
  }

  const todoExams = exams.filter(e => !e.passed)
  const doneExams = exams.filter(e => e.passed)

  // "Totale" del piano di studi = tutti gli esami che l'utente ha inserito
  // (passati + da passare), non un numero da inventare o far inserire a
  // parte — se ha messo tutto il piano, questo È il totale vero.
  const totalCfuAll = exams.reduce((s, e) => s + (e.cfu || 0), 0)
  const pctComplete = totalCfuAll > 0 ? Math.round((totalCfu / totalCfuAll) * 100) : 0

  const inProgressCount = todoExams.filter(e => e.status === 'in_progress').length
  const toRetakeCount = todoExams.filter(e => e.status === 'to_retake').length
  const notStartedCount = todoExams.filter(e => !e.status || e.status === 'not_started').length

  const currentYear = new Date().getFullYear()
  const annoCorso = profile.startYear ? Math.min(Math.max(currentYear - parseInt(profile.startYear) + 1, 1), 6) : null

  // Progressi di questa settimana — riusa gli stessi weekStats della home.
  const weekStudyMins = weekStats.reduce((s, d) => s + d.studyMins, 0)
  const weekQuests = weekStats.reduce((s, d) => s + d.questsDone, 0)
  const weekExamsPassed = doneExams.filter(e => e.passedAt && isSameWeek(e.passedAt)).length

  const isToday = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString()
  const moodToday = lastMood && isToday(lastMood.date) ? lastMood : null
  const gratitudeToday = gratitudeEntries.filter(g => isToday(g.createdAt)).length

  return (
    <div style={{ padding: '56px 20px 110px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Il mio profilo</div>

      {/* Identity card */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 20, padding: 20,
        background: 'radial-gradient(ellipse at 80% 0%, rgba(176,110,247,0.16) 0%, transparent 60%), linear-gradient(150deg, #14112c 0%, #0d0b1c 100%)',
        border: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
          backgroundImage: 'radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 55% 60%, rgba(255,255,255,0.4), transparent)',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700,
                boxShadow: `0 0 20px ${C.accentGlow}`,
              }}>
                {(profile.name?.[0] || 'A').toUpperCase()}
              </div>
              <button onClick={() => { setLocalProfile(profile); setEditingProfile(true) }} style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 22, height: 22, borderRadius: '50%',
                background: C.surfaceHigh, border: `2px solid ${C.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
              }}>✎</button>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.name || 'Studente'}</div>
              <div style={{ fontSize: 12.5, color: C.textSecondary, marginTop: 1 }}>{profile.course || 'Corso non impostato'}</div>
              <div style={{ fontSize: 11.5, color: C.textMuted }}>{profile.university || '—'}</div>
              {annoCorso && (
                <div style={{
                  display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 100,
                  background: C.accentSoft, border: `1px solid ${C.accentGlow}`, color: C.accentLight, fontSize: 11, fontWeight: 600,
                }}>{annoCorso}° anno</div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0, maxWidth: 120 }}>
            <div style={{ fontSize: 16 }}>✦</div>
            <div style={{ fontSize: 11, color: C.textSecondary, fontStyle: 'italic', lineHeight: 1.4, marginTop: 4 }}>
              "{todayQuote}"
            </div>
          </div>
        </div>

        {editingProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, position: 'relative' }}>
            <Input placeholder="Nome" value={localProfile.name} onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))} style={{ fontSize: 14 }} />
            <Input placeholder="Università" value={localProfile.university} onChange={e => setLocalProfile(p => ({ ...p, university: e.target.value }))} style={{ fontSize: 14 }} />
            <Input placeholder="Corso di laurea" value={localProfile.course} onChange={e => setLocalProfile(p => ({ ...p, course: e.target.value }))} style={{ fontSize: 14 }} />
            <Input placeholder="Anno di inizio" type="number" value={localProfile.startYear} onChange={e => setLocalProfile(p => ({ ...p, startYear: e.target.value }))} style={{ fontSize: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={saveProfile} style={{ fontSize: 13 }}>Salva</Button>
              <Button onClick={() => setEditingProfile(false)} variant="secondary" style={{ fontSize: 13 }}>Annulla</Button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'relative' }}>
          <StatChip icon="📖" value={profile.startYear || '—'} label="Anno immatricolazione" color={C.accent} />
          <StatChip icon="🎓" value={totalCfu} label="CFU totali" color={C.gold} />
        </div>
      </div>

      {/* Il mio percorso */}
      <DashboardSection title="Il mio percorso">
        <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CFU completati</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{totalCfu}</span>
          <span style={{ fontSize: 15, color: C.textMuted }}>/ {totalCfuAll || '—'}</span>
        </div>
        {totalCfuAll > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 100, background: C.surfaceHigh, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctComplete}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`, borderRadius: 100 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.accentLight }}>{pctComplete}%</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 18 }}>
              Hai completato {doneExams.length} esami su {exams.length}
            </div>
            <CfuTrendChart doneExams={doneExams} />
          </>
        )}
        {totalCfuAll === 0 && (
          <div style={{ fontSize: 12.5, color: C.textMuted }}>
            Aggiungi il tuo piano di studi qui sotto per vedere il percorso completo.
          </div>
        )}
      </DashboardSection>

      {/* I miei esami */}
      <DashboardSection title="I miei esami" action={
        <button onClick={() => setExamsManagerOpen(true)} style={{ fontSize: 12.5, color: C.accentLight, fontWeight: 600 }}>Gestisci esami ›</button>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <StatChip icon="✓" value={doneExams.length} label="Superati" color="#4fd1a5" />
          <StatChip icon="✎" value={inProgressCount} label="In corso" color="#f0a84a" />
          <StatChip icon="↻" value={toRetakeCount} label="Da recuperare" color="#ff6b6b" />
          <StatChip icon="○" value={notStartedCount} label="Non ancora affrontati" color={C.accentLight} />
        </div>
      </DashboardSection>

      {/* I miei progressi (settimana) */}
      <DashboardSection title="I miei progressi">
        <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Questa settimana</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { value: `${Math.floor(weekStudyMins / 60)}h ${weekStudyMins % 60}m`, label: 'Tempo di studio', icon: '⏱' },
            { value: weekQuests, label: 'Task completati', icon: '✓' },
            { value: weekExamsPassed, label: 'Stelle nuove', icon: '✦' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 14, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 14px', borderRadius: 14,
          background: C.accentSoft, border: `1px solid ${C.accentGlow}`,
          fontSize: 12.5, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>✨</span> {weekStudyMins > 0 ? 'Stai andando alla grande! Ogni piccolo passo conta.' : 'Ancora nessuna sessione questa settimana — si comincia da lì.'}
        </div>
      </DashboardSection>

      {/* Il mio benessere */}
      <DashboardSection title="Il mio benessere" action={
        <button onClick={() => onNavigate?.('panic')} style={{ fontSize: 12.5, color: C.accentLight, fontWeight: 600 }}>Vai alla Panic Room ›</button>
      }>
        <div style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 16 }}>Prenditi cura di te. Sei importante.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => onNavigate?.('panic')} style={{ textAlign: 'left', padding: '12px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{moodToday ? '😊' : '🙂'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{moodToday ? moodToday.label : 'Come stai?'}</div>
            <div style={{ fontSize: 9.5, color: C.textMuted, marginTop: 1 }}>oggi</div>
          </button>
          <button onClick={() => onNavigate?.('panic')} style={{ textAlign: 'left', padding: '12px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>❤️</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{gratitudeToday}</div>
            <div style={{ fontSize: 9.5, color: C.textMuted, marginTop: 1 }}>cose belle</div>
          </button>
        </div>
      </DashboardSection>

      {/* Account section */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Account</div>
        <div style={{
          padding: 16, borderRadius: 16,
          background: C.surface, border: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 14 }}>{user?.email}</div>
          </div>

          {!confirmingLogout ? (
            <Button variant="danger" onClick={() => setConfirmingLogout(true)} style={{ fontSize: 13 }}>
              Esci
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: C.textMuted }}>Sicuro di voler uscire?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="danger" onClick={logOut} style={{ fontSize: 13 }}>Sì, esci</Button>
                <Button variant="secondary" onClick={() => setConfirmingLogout(false)} style={{ fontSize: 13 }}>Annulla</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {examsManagerOpen && <ExamsManager onClose={() => setExamsManagerOpen(false)} />}
    </div>
  )
}

