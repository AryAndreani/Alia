import { useState, useRef, useEffect } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import StarCanvas from '../components/StarCanvas'
import StudyTimer from '../components/StudyTimer'
import ExploreSky from '../components/ExploreSky'
import MonthlyRecap from '../components/MonthlyRecap'
import { Badge, Button } from '../components/UI'
import { getSeasonPalette } from '../lib/seasons'
import { monthKey, previousMonthDate, computeMonthStats } from '../lib/stats'

// Pattern di puntini di sfondo — molto denso, continua il "cielo" oltre la
// sezione animata. Il layer che lo usa (più sotto) ha anche una maschera
// che lo fa progressivamente sparire scendendo, per dare l'idea che i
// puntini si diradino allontanandosi dallo StarCanvas.
const dustBackground = {
  backgroundImage: `
    radial-gradient(1px 1px at 3% 6%, rgba(200,195,255,0.55), transparent),
    radial-gradient(1px 1px at 9% 34%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 15% 60%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 21% 18%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 27% 82%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 33% 44%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 39% 8%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 45% 68%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 51% 26%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 57% 90%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 63% 12%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 69% 52%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 75% 74%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 81% 30%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 87% 86%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 93% 4%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 97% 56%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 6% 96%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 18% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 44% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 60% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 78% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 90% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 12% 46%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 36% 32%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 54% 76%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 72% 20%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 84% 64%, rgba(200,195,255,0.25), transparent)
  `,
  backgroundSize: '150px 150px',
  backgroundRepeat: 'repeat',
}

// Sfumatura: densità piena appena sotto lo StarCanvas, che poi diminuisce
// man mano che ci si allontana scendendo nella pagina.
const dustFadeMask = 'linear-gradient(to bottom, black 0%, black 10%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0.05) 100%)'

// ── Punteggio del giorno — sostituisce la vecchia riga di conteggi
// esami/CFU/media, mostrando un numero unico costruito su quanto si è
// studiato e quante quest si sono completate oggi.
function ScoreCard({ todayStats }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 20,
      background: `linear-gradient(135deg, rgba(${C.accentRGB},0.12) 0%, rgba(245,200,66,0.06) 100%)`,
      border: `1px solid ${C.accentGlow}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          Punteggio di oggi
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: C.gold }}>
          {todayStats.score}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <span style={{ fontSize: 12, color: C.textSecondary }}>
          {Math.floor(todayStats.studyMins / 60)}h {todayStats.studyMins % 60}m di studio
        </span>
        <span style={{ fontSize: 12, color: C.textSecondary }}>
          {todayStats.questsDone} quest completate
        </span>
      </div>
    </div>
  )
}

// ── Album/statistiche settimanali — ora ogni card è calcolata sui dati
// reali (sessioni + quest) ed è cliccabile per aprire il dettaglio.
function AlbumStrip({ weekStats, onSelect }) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const scrollRef = useRef(null)

  // La card di oggi è l'ultima a destra — senza questo, la lista si apre
  // sempre scrollata a sinistra (il giorno più vecchio) e bisogna scorrere
  // ogni volta a mano per arrivare a oggi.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Statistiche</div>
        <div style={{ fontSize: 11, color: C.textMuted }}>tocca un giorno →</div>
      </div>
      <div ref={scrollRef} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {weekStats.map((day, i) => {
          const isToday = i === weekStats.length - 1
          const hasActivity = day.studyMins > 0 || day.questsDone > 0
          return (
            <button
              key={day.key}
              onClick={() => onSelect(day)}
              style={{
                flexShrink: 0,
                width: 88,
                borderRadius: 14,
                overflow: 'hidden',
                textAlign: 'left',
                border: `1px solid ${isToday ? C.accentGlow : C.border}`,
                background: hasActivity
                  ? `linear-gradient(160deg, #13122a 0%, #0d0c1e 100%)`
                  : 'rgba(255,255,255,0.02)',
                position: 'relative',
                transition: 'transform 0.15s',
              }}
            >
              {/* Header strip */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                padding: '8px 8px 6px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: '0.06em' }}>
                  {dayNames[day.date.getDay()]}
                </div>
                <div style={{ fontSize: 9, color: isToday ? C.accent : C.textMuted, fontWeight: isToday ? 700 : 400 }}>
                  {day.date.getDate()}
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: '10px 8px 12px', minHeight: 90, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {hasActivity ? (
                  <>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, textAlign: 'center' }}>
                      {day.score}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ fontSize: 9, color: C.textMuted }}>Studio</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.accentLight }}>{Math.floor(day.studyMins / 60)}h {day.studyMins % 60}m</div>
                      <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{day.questsDone} quest</div>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isToday ? (
                      <div style={{ fontSize: 10, color: C.accent, textAlign: 'center', lineHeight: 1.4 }}>oggi ✦</div>
                    ) : (
                      <div style={{ fontSize: 18, opacity: 0.15 }}>·</div>
                    )}
                  </div>
                )}
              </div>

              {hasActivity && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, transparent, ${C.accentGlow}, transparent)`,
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Dettaglio giorno — si apre a schermo intero quando si tocca una card
// dell'album, con il breakdown di studio per materia e le quest fatte.
function DayDetail({ day, onClose }) {
  const dateLabel = day.date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  const subjects = Object.entries(day.bySubject).sort((a, b) => b[1] - a[1])
  const maxMins = subjects.length ? subjects[0][1] : 1
  const isEmpty = day.studyMins === 0 && day.questsDone === 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(7,7,15,0.94)',
      backdropFilter: 'blur(20px)',
      overflowY: 'auto',
      padding: '56px 20px 60px',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 56, right: 24,
        color: C.textMuted, fontSize: 22, lineHeight: 1,
      }}>✕</button>

      <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, textTransform: 'capitalize' }}>{dateLabel}</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: C.gold, marginTop: 6, letterSpacing: '-0.03em' }}>
            {day.score}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>punteggio del giorno</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, padding: 14, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.accentLight }}>{Math.floor(day.studyMins / 60)}h {day.studyMins % 60}m</div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Studio</div>
          </div>
          <div style={{ flex: 1, padding: 14, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{day.questsDone}</div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Quest</div>
          </div>
        </div>

        {subjects.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Studio per materia</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjects.map(([name, mins]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.textSecondary }}>{name}</span>
                    <span style={{ color: C.textMuted }}>{mins}m</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: C.surfaceHigh, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(mins / maxMins) * 100}%`,
                      background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`,
                      borderRadius: 100,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {day.dayQuests.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quest completate</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {day.dayQuests.map(q => (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 14,
                  background: C.surface, border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 14, flex: 1 }}>{q.text}</span>
                  <Badge>{q.subject || 'Generale'}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: 14 }}>
            Nessuna attività registrata questo giorno.
          </div>
        )}
      </div>
    </div>
  )
}

function StreakCard({ streak }) {
  const flames = Math.min(streak.count, 7)
  return (
    <div style={{
      padding: '16px 18px',
      borderRadius: 18,
      background: streak.count > 0
        ? `linear-gradient(135deg, rgba(245,200,66,0.1) 0%, rgba(${C.accentRGB},0.08) 100%)`
        : C.surface,
      border: `1px solid ${streak.count > 0 ? 'rgba(245,200,66,0.25)' : C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          Streak
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: streak.count > 0 ? C.gold : C.textSecondary }}>
          {streak.count} <span style={{ fontSize: 14, fontWeight: 400 }}>giorni</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < flames ? C.gold : C.border,
            boxShadow: i < flames ? `0 0 6px ${C.goldGlow}` : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Teaser del recap mensile — sempre visibile, così l'utente sa che esiste
// anche prima che ci sia un mese concluso da raccontare. Si "sblocca"
// automaticamente al cambio di mese (vedi useEffect in Home).
function RecapTeaser() {
  const now = new Date()
  const monthLabel = now.toLocaleDateString('it-IT', { month: 'long' })
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthLabel = nextMonthDate.toLocaleDateString('it-IT', { month: 'long' })

  return (
    <div style={{
      padding: '16px 18px', borderRadius: 18,
      background: `linear-gradient(135deg, rgba(${C.accentRGB},0.08) 0%, rgba(245,200,66,0.05) 100%)`,
      border: `1px dashed ${C.border}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ fontSize: 24 }}>📊</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
          Recap di {monthLabel}
        </div>
        <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>
          In arrivo il 1° {nextMonthLabel} — <span style={{ color: C.accentLight }}>coming soon</span>
        </div>
      </div>
    </div>
  )
}

export default function Home({ onNavigate }) {
  const {
    passedExams, sessions, quests, exams, streak, todayQuote, profile, weekStats, todayStats,
    lastRecapShown, setLastRecapShown, totalCfu,
    exploreIntroSeen, setExploreIntroSeen,
  } = useApp()
  const [timerOpen, setTimerOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [recap, setRecap] = useState(null) // stats del mese, quando c'è un recap da mostrare
  const [showFirstStarBanner, setShowFirstStarBanner] = useState(false)

  const totalStudyMinutes = Math.floor(sessions.reduce((s, s2) => s + (s2.duration || 0), 0) / 60)
  const seasonPalette = getSeasonPalette()

  // Prima stella mai vista: avvisa che esiste "Explore your sky" — copre
  // sia chi non ha fatto il tour in onboarding (utenti già registrati
  // prima che questa funzione esistesse), sia chi l'ha saltato.
  useEffect(() => {
    if (!exploreIntroSeen && passedExams.length > 0) {
      setShowFirstStarBanner(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismissFirstStarBanner = () => {
    setShowFirstStarBanner(false)
    setExploreIntroSeen(true)
  }

  // Recap mensile — si apre da solo quando c'è un mese appena concluso non
  // ancora visto, e solo se in quel mese è successo davvero qualcosa (mai
  // un recap vuoto, e mai "coming soon": o è pronto con dati veri, o non
  // si vede proprio).
  useEffect(() => {
    const prevMonth = previousMonthDate()
    const prevKey = monthKey(prevMonth)
    if (lastRecapShown === prevKey) return

    const stats = computeMonthStats(prevMonth, { sessions, quests, exams })
    if (stats.hasActivity) {
      setRecap(stats)
    } else {
      // Niente da raccontare per quel mese: segna comunque come "visto"
      // così non lo si ricontrolla ogni volta che si apre la home.
      setLastRecapShown(prevKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeRecap = () => {
    if (recap) setLastRecapShown(recap.key)
    setRecap(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* ── FULLSCREEN SKY ─────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '64vh', flexShrink: 0, background: seasonPalette.skyGradient }}>
        <StarCanvas
          passedExams={passedExams}
          totalStudyMinutes={totalStudyMinutes}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {/* Top gradient overlay — header reads over sky */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(180deg, rgba(7,7,15,0.85) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '52px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Ciao, {profile.name || 'studente'} ✦
          </div>
          <button onClick={() => onNavigate('profile')} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            boxShadow: `0 0 16px ${C.accentGlow}`,
          }}>
            {(profile.name?.[0] || 'A').toUpperCase()}
          </button>
        </div>

        {/* Empty state hint */}
        {passedExams.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            paddingTop: 60,
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
              Il tuo cielo è vuoto.<br />
              <span style={{ color: C.accent }}>Aggiungi un esame passato</span> dal profilo.
            </div>
          </div>
        )}

        {/* Bottom gradient — content bleeds into sky */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(0deg, ${C.bg} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }} />

        {/* Numero leggibile — ORA è anche il pulsante che apre "Explore your
            sky": è il gesto più naturale (tocchi il riepilogo per vederne
            di più), invece di un link separato che non si leggeva come
            cliccabile. */}
        {passedExams.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 56, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
          }}>
            <button onClick={() => setExploreOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px 8px 18px', borderRadius: 100,
              background: 'rgba(10,10,20,0.45)', backdropFilter: 'blur(6px)',
              border: `1px solid ${C.border}`,
            }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>
                  {passedExams.length}
                </span>
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  {passedExams.length === 1 ? 'stella' : 'stelle'} · {totalCfu} CFU
                </span>
              </span>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.textSecondary, fontSize: 13,
              }}>›</span>
            </button>
          </div>
        )}

        {/* Start session FAB — overlaps bottom of sky, poco distacco dal numero */}
        <button onClick={() => setTimerOpen(true)} style={{
          position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '13px 28px',
          borderRadius: 100,
          background: C.accent,
          boxShadow: `0 4px 24px ${C.accentGlow}, 0 0 0 1px rgba(${C.accentRGB},0.3)`,
          color: '#fff', fontSize: 14, fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          <span style={{ fontSize: 16 }}>▶</span> Inizia sessione
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          ...dustBackground,
          WebkitMaskImage: dustFadeMask,
          maskImage: dustFadeMask,
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px 110px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Punteggio di oggi */}
          <ScoreCard todayStats={todayStats} />

          {/* Streak */}
          <StreakCard streak={streak} />

          {/* Statistiche / Album */}
          <AlbumStrip weekStats={weekStats} onSelect={setSelectedDay} />

          {/* Recap mensile — coming soon finché non c'è un mese concluso */}
          <RecapTeaser />

          {/* Quote */}
          <div style={{
            padding: '18px 20px',
            borderRadius: 18,
            background: `rgba(${C.accentRGB},0.06)`,
            border: `1px solid rgba(${C.accentRGB},0.14)`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              ✦ oggi
            </div>
            <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65, fontStyle: 'italic' }}>
              "{todayQuote}"
            </div>
          </div>

          {/* Quick nav to quests */}
          <button onClick={() => onNavigate('quests')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderRadius: 18,
            background: C.surface, border: `1px solid ${C.border}`,
            textAlign: 'left',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Quest Zone</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Cosa devi fare oggi?</div>
            </div>
            <span style={{ color: C.textMuted, fontSize: 20 }}>›</span>
          </button>

          <button onClick={() => onNavigate('panic')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderRadius: 18,
            background: 'rgba(176,110,247,0.05)', border: `1px solid rgba(176,110,247,0.15)`,
            textAlign: 'left',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#c4a0ff' }}>Panic Room</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Gestisci l'ansia pre-esame</div>
            </div>
            <span style={{ color: C.textMuted, fontSize: 20 }}>›</span>
          </button>
        </div>
      </div>

      {timerOpen && <StudyTimer onClose={() => setTimerOpen(false)} />}
      {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />}
      {exploreOpen && <ExploreSky onClose={() => setExploreOpen(false)} />}
      {recap && <MonthlyRecap stats={recap} onClose={closeRecap} />}

      {showFirstStarBanner && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          background: 'rgba(7,7,15,0.5)', backdropFilter: 'blur(3px)',
          padding: 20,
        }} onClick={dismissFirstStarBanner}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 380, borderRadius: 24, padding: '24px 22px',
              background: 'linear-gradient(160deg, #1a1638 0%, #0f0d20 100%)',
              border: `1px solid ${C.accentGlow}`,
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 10 }}>✦</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>La tua prima stella!</div>
            <div style={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.6, marginBottom: 18 }}>
              Tocca il numero sopra "Inizia sessione" per aprire il tuo cielo a schermo intero — potrai toccare ogni stella e rivedere l'esame che rappresenta.
            </div>
            <Button onClick={dismissFirstStarBanner}>Ho capito ✦</Button>
          </div>
        </div>
      )}
    </div>
  )
}