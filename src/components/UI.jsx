import { C } from '../lib/theme'

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: 20,
      ...(onClick ? { cursor: 'pointer' } : {}),
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Input({ placeholder, value, onChange, onKeyDown, type = 'text', style = {} }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        width: '100%',
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '13px 16px',
        color: C.textPrimary,
        fontSize: 15,
        colorScheme: 'dark',
        '::placeholder': { color: C.textMuted },
        ...style,
      }}
    />
  )
}

export function Button({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const variants = {
    primary: { background: C.accent, color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: C.textSecondary, border: `1px solid ${C.border}` },
    ghost: { background: C.accentSoft, color: C.accent, border: `1px solid ${C.accentGlow}` },
    gold: { background: C.gold, color: '#09090f', border: 'none' },
    danger: { background: 'rgba(255,80,80,0.12)', color: '#ff6060', border: '1px solid rgba(255,80,80,0.25)' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 20px',
        borderRadius: 16,
        fontSize: 15,
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s, transform 0.1s',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Pill({ children, active, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 18px',
      borderRadius: 100,
      border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? C.accentSoft : 'transparent',
      color: active ? C.accent : C.textSecondary,
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
      ...style,
    }}>{children}</button>
  )
}

export function Label({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      color: C.textMuted,
      ...style,
    }}>{children}</div>
  )
}

export function Divider({ style = {} }) {
  return <div style={{ height: 1, background: C.border, ...style }} />
}

export function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '3px 10px', borderRadius: 100,
      background: `${color}22`, border: `1px solid ${color}55`,
      color, fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  )
}

export function GradeDisplay({ grade }) {
  const isLode = grade === 31
  const color = grade >= 28 ? C.gold : grade >= 24 ? C.accentLight : C.textSecondary
  return (
    <span style={{ color, fontWeight: 700 }}>
      {isLode ? '30L' : grade}
    </span>
  )
}