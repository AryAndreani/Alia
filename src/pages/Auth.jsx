import { useState } from 'react'
import { C } from '../lib/theme'
import { useApp } from '../lib/AppContext'
import { Button, Input } from '../components/UI'

export default function Auth() {
  const { signUp, signIn, authError } = useApp()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  const handleSubmit = async () => {
    setLocalError('')
    if (!email.trim() || !password) {
      setLocalError('Inserisci email e password.')
      return
    }
    if (isSignup && password !== confirmPassword) {
      setLocalError('Le password non coincidono.')
      return
    }
    if (isSignup && password.length < 6) {
      setLocalError('La password deve avere almeno 6 caratteri.')
      return
    }
    setSubmitting(true)
    try {
      if (isSignup) {
        await signUp(email.trim(), password)
      } else {
        await signIn(email.trim(), password)
      }
    } catch {
      // authError è già gestito e mostrato dal context
    } finally {
      setSubmitting(false)
    }
  }

  const errorMsg = localError || authError

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{
        position: 'fixed', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 300,
        background: 'radial-gradient(ellipse, rgba(124,110,247,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        maxWidth: 380, margin: '0 auto', width: '100%', padding: '24px 24px 48px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: 48, marginBottom: 8, filter: 'drop-shadow(0 0 20px rgba(124,110,247,0.55))' }}>✦</div>
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f0f0ff, #a090ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Alia</div>
        </div>

        {/* Toggle Accedi / Registrati */}
        <div style={{
          display: 'flex', gap: 4, padding: 4, borderRadius: 16,
          background: C.surface, border: `1px solid ${C.border}`, marginBottom: 24,
        }}>
          {[{ id: 'signin', label: 'Accedi' }, { id: 'signup', label: 'Registrati' }].map(t => (
            <button key={t.id} onClick={() => { setMode(t.id); setLocalError('') }} style={{
              flex: 1, padding: '10px', borderRadius: 12,
              background: mode === t.id ? C.accentSoft : 'transparent',
              border: `1px solid ${mode === t.id ? C.accentGlow : 'transparent'}`,
              color: mode === t.id ? C.accent : C.textSecondary,
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</div>
            <Input placeholder="tu@esempio.com" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</div>
            <Input
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              onKeyDown={e => e.key === 'Enter' && !isSignup && handleSubmit()}
            />
          </div>
          {isSignup && (
            <div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Conferma password</div>
              <Input
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type="password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)',
            color: '#ff8080', fontSize: 13,
          }}>{errorMsg}</div>
        )}

        <div style={{ marginTop: 20 }}>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Attendere...' : isSignup ? 'Crea account ✦' : 'Accedi →'}
          </Button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: C.textMuted }}>
          I tuoi dati vengono salvati sul cloud e sincronizzati tra i dispositivi.
        </div>
      </div>
    </div>
  )
}