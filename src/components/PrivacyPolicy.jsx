import { C } from '../lib/theme'
import PrivacyPolicyContent from './PrivacyPolicyContent'

export default function PrivacyPolicy({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: C.bg,
      overflowY: 'auto',
      padding: '56px 20px 80px',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 56, right: 24,
        color: C.textMuted, fontSize: 22, lineHeight: 1,
      }}>✕</button>

      <PrivacyPolicyContent />
    </div>
  )
}