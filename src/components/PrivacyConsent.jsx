import { C } from '../lib/theme'
import { Button } from './UI'
import PrivacyPolicyContent from './PrivacyPolicyContent'

export default function PrivacyConsent({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: C.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '56px 20px 24px' }}>
        <PrivacyPolicyContent />
      </div>

      {/* Barra fissa in basso con il pulsante di accettazione, così resta
          sempre visibile mentre l'utente scorre il testo. */}
      <div style={{
        flexShrink: 0,
        padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)',
        background: `linear-gradient(0deg, ${C.bg} 60%, transparent)`,
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
            Continuando accetti l'informativa sulla privacy qui sopra.
          </div>
          <Button onClick={onAccept}>Accetto e continuo ✦</Button>
        </div>
      </div>
    </div>
  )
}
