import { useState } from 'react'
import { C } from '../lib/theme'

function StatCard({ emoji, value, label, gradient }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: 14, padding: '0 32px',
      background: gradient,
    }}>
      <div style={{ fontSize: 44 }}>{emoji}</div>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{label}</div>
    </div>
  )
}

export default function MonthlyRecap({ stats, onClose }) {
  const [index, setIndex] = useState(0)

  const cards = [
    {
      key: 'intro',
      gradient: 'radial-gradient(ellipse at 50% 30%, #2a1f5e 0%, #0d0a1f 75%)',
      render: () => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, padding: '0 32px' }}>
          <div style={{ fontSize: 48 }}>✦</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Il tuo</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', textTransform: 'capitalize', letterSpacing: '-0.02em' }}>{stats.monthLabel}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>Tocca per scoprire com'è andata ✦</div>
        </div>
      ),
    },
    {
      key: 'study',
      gradient: `linear-gradient(160deg, ${C.accent} 0%, #2a1f5e 100%)`,
      render: () => (
        <StatCard
          emoji="⏳"
          value={`${Math.floor(stats.studyMins / 60)}h ${stats.studyMins % 60}m`}
          label="di studio raccolti questo mese"
          gradient="none"
        />
      ),
    },
    {
      key: 'quests',
      gradient: 'linear-gradient(160deg, #4fd1c5 0%, #0d3b3f 100%)',
      render: () => (
        <StatCard emoji="🎯" value={stats.questsDone} label={stats.questsDone === 1 ? 'quest completata' : 'quest completate'} gradient="none" />
      ),
    },
    {
      key: 'stars',
      gradient: 'linear-gradient(160deg, #f5c842 0%, #6b4a0d 100%)',
      render: () => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: '0 32px' }}>
          <div style={{ fontSize: 44 }}>{stats.newStars.length > 0 ? '🌟' : '✦'}</div>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>{stats.newStars.length}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>
            {stats.newStars.length === 0 ? 'nessuna nuova stella questo mese' : stats.newStars.length === 1 ? 'nuova stella accesa' : 'nuove stelle accese'}
          </div>
          {stats.newStars.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {stats.newStars.slice(0, 4).map(e => (
                <div key={e.id} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>✦ {e.name}</div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'active',
      gradient: `linear-gradient(160deg, ${C.accentLight} 0%, #241a4d 100%)`,
      render: () => (
        <StatCard emoji="📅" value={stats.activeDays} label={stats.activeDays === 1 ? 'giorno attivo' : 'giorni attivi nel mese'} gradient="none" />
      ),
    },
    ...(stats.topSubject ? [{
      key: 'subject',
      gradient: 'linear-gradient(160deg, #f76e8f 0%, #4a1030 100%)',
      render: () => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: '0 32px' }}>
          <div style={{ fontSize: 44 }}>📖</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{stats.topSubject}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>la tua materia più studiata — {stats.topSubjectMins} min</div>
        </div>
      ),
    }] : []),
    {
      key: 'share',
      gradient: 'radial-gradient(ellipse at 50% 20%, #2a1f5e 0%, #06060e 70%)',
      render: () => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 24px' }}>
          <div style={{
            width: '100%', maxWidth: 300, borderRadius: 24, padding: '28px 22px',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize', marginBottom: 4 }}>{stats.monthLabel}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Il tuo cielo, in numeri</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['⏳', `${Math.floor(stats.studyMins / 60)}h ${stats.studyMins % 60}m`, 'studio'],
                ['🎯', stats.questsDone, 'quest'],
                ['🌟', stats.newStars.length, 'stelle'],
                ['📅', stats.activeDays, 'giorni attivi'],
              ].map(([e, v, l]) => (
                <div key={l} style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 20 }}>{e} <span style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>{v}</span></div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>✦ Alia</div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            📸 Fai uno screenshot per condividerla
          </div>
        </div>
      ),
    },
  ]

  const goNext = () => {
    if (index < cards.length - 1) setIndex(i => i + 1)
    else onClose()
  }
  const goBack = () => setIndex(i => Math.max(0, i - 1))

  const card = cards[index]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: card.gradient,
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.3s ease',
    }}>
      {/* Barre di avanzamento, stile stories */}
      <div style={{ display: 'flex', gap: 5, padding: '52px 16px 0' }}>
        {cards.map((c, i) => (
          <div key={c.key} style={{ flex: 1, height: 3, borderRadius: 100, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: i <= index ? '100%' : '0%', background: '#fff', transition: 'width 0.2s' }} />
          </div>
        ))}
      </div>

      <button onClick={onClose} style={{
        position: 'absolute', top: 56, right: 20, zIndex: 5,
        color: 'rgba(255,255,255,0.8)', fontSize: 22, lineHeight: 1,
      }}>✕</button>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {card.render()}

        {/* Zone di tap invisibili — sinistra torna indietro, destra avanti */}
        <button onClick={goBack} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%' }} aria-label="Indietro" />
        <button onClick={goNext} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '70%' }} aria-label="Avanti" />
      </div>
    </div>
  )
}
