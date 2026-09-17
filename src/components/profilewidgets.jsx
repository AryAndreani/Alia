import { useState } from 'react'
import { C } from '../lib/theme'

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']

// Builds a cumulative CFU-per-month series from passed exams, spanning
// from the first passed exam's month up to the current month (min 4 points).
export function buildCfuSeries(doneExams) {
  const withDates = doneExams
    .filter(e => e.passedAt)
    .map(e => ({ date: new Date(e.passedAt), cfu: e.cfu || 0 }))
    .sort((a, b) => a.date - b.date)

  const now = new Date()
  let start = withDates[0]?.date ? new Date(withDates[0].date) : new Date(now.getFullYear(), now.getMonth() - 3, 1)
  start = new Date(start.getFullYear(), start.getMonth(), 1)

  const months = []
  const cursor = new Date(start)
  while (cursor <= now) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  // Always show at least 4 points so the chart doesn't look empty
  while (months.length < 4) {
    const first = months[0]
    const d = new Date(first.year, first.month - 1, 1)
    months.unshift({ year: d.getFullYear(), month: d.getMonth() })
  }

  let running = 0
  return months.map(({ year, month }) => {
    running += withDates
      .filter(e => e.date.getFullYear() === year && e.date.getMonth() === month)
      .reduce((sum, e) => sum + e.cfu, 0)
    return { label: MONTH_LABELS[month], cfu: running }
  })
}

function startOfWeek(d) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

/* ------------------------------------------------------------------ */
/* CFU trend chart (SVG line chart, no dependencies)                  */
/* ------------------------------------------------------------------ */

export function CfuTrendChart({ series, height = 130 }) {
  const width = 280
  const padding = { top: 14, right: 8, bottom: 18, left: 8 }
  const values = series.map(p => p.cfu)
  const max = Math.max(...values, 1)
  const min = 0
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const points = series.map((p, i) => {
    const x = padding.left + (series.length === 1 ? 0 : (i / (series.length - 1)) * innerW)
    const y = padding.top + innerH - ((p.cfu - min) / (max - min || 1)) * innerH
    return { x, y, ...p }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} Z`
  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cfuAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#cfuAreaFill)" />
      <path d={linePath} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5}
          fill={i === points.length - 1 ? C.accent : C.bg}
          stroke={C.accent} strokeWidth={i === points.length - 1 ? 0 : 1.5} />
      ))}

      {/* value bubble on last point */}
      <g transform={`translate(${last.x}, ${last.y - 14})`}>
        <rect x={-24} y={-14} width={48} height={20} rx={10} fill={C.accentSoft} stroke={C.accentGlow} />
        <text x={0} y={0} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.accent}>{last.cfu} CFU</text>
      </g>

      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - 2} textAnchor="middle" fontSize="9" fill={C.textMuted}>{p.label}</text>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Exam status grid (Superati / In corso / Da recuperare / Da iniziare)*/
/* ------------------------------------------------------------------ */

export function ExamStatusGrid({ exams }) {
  const passed = exams.filter(e => e.passed).length
  const inProgress = exams.filter(e => !e.passed && e.status === 'in_progress').length
  const toRetake = exams.filter(e => !e.passed && e.status === 'to_retake').length
  const notStarted = exams.filter(e => !e.passed && e.status !== 'in_progress' && e.status !== 'to_retake').length

  const items = [
    { value: passed, label: 'Superati', icon: '📋', color: '#4ade80' },
    { value: inProgress, label: 'In corso', icon: '✎', color: '#f5b942' },
    { value: toRetake, label: 'Da recuperare', icon: '⏰', color: '#f66b6b' },
    { value: notStarted, label: 'Non ancora affrontati', icon: '○', color: '#9d97c9' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {items.map(it => (
        <div key={it.label} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px', borderRadius: 14,
          background: C.surface, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: `${it.color}22`, color: it.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>{it.icon}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{it.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.2 }}>{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Small chip control to set an exam's status when it hasn't been passed yet
export function ExamStatusPicker({ status, onChange }) {
  const options = [
    { id: 'not_started', label: 'Da iniziare' },
    { id: 'in_progress', label: 'In corso' },
    { id: 'to_retake', label: 'Da recuperare' },
  ]
  const current = status || 'not_started'
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '6px 10px', borderRadius: 8, fontSize: 11,
          background: current === o.id ? C.accentSoft : 'transparent',
          border: `1px solid ${current === o.id ? C.accentGlow : C.border}`,
          color: current === o.id ? C.accent : C.textSecondary,
        }}>{o.label}</button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Weekly progress card                                               */
/* ------------------------------------------------------------------ */

export function WeeklyProgressCard({ sessions, exams }) {
  const weekStart = startOfWeek(new Date())
  const weekSessions = sessions.filter(s => s.startedAt ? new Date(s.startedAt) >= weekStart : false)

  // Fallback: if sessions don't carry a startedAt field, just show all-time totals
  const usable = weekSessions.length > 0 || sessions.every(s => !s.startedAt) ? (weekSessions.length > 0 ? weekSessions : sessions) : weekSessions

  const totalSecs = usable.reduce((a, b) => a + (b.duration || 0), 0)
  const hours = Math.floor(totalSecs / 3600)
  const mins = Math.round((totalSecs % 3600) / 60)
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  const distinctSubjects = new Set(usable.map(s => s.examId).filter(Boolean)).size

  return (
    <div style={{
      padding: 16, borderRadius: 16,
      background: C.surface, border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Questa settimana</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{timeLabel}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>Tempo di studio</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{usable.length}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>Sessioni</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{distinctSubjects}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>Materie studiate</div>
        </div>
      </div>
      {totalSecs > 0 && (
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 12,
          background: C.accentSoft, border: `1px solid ${C.accentGlow}`,
          fontSize: 12, color: C.textSecondary,
        }}>
          ✦ Stai andando alla grande! Ogni piccolo passo conta.
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Wellbeing card                                                     */
/* ------------------------------------------------------------------ */

const MOODS = ['😞', '😐', '🙂', '😄', '🤩']

export function WellbeingCard({ wellbeing, onChange, onOpenPanicRoom }) {
  const [newGoodThing, setNewGoodThing] = useState('')
  const rituals = wellbeing?.rituals || []
  const mood = wellbeing?.mood ?? null
  const goodThings = wellbeing?.goodThings || []

  const setMood = (i) => onChange({ ...wellbeing, mood: i })
  const addGoodThing = () => {
    if (!newGoodThing.trim()) return
    onChange({ ...wellbeing, goodThings: [...goodThings, newGoodThing.trim()] })
    setNewGoodThing('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Il mio benessere</div>
        {onOpenPanicRoom && (
          <button onClick={onOpenPanicRoom} style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>
            Vai alla Panic Room ›
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>Prenditi cura di te. Sei importante.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>🌿</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Rituali</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{rituals.length} salvati</div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Stato d'animo</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)} style={{
                fontSize: 14, opacity: mood === i ? 1 : 0.45,
                transform: mood === i ? 'scale(1.15)' : 'none',
                transition: 'all 0.15s',
              }}>{m}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>❤️</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Cose belle di oggi</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{goodThings.length} aggiunte</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={newGoodThing}
          onChange={e => setNewGoodThing(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoodThing()}
          placeholder="Una cosa bella successa oggi..."
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 10, fontSize: 12,
            background: C.bg, border: `1px solid ${C.border}`, color: C.textPrimary,
          }}
        />
        <button onClick={addGoodThing} style={{
          padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: C.accentSoft, border: `1px solid ${C.accentGlow}`, color: C.accent,
        }}>Aggiungi</button>
      </div>
    </div>
  )
}