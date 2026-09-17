import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Icone come piccoli componenti SVG in linea, per uno stile coerente su
// tutti e quattro i tab (invece di mischiare glifi unicode diversi tra loro).
function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="currentColor"
        d="M12 2c0 5.2 1.1 8.4 6 10-4.9 1.6-6 4.8-6 10 0-5.2-1.1-8.4-6-10 4.9-1.6 6-4.8 6-10Z"
      />
    </svg>
  )
}

function IconQuest(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.7 12.2l2.3 2.3 4.3-4.6" />
    </svg>
  )
}

function IconPanicRoom(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="currentColor"
        d="M20.2 13.6A8.4 8.4 0 1 1 10.9 4a7 7 0 0 0 9.3 9.6Z"
      />
    </svg>
  )
}

function IconProfile(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M5.2 19.6c1.4-3.4 3.9-5.1 6.8-5.1s5.4 1.7 6.8 5.1" />
    </svg>
  )
}

const NAV = [
  { id: 'home', Icon: IconSpark, label: 'Cielo' },
  { id: 'quests', Icon: IconQuest, label: 'Quest' },
  { id: 'panic', Icon: IconPanicRoom, label: 'Panic Room' },
  { id: 'profile', Icon: IconProfile, label: 'Profilo' },
]

// Curva di rimbalzo "liquida" — ripresa dal CSS fornito in precedenza.
const BOUNCE_EASE = `linear(
  0 0%, 0.6091 3.69%, 1.0259 7.24%, 1.1733 9.05%, 1.283 10.92%,
  1.3562 12.87%, 1.3948 14.95%, 1.4014 16.03%, 1.3999 17.16%,
  1.3731 19.64%, 1.3202 22.27%, 1.1394 29.39%, 1.0582 33.17%,
  0.9943 37.45%, 0.9734 39.64%, 0.9593 41.92%, 0.9505 45.08%,
  0.9517 48.7%, 0.9924 63.02%, 1.0046 71.2%, 1.0061 78.24%, 1 100%
)`

const navCSS = `
  /* ── DOCK — vetro (blur + distorsione SVG) ──────────────────────────── */
  .bn-dock-wrapper {
    position: relative;
    display: flex;
    overflow: hidden;
    border-radius: 2rem;
    box-shadow: 0 6px 6px rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.15);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  }
  .bn-dock-effect {
    position: absolute;
    z-index: 0;
    inset: 0;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    filter: url(#bn-glass-distortion);
    overflow: hidden;
    border-radius: inherit;
  }
  .bn-dock-tint {
    z-index: 1;
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04));
    border-radius: inherit;
  }
  .bn-dock-shine {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    border-radius: inherit;
    box-shadow:
      inset 2px 2px 1px 0 rgba(255,255,255,0.35),
      inset -1px -1px 1px 1px rgba(255,255,255,0.12);
  }
  .bn-dock-content {
    position: relative;
    z-index: 3;
    /* verticale ridotto → barra più bassa; orizzontale a 0 → lo spazio ai
       bordi lo crea "space-evenly" qui sotto, identico a quello tra le icone */
    padding: 8px 0;
  }

  /* ── TRACK — ospita l'indicatore, posizionato via JS in px ──────────── */
  .bn-liquid-track {
    position: relative;
    --transition: 0.45s;
    --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .bn-liquid-track:has(.bn-item:active) {
    --transition: 0.6s;
    --ease: ${BOUNCE_EASE};
  }

  .bn-liquid-indicator {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: 999px;
    z-index: 0;
    pointer-events: none;
    background: rgba(255,255,255,0.14);
    box-shadow:
      inset 1px 1px 1px 0 rgba(255,255,255,0.45),
      inset -1px -1px 1px 0 rgba(255,255,255,0.06);
    transition: left var(--transition) var(--ease), width var(--transition) var(--ease);
  }

  /* ── ITEMS — larghezza naturale, spaziatura uguale ovunque ──────────── */
  .bn-items {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-evenly; /* stesso spazio bordi ↔ icone ↔ icone */
    width: 100%;
  }
  .bn-item {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: rgba(255,255,255,.6);
    padding: 9px 14px 8px;
    border-radius: 999px;
    font-weight: 500;
    background: transparent;
    white-space: nowrap;
    transition: color 0.3s ease, transform 0.2s ease;
  }
  .bn-item:active {
    transform: scale(0.92);
  }
  .bn-item.active {
    color: #fff;
    font-weight: 700;
  }
  .bn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    filter: drop-shadow(0 0 0 transparent);
    transition: filter 0.3s ease;
  }
  .bn-item.active .bn-icon {
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
  }
  .bn-label {
    font-size: 11.5px;
    letter-spacing: 0.02em;
  }
`

export default function BottomNav({ active, onNavigate }) {
  const trackRef = useRef(null)
  const itemRefs = useRef({})
  const [indicator, setIndicator] = useState(null) // { left, width } in px

  const measure = () => {
    const track = trackRef.current
    const el = itemRefs.current[active]
    if (!track || !el) return
    const trackRect = track.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setIndicator({ left: elRect.left - trackRect.left, width: elRect.width })
  }

  // Rimisura ogni volta che cambia il tab attivo
  useLayoutEffect(() => {
    measure()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Rimisura anche al resize (rotazione schermo, resize finestra)
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      display: 'flex', justifyContent: 'center',
      padding: '0 10px calc(env(safe-area-inset-bottom, 0px) + 18px)',
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      <style>{navCSS}</style>

      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="bn-glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="bn-dock-wrapper" style={{ pointerEvents: 'auto' }}>
        <div className="bn-dock-effect" />
        <div className="bn-dock-tint" />
        <div className="bn-dock-shine" />

        <div className="bn-dock-content">
          <div className="bn-liquid-track" ref={trackRef}>
            {indicator && (
              <div
                className="bn-liquid-indicator"
                style={{ left: indicator.left, width: indicator.width }}
              />
            )}

            <div className="bn-items">
              {NAV.map(n => (
                <button
                  key={n.id}
                  ref={el => { itemRefs.current[n.id] = el }}
                  className={`bn-item${active === n.id ? ' active' : ''}`}
                  onClick={() => onNavigate(n.id)}
                >
                  <span className="bn-icon"><n.Icon /></span>
                  <span className="bn-label">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}