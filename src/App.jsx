import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './lib/AppContext'
import { globalCSS, dustBackground, C } from './lib/theme'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import QuestZone from './pages/QuestZone'
import PanicRoom from './pages/PanicRoom'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg,
    }}>
      <div style={{ fontSize: 40, animation: 'pulse 1.6s ease-in-out infinite' }}>✦</div>
    </div>
  )
}

// Vero, per schermi più larghi di un telefono — non la colonna da 430px in
// cui è disegnata l'app, ma la finestra del browser/dispositivo reale.
function useIsWide() {
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isWide
}

// Sfondo di polvere di stelle — SEMPRE attivo (non solo su schermi larghi):
// molte pagine (Quest, Panic Room, Profilo) non hanno un proprio sfondo e
// lasciano vedere questo, quindi deve esserci anche su telefono, non solo
// nei margini laterali del desktop.
function AppBackdrop({ isWide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: isWide
        ? `radial-gradient(ellipse at 50% 0%, #120f24 0%, ${C.bg} 62%)`
        : C.bg,
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.85, ...dustBackground }} />
    </div>
  )
}

function AppShell() {
  const { user, authLoading, dataLoading, onboarded } = useApp()
  const [tab, setTab] = useState('home')
  const isWide = useIsWide()

  if (authLoading) return <LoadingScreen />
  if (!user) return <Auth />
  if (dataLoading) return <LoadingScreen />
  if (!onboarded) return <Onboarding />

  return (
    <>
      <AppBackdrop isWide={isWide} />

      <div style={{
        maxWidth: 430,
        margin: '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        boxShadow: isWide ? '0 0 60px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {tab === 'home' && <Home onNavigate={setTab} />}
          {tab === 'quests' && <QuestZone />}
          {tab === 'panic' && <PanicRoom />}
          {tab === 'profile' && <Profile onNavigate={setTab} />}
        </div>

        <BottomNav active={tab} onNavigate={setTab} />
      </div>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <style>{globalCSS}</style>
      <AppShell />
    </AppProvider>
  )
}