import { useState } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Input, Button, Badge } from '../components/UI'
import { isSameDay, isSameWeek } from '../lib/stats'

const SUBJECT_COLORS = [C.accent, C.gold, '#4fd1c5', '#f76e8f', '#6ea8fe', '#f7a76e', '#9ae66e']

function subjectColor(name, allSubjects) {
  const idx = Math.max(allSubjects.indexOf(name), 0)
  return SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
}

const selectStyle = {
  width: 116,
  flexShrink: 0,
  background: C.surfaceHigh,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: '0 10px',
  color: C.textPrimary,
  fontSize: 13,
}

export default function QuestZone() {
  const { quests, addQuest, toggleQuest, deleteQuest, goals, addGoal, toggleGoal, deleteGoal, exams } = useApp()
  const [tab, setTab] = useState('quests')
  const [newQuest, setNewQuest] = useState('')
  const [newQuestSubject, setNewQuestSubject] = useState('Generale')
  const [newGoal, setNewGoal] = useState('')
  const [newGoalSubject, setNewGoalSubject] = useState('Generale')

  // Il reset riguarda solo ciò che è stato completato: una quest non fatta
  // resta visibile finché non la fai (non sparisce a mezzanotte), mentre
  // una quest fatta oggi smette di comparire da domani — stessa logica per
  // i goal su base settimanale. Niente viene mai cancellato: lo storico
  // completo resta comunque disponibile per l'album/punteggio in home.
  const todayQuests = quests.filter(q => !q.done || isSameDay(q.completedAt))
  const thisWeekGoals = goals.filter(g => !g.done || isSameWeek(g.completedAt))

  // Solo le materie ancora da passare hanno senso come "obiettivo" — un
  // esame già passato non deve più comparire tra le scelte.
  const subjectOptions = ['Generale', ...exams.filter(e => !e.passed).map(e => e.name)]

  const handleAddQuest = () => {
    if (!newQuest.trim()) return
    addQuest(newQuest.trim(), newQuestSubject)
    setNewQuest('')
  }

  const handleAddGoal = () => {
    if (!newGoal.trim()) return
    addGoal(newGoal.trim(), newGoalSubject)
    setNewGoal('')
  }

  const doneCount = todayQuests.filter(q => q.done).length
  const progress = todayQuests.length ? doneCount / todayQuests.length : 0

  return (
    <div style={{ padding: '56px 20px 110px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Quest Zone</div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Ogni quest completata aggiunge polvere stellare al tuo cielo.</div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '16px 18px', borderRadius: 18, background: C.surface, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: C.textSecondary }}>Oggi</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: progress === 1 ? C.gold : C.accent }}>
            {doneCount}/{quests.length} {progress === 1 ? '✦' : ''}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 100, background: C.surfaceHigh, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: progress === 1
              ? `linear-gradient(90deg, ${C.gold}, #ffdc70)`
              : `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`,
            width: `${progress * 100}%`,
            transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: `0 0 8px ${progress === 1 ? C.goldGlow : C.accentGlow}`,
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {[{ id: 'quests', label: 'Giornaliere' }, { id: 'goals', label: 'Settimanali' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 18px', borderRadius: 100,
              border: `1px solid ${tab === t.id ? C.accent : C.border}`,
              background: tab === t.id ? C.accentSoft : 'transparent',
              color: tab === t.id ? C.accent : C.textSecondary,
              fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: C.textMuted, paddingLeft: 2 }}>
          {tab === 'quests' ? 'Quelle completate si azzerano a mezzanotte.' : 'Quelli completati si azzerano ogni lunedì.'}
        </div>
      </div>

      {/* Quest list */}
      {tab === 'quests' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayQuests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: 14 }}>
                Nessuna quest per oggi. Aggiungine una!
              </div>
            )}
            {todayQuests.map(q => (
              <div key={q.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16,
                background: q.done ? C.accentSoft : C.surface,
                border: `1px solid ${q.done ? C.accentGlow : C.border}`,
                transition: 'all 0.2s',
              }}>
                <button onClick={() => toggleQuest(q.id)} style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${q.done ? C.accent : C.borderHigh}`,
                  background: q.done ? C.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {q.done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{
                    fontSize: 14,
                    color: q.done ? C.accent : C.textPrimary,
                    textDecoration: q.done ? 'line-through' : 'none',
                    opacity: q.done ? 0.65 : 1,
                  }}>{q.text}</span>
                  <div>
                    <Badge color={subjectColor(q.subject || 'Generale', subjectOptions)}>
                      {q.subject || 'Generale'}
                    </Badge>
                  </div>
                </div>
                <button onClick={() => deleteQuest(q.id)} style={{ color: C.textMuted, fontSize: 18, opacity: 0.5 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={newQuestSubject}
              onChange={e => setNewQuestSubject(e.target.value)}
              style={selectStyle}
            >
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="Nuova quest..." value={newQuest} onChange={e => setNewQuest(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddQuest()} />
            <button onClick={handleAddQuest} style={{
              flexShrink: 0, width: 48, height: 48, borderRadius: 14,
              background: C.accent, color: '#fff', fontSize: 22,
            }}>+</button>
          </div>
        </>
      )}

      {tab === 'goals' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thisWeekGoals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: 14 }}>
                Nessun goal questa settimana.
              </div>
            )}
            {thisWeekGoals.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16,
                background: g.done ? 'rgba(245,200,66,0.08)' : C.surface,
                border: `1px solid ${g.done ? C.goldGlow : C.border}`,
                transition: 'all 0.2s',
              }}>
                <button onClick={() => toggleGoal(g.id)} style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  border: `2px solid ${g.done ? C.gold : C.borderHigh}`,
                  background: g.done ? C.gold : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {g.done && <span style={{ color: '#09090f', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{
                    fontSize: 14,
                    color: g.done ? C.gold : C.textPrimary,
                    textDecoration: g.done ? 'line-through' : 'none',
                    opacity: g.done ? 0.65 : 1,
                  }}>{g.text}</span>
                  {g.subject && (
                    <div>
                      <Badge color={subjectColor(g.subject, subjectOptions)}>{g.subject}</Badge>
                    </div>
                  )}
                </div>
                <button onClick={() => deleteGoal(g.id)} style={{ color: C.textMuted, fontSize: 18, opacity: 0.5 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={newGoalSubject}
              onChange={e => setNewGoalSubject(e.target.value)}
              style={selectStyle}
            >
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="Nuovo goal settimanale..." value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddGoal()} />
            <button onClick={handleAddGoal} style={{
              flexShrink: 0, width: 48, height: 48, borderRadius: 14,
              background: C.gold, color: '#09090f', fontSize: 22,
            }}>+</button>
          </div>
        </>
      )}
    </div>
  )
}