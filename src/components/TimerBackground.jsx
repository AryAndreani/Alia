import { useEffect, useMemo, useState } from 'react'
import { C } from '../lib/theme'
import FallingStars from './FallingStars'
import { SPACE_COLLECTIONS } from '../lib/spaces'

function thumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

const bgCSS = `
  @keyframes timerGlowPulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50%      { opacity: 0.85; transform: translate(-50%, -50%) scale(1.1); }
  }
`

// Tecnica "cover": l'iframe è reso più grande del viewport e centrato, come
// un background-size:cover per un video. Riempie sempre tutto lo schermo,
// non si riduce mai a un player piccolo.
function VideoCoverBackground({ videoId, muted }) {
  return (
    <iframe
      key={videoId}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0`}
      title="sfondo ambiente"
      allow="autoplay; encrypted-media"
      style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '100vw', height: '56.25vw',
        minWidth: '177.78vh', minHeight: '100vh',
        transform: 'translate(-50%, -50%)',
        border: 'none', pointerEvents: 'none',
      }}
    />
  )
}

export default function TimerBackground({
  ringColor = C.accent,
  running = true,
  active = true,
  selectedVideo = null,
  onSelectVideo = () => {},
}) {
  // "Largo" = il vero viewport del browser/dispositivo, non la colonna da
  // 430px in cui è disegnata l'app — il timer è a schermo intero
  // (position: fixed, inset: 0), quindi su desktop può davvero coprire
  // tutta la larghezza della finestra.
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  const [pickerOpen, setPickerOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  const [filter, setFilter] = useState('all')
  // Parte sempre muto — i browser bloccano l'autoplay con audio quasi
  // ovunque, non è una scelta ma un vincolo tecnico (lo stesso motivo per
  // cui anche lifeat parte muto e mostra un'icona per attivare l'audio).
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    // Ogni volta che si cambia video, si riparte muti — evita che un nuovo
    // spazio scelto faccia esplodere l'audio all'improvviso.
    setMuted(true)
  }, [selectedVideo?.videoId])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => {
      setIsWide(e.matches)
      if (e.matches) {
        // Su schermi larghi il pannello si apre da solo: l'app è pensata
        // per il telefono, quindi qui è facile non aspettarsi nulla di
        // laterale e perdersi del tutto la possibilità di scegliere lo sfondo.
        setPickerOpen(true)
      } else {
        onSelectVideo(null)
        setPickerOpen(false)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleCollections = filter === 'all'
    ? SPACE_COLLECTIONS
    : SPACE_COLLECTIONS.filter(c => c.id === filter)

  const showVideo = isWide && selectedVideo && active

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{bgCSS}</style>

      {showVideo ? (
        <VideoCoverBackground videoId={selectedVideo.videoId} muted={muted} />
      ) : (
        <FallingStars running={running} />
      )}

      {/* Attiva/disattiva audio — visibile solo quando c'è davvero un video.
          Un click diretto dell'utente è ciò che permette al browser di far
          partire l'audio, quindi qui basta il toggle a farlo funzionare. */}
      {showVideo && (
        <button
          onClick={() => setMuted(m => !m)}
          title={muted ? 'Attiva audio' : 'Disattiva audio'}
          style={{
            position: 'absolute', bottom: 20, left: 20, pointerEvents: 'auto',
            width: 42, height: 42, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20,20,35,0.65)', border: `1px solid ${C.border}`,
            backdropFilter: 'blur(10px)', color: '#fff', fontSize: 17,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Bagliore che respira — solo in modalità stelle */}
      {!showVideo && (
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: 420, height: 420, borderRadius: '50%',
          background: `radial-gradient(circle, ${ringColor}30 0%, transparent 72%)`,
          filter: 'blur(6px)',
          transform: 'translate(-50%, -50%)',
          animation: 'timerGlowPulse 6s ease-in-out infinite',
          animationPlayState: running ? 'running' : 'paused',
        }} />
      )}

      {/* Selettore sfondo — solo su schermi larghi (desktop/tablet) */}
      {isWide && (
        <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'auto' }}>
          <button onClick={() => setPickerOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 20px', borderRadius: 100,
            background: 'rgba(20,20,35,0.65)', border: `1px solid ${C.border}`,
            backdropFilter: 'blur(10px)', color: C.textSecondary, fontSize: 14.5, fontWeight: 600,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          }}>
            <span>{selectedVideo ? selectedVideo.title : '✦ Pioggia di stelle'}</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{pickerOpen ? '▲' : '▼'}</span>
          </button>

          {pickerOpen && (
            <div style={{
              marginTop: 12, width: 380, maxHeight: '76vh', display: 'flex', flexDirection: 'column',
              borderRadius: 20, overflow: 'hidden',
              background: 'rgba(15,15,26,0.92)', border: `1px solid ${C.border}`,
              backdropFilter: 'blur(16px)', boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            }}>
              {/* Filtri categoria */}
              <div style={{
                display: 'flex', gap: 7, padding: '14px 14px 12px', overflowX: 'auto',
                borderBottom: `1px solid ${C.border}`, flexShrink: 0,
              }}>
                <button onClick={() => setFilter('all')} style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 100,
                  background: filter === 'all' ? C.accentSoft : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${filter === 'all' ? C.accentGlow : 'transparent'}`,
                  color: filter === 'all' ? C.accent : C.textSecondary,
                  fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
                }}>Tutti</button>
                {SPACE_COLLECTIONS.map(col => (
                  <button key={col.id} onClick={() => setFilter(col.id)} style={{
                    flexShrink: 0, padding: '7px 14px', borderRadius: 100,
                    background: filter === col.id ? C.accentSoft : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${filter === col.id ? C.accentGlow : 'transparent'}`,
                    color: filter === col.id ? C.accent : C.textSecondary,
                    fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{col.icon} {col.label}</button>
                ))}
              </div>

              {/* Griglia video */}
              <div style={{ overflowY: 'auto', padding: 12 }}>
                <button onClick={() => onSelectVideo(null)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 14, marginBottom: 10, textAlign: 'left',
                  background: !selectedVideo ? C.accentSoft : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${!selectedVideo ? C.accent : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 17 }}>✦</span>
                  <span style={{ fontSize: 13.5, color: !selectedVideo ? C.accent : C.textSecondary, fontWeight: !selectedVideo ? 600 : 400 }}>
                    Pioggia di stelle
                  </span>
                </button>

                {visibleCollections.every(c => c.videos.length === 0) && (
                  <div style={{ padding: '24px 10px', textAlign: 'center', fontSize: 13, color: C.textMuted }}>
                    Nessun video in questa categoria ancora — aggiungili in lib/spaces.js
                  </div>
                )}

                {visibleCollections.map(col => col.videos.length > 0 && (
                  <div key={col.id} style={{ marginBottom: 16 }}>
                    {filter === 'all' && (
                      <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '4px 4px 9px' }}>
                        {col.icon} {col.label}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {col.videos.map(video => {
                        const active = selectedVideo?.videoId === video.videoId
                        return (
                          <button key={video.videoId} onClick={() => onSelectVideo(video)} style={{
                            display: 'flex', flexDirection: 'column', textAlign: 'left',
                            borderRadius: 14, overflow: 'hidden',
                            border: `1.5px solid ${active ? C.accent : 'transparent'}`,
                            background: 'rgba(255,255,255,0.03)',
                          }}>
                            <div style={{
                              width: '100%', aspectRatio: '16 / 9', position: 'relative',
                              backgroundImage: `url(${thumb(video.videoId)})`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                            }}>
                              {active && (
                                <div style={{
                                  position: 'absolute', top: 7, right: 7,
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: C.accent, color: '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                                }}>✓</div>
                              )}
                            </div>
                            <div style={{ padding: '8px 10px 10px' }}>
                              <div style={{
                                fontSize: 12.5, lineHeight: 1.35,
                                color: active ? C.accent : C.textPrimary,
                                fontWeight: active ? 600 : 500,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>{video.title}</div>
                              <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 4 }}>@{video.channel}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}