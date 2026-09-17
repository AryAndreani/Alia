import { useState, useCallback, useEffect } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import StarCanvas from './StarCanvas'
import { GradeDisplay } from './UI'

function ExamMemory({ exam, studyMins, onClose }) {
  const dateLabel = exam.passedAt
    ? new Date(exam.passedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 3,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(7,7,15,0.55)', backdropFilter: 'blur(4px)',
      padding: 20,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          borderRadius: 24, padding: '26px 24px 24px',
          background: 'linear-gradient(160deg, #17162e 0%, #0e0d1c 100%)',
          border: `1px solid ${C.accentGlow}`,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          animation: 'memoryUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {exam.grade === 31 ? '✦ Supernova' : 'Memoria della stella'}
          </div>
          <button onClick={onClose} style={{ color: C.textMuted, fontSize: 18 }}>✕</button>
        </div>

        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {exam.name}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: '12px 10px', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}><GradeDisplay grade={exam.grade} /></div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginTop: 3 }}>Voto</div>
          </div>
          <div style={{ flex: 1, padding: '12px 10px', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{exam.cfu}</div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginTop: 3 }}>CFU</div>
          </div>
          <div style={{ flex: 1, padding: '12px 10px', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.accentLight }}>{Math.floor(studyMins / 60)}h{studyMins % 60}</div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginTop: 3 }}>Studiate</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: C.textSecondary }}>
          Superato il <span style={{ color: C.textPrimary, fontWeight: 500 }}>{dateLabel}</span>
        </div>
      </div>
    </div>
  )
}

export default function ExploreSky({ onClose }) {
  const { passedExams, sessions, totalCfu, starTapHintSeen, setStarTapHintSeen } = useApp()
  const [selectedExam, setSelectedExam] = useState(null)

  // Catturato in stato locale al mount: così, anche se il flag persistito
  // cambia subito (per non mostrarlo più alle prossime visite), QUESTA
  // visita resta stabile — non sparisce a metà mentre l'utente guarda.
  const [showTapHint, setShowTapHint] = useState(false)
  useEffect(() => {
    if (!starTapHintSeen && passedExams.length > 0) {
      setShowTapHint(true)
      setStarTapHintSeen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStarClick = useCallback((exam) => {
    setSelectedExam(exam)
    setShowTapHint(false)
  }, [])

  const studyMinsFor = (examId) => {
    const secs = sessions.filter(s => s.examId === examId).reduce((a, s) => a + (s.duration || 0), 0)
    return Math.floor(secs / 60)
  }

  const totalStudyMinutes = Math.floor(sessions.reduce((s, s2) => s + (s2.duration || 0), 0) / 60)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#06060e',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @keyframes memoryUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
        padding: '52px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        background: 'linear-gradient(180deg, rgba(6,6,14,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>🔭 Esplora il tuo cielo</div>
          <div style={{ fontSize: 12.5, color: C.textSecondary, marginTop: 3 }}>
            {passedExams.length > 0
              ? `${passedExams.length} stelle · ${totalCfu} CFU — tocca una stella per la sua memoria`
              : 'Il tuo cielo è ancora vuoto — supera un esame per accendere la prima stella'}
          </div>
        </div>
        <button onClick={onClose} style={{
          pointerEvents: 'auto', color: C.textMuted, fontSize: 22, lineHeight: 1, paddingTop: 2,
        }}>✕</button>
      </div>

      {/* Costellazione a schermo intero */}
      <div style={{ position: 'relative', flex: 1 }}>
        <StarCanvas
          passedExams={passedExams}
          totalStudyMinutes={totalStudyMinutes}
          onStarClick={handleStarClick}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {selectedExam && (
          <ExamMemory
            exam={selectedExam}
            studyMins={studyMinsFor(selectedExam.id)}
            onClose={() => setSelectedExam(null)}
          />
        )}

        {showTapHint && !selectedExam && (
          <div style={{
            position: 'absolute', bottom: 32, left: 20, right: 20, zIndex: 2,
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 100,
              background: 'rgba(20,20,35,0.75)', backdropFilter: 'blur(8px)',
              border: `1px solid ${C.accentGlow}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}>
              <span style={{ fontSize: 15 }}>👆</span>
              <span style={{ fontSize: 12.5, color: C.textSecondary }}>Tocca una stella per vedere il suo ricordo</span>
              <button onClick={() => setShowTapHint(false)} style={{ color: C.textMuted, fontSize: 15, marginLeft: 2 }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}