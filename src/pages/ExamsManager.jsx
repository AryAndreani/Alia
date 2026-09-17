import { useState } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Input, Button, GradeDisplay } from '../components/UI'

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

function toISODate(dateLike) {
  if (!dateLike) return todayISODate()
  return new Date(dateLike).toISOString().slice(0, 10)
}

const STATUS_OPTIONS = [
  { id: 'not_started', label: 'Non affrontato' },
  { id: 'in_progress', label: 'In corso' },
  { id: 'to_retake', label: 'Da recuperare' },
]

function ExamRow({ exam, onPass, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [cfu, setCfu] = useState(String(exam.cfu ?? ''))
  const [grade, setGrade] = useState(exam.grade ? String(exam.grade) : '')
  const [date, setDate] = useState(toISODate(exam.passedAt))

  const openEdit = () => {
    setCfu(String(exam.cfu ?? ''))
    setGrade(exam.grade ? String(exam.grade) : '')
    setDate(toISODate(exam.passedAt))
    setExpanded(e => !e)
  }

  const handleSaveCfuOnly = () => {
    const c = parseInt(cfu)
    if (!c || c === exam.cfu) return
    onUpdate(exam.id, { cfu: c })
  }

  const handlePass = () => {
    const g = parseInt(grade)
    if (!g || g < 18 || g > 31) return
    const c = parseInt(cfu)
    const isoDate = new Date(date).toISOString()
    if (c && c !== exam.cfu) onUpdate(exam.id, { cfu: c })
    onPass(exam.id, g, isoDate)
    setExpanded(false)
  }

  const handleUpdate = () => {
    const g = parseInt(grade)
    if (!g || g < 18 || g > 31) return
    const c = parseInt(cfu)
    const isoDate = new Date(date).toISOString()
    onUpdate(exam.id, { grade: g, passedAt: isoDate, ...(c ? { cfu: c } : {}) })
    setExpanded(false)
  }

  return (
    <div style={{
      borderRadius: 16,
      background: exam.passed ? `rgba(${C.accentRGB},0.07)` : C.surface,
      border: `1px solid ${exam.passed ? C.accentGlow : C.border}`,
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <button onClick={openEdit} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', textAlign: 'left',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: exam.passed ? C.accentSoft : 'transparent',
          border: `1.5px solid ${exam.passed ? C.accent : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12,
        }}>
          {exam.passed ? '✦' : '○'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{exam.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
            {exam.cfu} CFU
            {exam.passed && exam.passedAt && (
              <span style={{ marginLeft: 8 }}>· {new Date(exam.passedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
            )}
            {!exam.passed && exam.status && exam.status !== 'not_started' && (
              <span style={{ marginLeft: 8, color: exam.status === 'to_retake' ? '#ff8080' : '#f0a84a' }}>
                · {STATUS_OPTIONS.find(s => s.id === exam.status)?.label}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {exam.passed && exam.grade && <GradeDisplay grade={exam.grade} />}
          <span style={{ color: C.textMuted, fontSize: 18, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 1, background: C.border, marginBottom: 4 }} />

          {!exam.passed && (
            <>
              <div style={{ fontSize: 12, color: C.textMuted }}>A che punto sei?</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.id} onClick={() => onUpdate(exam.id, { status: s.id })} style={{
                    padding: '6px 12px', borderRadius: 100,
                    background: (exam.status || 'not_started') === s.id ? C.accentSoft : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${(exam.status || 'not_started') === s.id ? C.accentGlow : C.border}`,
                    color: (exam.status || 'not_started') === s.id ? C.accent : C.textSecondary,
                    fontSize: 12, fontWeight: 500,
                  }}>{s.label}</button>
                ))}
              </div>
              <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
            </>
          )}

          <div style={{ fontSize: 12, color: C.textMuted }}>CFU</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={cfu}
              type="number"
              onChange={e => setCfu(e.target.value)}
              style={{ fontSize: 14 }}
            />
            <button onClick={handleSaveCfuOnly} style={{
              flexShrink: 0, padding: '0 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
              color: C.textSecondary, fontSize: 13, fontWeight: 600,
            }}>Salva</button>
          </div>

          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
            {exam.passed ? 'Modifica voto e data' : 'Inserisci voto e data per aggiungere la stella ✦'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="Voto (18–31 per 30L)"
              value={grade}
              type="number"
              onChange={e => setGrade(e.target.value)}
              style={{ fontSize: 14 }}
            />
            <Input
              value={date}
              type="date"
              onChange={e => setDate(e.target.value)}
              style={{ fontSize: 14, maxWidth: 150 }}
            />
          </div>
          <button onClick={exam.passed ? handleUpdate : handlePass} style={{
            padding: '10px', borderRadius: 12,
            background: C.accent, color: '#fff', fontSize: 13, fontWeight: 600,
          }}>{exam.passed ? 'Salva modifiche' : 'Aggiungi la stella ✦'}</button>
          <button onClick={() => onDelete(exam.id)} style={{ fontSize: 12, color: 'rgba(255,80,80,0.5)', textAlign: 'left' }}>
            Rimuovi esame
          </button>
        </div>
      )}
    </div>
  )
}

export default function ExamsManager({ onClose }) {
  const { exams, addExam, passExam, updateExam, setExams, sessions } = useApp()
  const [addingExam, setAddingExam] = useState(false)
  const [newExam, setNewExam] = useState({ name: '', cfu: '' })
  const [tab, setTab] = useState('todo')

  const handleAddExam = () => {
    if (!newExam.name.trim() || !newExam.cfu) return
    addExam({ name: newExam.name.trim(), cfu: parseInt(newExam.cfu) })
    setNewExam({ name: '', cfu: '' })
    setAddingExam(false)
  }

  const handleDelete = (id) => {
    setExams(prev => prev.filter(e => e.id !== id))
  }

  const todoExams = exams.filter(e => !e.passed)
  const doneExams = exams.filter(e => e.passed)

  const examStudyMins = (examId) => {
    const secs = sessions.filter(s => s.examId === examId).reduce((a, b) => a + (b.duration || 0), 0)
    return Math.floor(secs / 60)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: C.bg, overflowY: 'auto' }}>
      <div style={{ padding: '56px 20px 110px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 430, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onClose} style={{ color: C.textSecondary, fontSize: 20 }}>←</button>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Esami</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ id: 'todo', label: `Da passare (${todoExams.length})` }, { id: 'passed', label: `Passati (${doneExams.length})` }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '8px 14px', borderRadius: 10,
                background: tab === t.id ? C.accentSoft : 'transparent',
                border: `1px solid ${tab === t.id ? C.accentGlow : C.border}`,
                color: tab === t.id ? C.accent : C.textSecondary,
                fontSize: 12, fontWeight: 500,
                transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>
          <button onClick={() => setAddingExam(true)} style={{
            padding: '7px 14px', borderRadius: 10,
            background: C.accentSoft, border: `1px solid ${C.accentGlow}`,
            color: C.accent, fontSize: 12, fontWeight: 600,
          }}>+ Aggiungi</button>
        </div>

        {addingExam && (
          <div style={{ padding: 16, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input placeholder="Nome esame" value={newExam.name} onChange={e => setNewExam(n => ({ ...n, name: e.target.value }))} />
            <Input placeholder="CFU" type="number" value={newExam.cfu} onChange={e => setNewExam(n => ({ ...n, cfu: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleAddExam} style={{ fontSize: 13 }}>Aggiungi</Button>
              <Button onClick={() => setAddingExam(false)} variant="secondary" style={{ fontSize: 13 }}>Annulla</Button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tab === 'todo' && todoExams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: 14 }}>
              Tutti gli esami passati! 🎉
            </div>
          )}
          {tab === 'passed' && doneExams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: 14 }}>
              Nessun esame passato ancora.<br />
              <span style={{ fontSize: 12 }}>Tocca un esame per inserire voto e data.</span>
            </div>
          )}

          {(tab === 'todo' ? todoExams : doneExams).map(exam => (
            <div key={exam.id}>
              <ExamRow exam={exam} onPass={passExam} onUpdate={updateExam} onDelete={handleDelete} />
              {tab === 'passed' && (
                <div style={{ padding: '6px 16px 0', fontSize: 11, color: C.textMuted }}>
                  {examStudyMins(exam.id) > 0 && `${examStudyMins(exam.id)} min studiati`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}